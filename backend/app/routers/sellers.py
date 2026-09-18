"""Seller API routes for onboarding and listing management."""

import re
import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.auth import CurrentUser, get_current_user
from app.database import get_db
from app.models.product import Product, ProductCreate, ProductStatus, ProductUpdate
from app.models.user import Seller, SellerCreate, SellerResponse, SellerUpdate

router = APIRouter()


def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title."""
    # Convert to lowercase
    slug = title.lower()
    # Replace spaces and special chars with hyphens
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[-\s]+", "-", slug)
    # Remove leading/trailing hyphens
    slug = slug.strip("-")
    return slug


async def get_seller_for_user(
    user: CurrentUser,
    db: AsyncIOMotorDatabase,
) -> dict | None:
    """Get seller document for the current user."""
    return await db.sellers.find_one({"userId": user.user_id})


async def require_seller(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """Dependency that requires the user to be a seller."""
    seller = await get_seller_for_user(user, db)
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a seller to access this resource. Complete seller onboarding first.",
        )
    return seller


# ============ Seller Onboarding ============


@router.post("/sellers", status_code=status.HTTP_201_CREATED)
async def create_seller_account(
    seller_data: SellerCreate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> SellerResponse:
    """
    Create a seller account for the current user.
    
    Users can only have one seller account.
    """
    # Check if user already has a seller account
    existing = await db.sellers.find_one({"userId": user.user_id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a seller account",
        )
    
    # Check if store name is unique
    existing_store = await db.sellers.find_one({"storeName": seller_data.store_name})
    if existing_store:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Store name is already taken",
        )
    
    now = datetime.now(timezone.utc)
    seller_doc = {
        "_id": f"seller_{uuid.uuid4().hex[:12]}",
        "userId": user.user_id,
        "storeName": seller_data.store_name,
        "displayName": seller_data.display_name,
        "contactEmail": seller_data.contact_email,
        "createdAt": now,
    }
    
    await db.sellers.insert_one(seller_doc)
    
    # Check if seller is also an advertiser
    advertiser = await db.advertisers.find_one({"sellerId": seller_doc["_id"]})
    
    return SellerResponse(
        id=seller_doc["_id"],
        userId=seller_doc["userId"],
        storeName=seller_doc["storeName"],
        displayName=seller_doc["displayName"],
        contactEmail=seller_doc["contactEmail"],
        createdAt=seller_doc["createdAt"],
        isAdvertiser=advertiser is not None,
    )


@router.get("/sellers/me")
async def get_my_seller_profile(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> SellerResponse:
    """
    Get the current user's seller profile.
    
    Returns 404 if the user is not a seller.
    """
    seller = await get_seller_for_user(user, db)
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You do not have a seller account",
        )
    
    # Check if seller is also an advertiser
    advertiser = await db.advertisers.find_one({"sellerId": seller["_id"]})
    
    return SellerResponse(
        id=seller["_id"],
        userId=seller["userId"],
        storeName=seller["storeName"],
        displayName=seller["displayName"],
        contactEmail=seller["contactEmail"],
        createdAt=seller["createdAt"],
        isAdvertiser=advertiser is not None,
    )


@router.patch("/sellers/me")
async def update_my_seller_profile(
    update_data: SellerUpdate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> SellerResponse:
    """
    Update the current user's seller profile.
    """
    seller = await get_seller_for_user(user, db)
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You do not have a seller account",
        )
    
    # Build update dict with only provided fields
    update_dict = {}
    if update_data.store_name is not None:
        # Check if new store name is unique
        existing = await db.sellers.find_one({
            "storeName": update_data.store_name,
            "_id": {"$ne": seller["_id"]},
        })
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Store name is already taken",
            )
        update_dict["storeName"] = update_data.store_name
    
    if update_data.display_name is not None:
        update_dict["displayName"] = update_data.display_name
    
    if update_data.contact_email is not None:
        update_dict["contactEmail"] = update_data.contact_email
    
    if update_dict:
        await db.sellers.update_one(
            {"_id": seller["_id"]},
            {"$set": update_dict},
        )
        # Refresh seller data
        seller = await db.sellers.find_one({"_id": seller["_id"]})
    
    # Check if seller is also an advertiser
    advertiser = await db.advertisers.find_one({"sellerId": seller["_id"]})
    
    return SellerResponse(
        id=seller["_id"],
        userId=seller["userId"],
        storeName=seller["storeName"],
        displayName=seller["displayName"],
        contactEmail=seller["contactEmail"],
        createdAt=seller["createdAt"],
        isAdvertiser=advertiser is not None,
    )


# ============ Seller Listings ============


@router.get("/seller/listings")
async def list_seller_products(
    seller: Annotated[dict, Depends(require_seller)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None, pattern="^(draft|published)$"),
) -> dict:
    """
    List the current seller's products.
    
    Includes both draft and published products.
    """
    query = {"sellerId": seller["_id"]}
    if status:
        query["status"] = status
    
    # Get total count
    total = await db.products.count_documents(query)
    
    # Calculate pagination
    skip = (page - 1) * limit
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    
    # Fetch products
    cursor = db.products.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    products = []
    async for doc in cursor:
        products.append({
            "id": doc["_id"],
            "slug": doc["slug"],
            "title": doc["title"],
            "brand": doc.get("brand"),
            "categoryId": doc["categoryId"],
            "priceCents": doc["priceCents"],
            "listPriceCents": doc.get("listPriceCents"),
            "images": doc.get("images", []),
            "mainImage": doc["images"][0] if doc.get("images") else None,
            "stock": doc.get("stock", 0),
            "status": doc["status"],
            "ratingAvg": doc.get("ratingAvg"),
            "ratingCount": doc.get("ratingCount", 0),
            "createdAt": doc["createdAt"].isoformat() if isinstance(doc["createdAt"], datetime) else doc["createdAt"],
            "updatedAt": doc["updatedAt"].isoformat() if isinstance(doc["updatedAt"], datetime) else doc["updatedAt"],
        })
    
    return {
        "products": products,
        "page": page,
        "limit": limit,
        "total": total,
        "totalPages": total_pages,
    }


@router.post("/seller/listings", status_code=status.HTTP_201_CREATED)
async def create_product_listing(
    product: ProductCreate,
    seller: Annotated[dict, Depends(require_seller)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """
    Create a new product listing.
    
    Requires an active seller account.
    Products start in draft status by default.
    """
    now = datetime.now(timezone.utc)
    
    # Generate slug from title if not provided or ensure uniqueness
    base_slug = product.slug if product.slug else generate_slug(product.title)
    slug = base_slug
    
    # Check for slug conflicts and make unique
    counter = 1
    while True:
        existing = await db.products.find_one({"slug": slug})
        if not existing:
            break
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    product_doc = {
        "_id": f"prod_{uuid.uuid4().hex[:12]}",
        "slug": slug,
        "title": product.title,
        "brand": product.brand,
        "categoryId": product.category_id,
        "priceCents": product.price_cents,
        "listPriceCents": product.list_price_cents,
        "images": product.images,
        "bullets": product.bullets,
        "description": product.description,
        "attributes": product.attributes,
        "stock": product.stock,
        "sellerId": seller["_id"],
        "status": product.status.value,
        "ratingAvg": None,
        "ratingCount": 0,
        "createdAt": now,
        "updatedAt": now,
    }
    
    await db.products.insert_one(product_doc)
    
    return {
        "id": product_doc["_id"],
        "slug": product_doc["slug"],
        "title": product_doc["title"],
        "brand": product_doc["brand"],
        "categoryId": product_doc["categoryId"],
        "priceCents": product_doc["priceCents"],
        "listPriceCents": product_doc["listPriceCents"],
        "images": product_doc["images"],
        "bullets": product_doc["bullets"],
        "description": product_doc["description"],
        "attributes": product_doc["attributes"],
        "stock": product_doc["stock"],
        "sellerId": product_doc["sellerId"],
        "status": product_doc["status"],
        "createdAt": product_doc["createdAt"].isoformat(),
        "updatedAt": product_doc["updatedAt"].isoformat(),
    }


@router.get("/seller/listings/{product_id}")
async def get_seller_listing(
    product_id: str,
    seller: Annotated[dict, Depends(require_seller)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """
    Get a single product listing.
    
    Only returns products owned by the current seller.
    """
    product = await db.products.find_one({
        "_id": product_id,
        "sellerId": seller["_id"],
    })
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found or you don't have access to it",
        )
    
    return {
        "id": product["_id"],
        "slug": product["slug"],
        "title": product["title"],
        "brand": product.get("brand"),
        "categoryId": product["categoryId"],
        "priceCents": product["priceCents"],
        "listPriceCents": product.get("listPriceCents"),
        "images": product.get("images", []),
        "bullets": product.get("bullets", []),
        "description": product.get("description"),
        "attributes": product.get("attributes", {}),
        "stock": product.get("stock", 0),
        "sellerId": product["sellerId"],
        "status": product["status"],
        "ratingAvg": product.get("ratingAvg"),
        "ratingCount": product.get("ratingCount", 0),
        "createdAt": product["createdAt"].isoformat() if isinstance(product["createdAt"], datetime) else product["createdAt"],
        "updatedAt": product["updatedAt"].isoformat() if isinstance(product["updatedAt"], datetime) else product["updatedAt"],
    }


@router.patch("/seller/listings/{product_id}")
async def update_product_listing(
    product_id: str,
    update: ProductUpdate,
    seller: Annotated[dict, Depends(require_seller)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """
    Update a product listing.
    
    Only the owning seller can update a product.
    """
    product = await db.products.find_one({
        "_id": product_id,
        "sellerId": seller["_id"],
    })
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found or you don't have access to it",
        )
    
    # Build update dict with only provided fields
    update_dict = {"updatedAt": datetime.now(timezone.utc)}
    
    if update.title is not None:
        update_dict["title"] = update.title
    if update.brand is not None:
        update_dict["brand"] = update.brand
    if update.category_id is not None:
        update_dict["categoryId"] = update.category_id
    if update.price_cents is not None:
        update_dict["priceCents"] = update.price_cents
    if update.list_price_cents is not None:
        update_dict["listPriceCents"] = update.list_price_cents
    if update.images is not None:
        update_dict["images"] = update.images
    if update.bullets is not None:
        update_dict["bullets"] = update.bullets
    if update.description is not None:
        update_dict["description"] = update.description
    if update.attributes is not None:
        update_dict["attributes"] = update.attributes
    if update.stock is not None:
        update_dict["stock"] = update.stock
    if update.status is not None:
        update_dict["status"] = update.status.value
    
    await db.products.update_one(
        {"_id": product_id},
        {"$set": update_dict},
    )
    
    # Fetch updated product
    updated = await db.products.find_one({"_id": product_id})
    
    return {
        "id": updated["_id"],
        "slug": updated["slug"],
        "title": updated["title"],
        "brand": updated.get("brand"),
        "categoryId": updated["categoryId"],
        "priceCents": updated["priceCents"],
        "listPriceCents": updated.get("listPriceCents"),
        "images": updated.get("images", []),
        "bullets": updated.get("bullets", []),
        "description": updated.get("description"),
        "attributes": updated.get("attributes", {}),
        "stock": updated.get("stock", 0),
        "sellerId": updated["sellerId"],
        "status": updated["status"],
        "ratingAvg": updated.get("ratingAvg"),
        "ratingCount": updated.get("ratingCount", 0),
        "createdAt": updated["createdAt"].isoformat() if isinstance(updated["createdAt"], datetime) else updated["createdAt"],
        "updatedAt": updated["updatedAt"].isoformat() if isinstance(updated["updatedAt"], datetime) else updated["updatedAt"],
    }


@router.delete("/seller/listings/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_listing(
    product_id: str,
    seller: Annotated[dict, Depends(require_seller)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> None:
    """
    Delete a product listing.
    
    Cannot delete if there are orders referencing this product.
    Only the owning seller can delete a product.
    """
    product = await db.products.find_one({
        "_id": product_id,
        "sellerId": seller["_id"],
    })
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found or you don't have access to it",
        )
    
    # Check if any orders reference this product
    order_with_product = await db.orders.find_one({
        "items.productId": product_id,
    })
    
    if order_with_product:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete product with existing orders. Consider unpublishing it instead.",
        )
    
    # Check if product is in any carts (optional cleanup)
    # We can proceed with delete, carts will handle missing products gracefully
    
    await db.products.delete_one({"_id": product_id})


# ============ Seller Dashboard Stats ============


@router.get("/seller/stats")
async def get_seller_stats(
    seller: Annotated[dict, Depends(require_seller)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """
    Get dashboard statistics for the current seller.
    """
    seller_id = seller["_id"]
    
    # Count products by status
    total_listings = await db.products.count_documents({"sellerId": seller_id})
    published_count = await db.products.count_documents({
        "sellerId": seller_id,
        "status": "published",
    })
    draft_count = await db.products.count_documents({
        "sellerId": seller_id,
        "status": "draft",
    })
    
    # Count orders containing seller's products
    orders_cursor = db.orders.find({"items.sellerId": seller_id})
    total_orders = 0
    total_revenue_cents = 0
    async for order in orders_cursor:
        total_orders += 1
        for item in order.get("items", []):
            if item.get("sellerId") == seller_id:
                total_revenue_cents += item.get("priceCents", 0) * item.get("quantity", 0)
    
    # Get low stock products (< 10 units)
    low_stock_count = await db.products.count_documents({
        "sellerId": seller_id,
        "stock": {"$lt": 10, "$gt": 0},
    })
    
    # Get out of stock products
    out_of_stock_count = await db.products.count_documents({
        "sellerId": seller_id,
        "stock": 0,
    })
    
    return {
        "totalListings": total_listings,
        "publishedCount": published_count,
        "draftCount": draft_count,
        "totalOrders": total_orders,
        "totalRevenueCents": total_revenue_cents,
        "lowStockCount": low_stock_count,
        "outOfStockCount": out_of_stock_count,
    }


# ============ Image Upload ============


@router.post("/seller/listings/upload-url")
async def get_upload_url(
    seller: Annotated[dict, Depends(require_seller)],
) -> dict:
    """
    Get a presigned URL for image upload.
    
    For now, returns a placeholder approach since Supabase Storage
    integration would require additional setup.
    
    In production, this would generate a signed URL for Supabase Storage.
    """
    # Generate a unique filename
    file_id = uuid.uuid4().hex
    
    # For now, return instructions for image handling
    # In production, this would integrate with Supabase Storage
    return {
        "message": "Image upload placeholder",
        "instructions": "Upload images to your preferred CDN and provide URLs in the images array when creating/updating listings",
        "suggestedFilename": f"product_{file_id}.jpg",
        # Placeholder URL format - would be actual presigned URL in production
        "uploadUrl": None,
        "publicUrl": f"https://your-cdn.com/products/{file_id}.jpg",
    }
