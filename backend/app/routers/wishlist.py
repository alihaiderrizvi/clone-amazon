"""Wishlist API routes."""

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.auth import CurrentUser, get_current_user
from app.database import get_db
from app.models.cart import ProductSnapshot
from app.models.wishlist import (
    WishlistItemCreate,
    WishlistItemResponse,
    WishlistResponse,
)

router = APIRouter()


async def _get_product(db: AsyncIOMotorDatabase, product_id: str) -> dict | None:
    """Get a product by ID."""
    return await db.products.find_one({"id": product_id})


async def _build_wishlist_response(
    db: AsyncIOMotorDatabase, user_id: str, wishlist_doc: dict | None
) -> WishlistResponse:
    """Build a wishlist response with populated product details."""
    if not wishlist_doc or not wishlist_doc.get("items"):
        return WishlistResponse(
            userId=user_id,
            items=[],
            itemCount=0,
            updatedAt=wishlist_doc.get("updatedAt") if wishlist_doc else None,
        )

    # Get all product IDs from wishlist
    product_ids = [item["productId"] for item in wishlist_doc["items"]]

    # Fetch all products in one query
    products_cursor = db.products.find({"id": {"$in": product_ids}})
    products_map = {p["id"]: p async for p in products_cursor}

    # Build response items
    response_items: list[WishlistItemResponse] = []

    for item in wishlist_doc["items"]:
        product = products_map.get(item["productId"])
        if not product:
            # Product no longer exists - skip it
            continue

        product_snapshot = ProductSnapshot(
            id=product["id"],
            slug=product["slug"],
            title=product["title"],
            brand=product.get("brand"),
            imageUrl=product["images"][0] if product.get("images") else None,
            priceCents=product.get("priceCents", 0),
            listPriceCents=product.get("listPriceCents"),
            stock=product.get("stock", 0),
            inStock=product.get("stock", 0) > 0,
        )

        response_items.append(
            WishlistItemResponse(
                productId=item["productId"],
                product=product_snapshot,
                addedAt=item["addedAt"],
            )
        )

    return WishlistResponse(
        userId=user_id,
        items=response_items,
        itemCount=len(response_items),
        updatedAt=wishlist_doc.get("updatedAt"),
    )


@router.get("", response_model=WishlistResponse)
async def get_wishlist(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> WishlistResponse:
    """
    Get the current user's wishlist.

    Returns all wishlist items with product details.
    """
    wishlist_doc = await db.wishlists.find_one({"userId": user.user_id})
    return await _build_wishlist_response(db, user.user_id, wishlist_doc)


@router.post("/items", response_model=WishlistResponse, status_code=status.HTTP_200_OK)
async def add_to_wishlist(
    item: WishlistItemCreate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> WishlistResponse:
    """
    Add an item to the wishlist.

    Silently succeeds if item already exists.
    """
    # Validate product exists
    product = await _get_product(db, item.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{item.product_id}' not found",
        )

    now = datetime.now(timezone.utc)

    # Get existing wishlist
    wishlist_doc = await db.wishlists.find_one({"userId": user.user_id})

    if wishlist_doc:
        # Check if item already in wishlist
        existing_item = next(
            (
                i
                for i in wishlist_doc.get("items", [])
                if i["productId"] == item.product_id
            ),
            None,
        )

        if not existing_item:
            # Add new item
            new_item = {
                "productId": item.product_id,
                "addedAt": now,
            }
            await db.wishlists.update_one(
                {"userId": user.user_id},
                {"$push": {"items": new_item}, "$set": {"updatedAt": now}},
            )
        # If item exists, silently succeed (no-op)
    else:
        # Create new wishlist
        new_wishlist = {
            "userId": user.user_id,
            "items": [
                {
                    "productId": item.product_id,
                    "addedAt": now,
                }
            ],
            "updatedAt": now,
        }
        await db.wishlists.insert_one(new_wishlist)

    # Return updated wishlist
    wishlist_doc = await db.wishlists.find_one({"userId": user.user_id})
    return await _build_wishlist_response(db, user.user_id, wishlist_doc)


@router.delete("/items/{product_id}", response_model=WishlistResponse)
async def remove_from_wishlist(
    product_id: str,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> WishlistResponse:
    """
    Remove an item from the wishlist.
    """
    wishlist_doc = await db.wishlists.find_one({"userId": user.user_id})
    if not wishlist_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found",
        )

    # Check if item exists in wishlist
    existing_item = next(
        (i for i in wishlist_doc.get("items", []) if i["productId"] == product_id),
        None,
    )
    if not existing_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item '{product_id}' not found in wishlist",
        )

    now = datetime.now(timezone.utc)

    await db.wishlists.update_one(
        {"userId": user.user_id},
        {
            "$pull": {"items": {"productId": product_id}},
            "$set": {"updatedAt": now},
        },
    )

    # Return updated wishlist
    wishlist_doc = await db.wishlists.find_one({"userId": user.user_id})
    return await _build_wishlist_response(db, user.user_id, wishlist_doc)


@router.post("/items/{product_id}/move-to-cart", response_model=dict)
async def move_to_cart(
    product_id: str,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """
    Move an item from wishlist to cart.

    Removes the item from wishlist and adds it to cart with quantity 1.
    """
    # Verify item is in wishlist
    wishlist_doc = await db.wishlists.find_one({"userId": user.user_id})
    if not wishlist_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found",
        )

    existing_item = next(
        (i for i in wishlist_doc.get("items", []) if i["productId"] == product_id),
        None,
    )
    if not existing_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item '{product_id}' not found in wishlist",
        )

    # Verify product exists and has stock
    product = await _get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{product_id}' not found",
        )

    if product.get("stock", 0) < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is out of stock",
        )

    now = datetime.now(timezone.utc)

    # Remove from wishlist
    await db.wishlists.update_one(
        {"userId": user.user_id},
        {
            "$pull": {"items": {"productId": product_id}},
            "$set": {"updatedAt": now},
        },
    )

    # Add to cart (or update quantity if already in cart)
    cart_doc = await db.carts.find_one({"userId": user.user_id})

    if cart_doc:
        cart_item = next(
            (i for i in cart_doc.get("items", []) if i["productId"] == product_id),
            None,
        )

        if cart_item:
            # Item already in cart - increment quantity
            new_quantity = cart_item["quantity"] + 1
            if product.get("stock", 0) < new_quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock. Available: {product.get('stock', 0)}",
                )

            await db.carts.update_one(
                {"userId": user.user_id, "items.productId": product_id},
                {
                    "$set": {
                        "items.$.quantity": new_quantity,
                        "updatedAt": now,
                    }
                },
            )
        else:
            # Add new item to cart
            new_item = {
                "productId": product_id,
                "quantity": 1,
                "addedAt": now,
            }
            await db.carts.update_one(
                {"userId": user.user_id},
                {"$push": {"items": new_item}, "$set": {"updatedAt": now}},
            )
    else:
        # Create new cart
        new_cart = {
            "userId": user.user_id,
            "items": [
                {
                    "productId": product_id,
                    "quantity": 1,
                    "addedAt": now,
                }
            ],
            "updatedAt": now,
        }
        await db.carts.insert_one(new_cart)

    return {
        "message": "Item moved to cart",
        "productId": product_id,
    }
