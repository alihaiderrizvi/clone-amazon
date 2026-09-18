"""Seller API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.auth import CurrentUser, get_current_user
from app.models.product import Product, ProductCreate, ProductUpdate
from app.models.user import Seller, SellerCreate

router = APIRouter()


# ============ Seller Onboarding ============


@router.post("/sellers")
async def create_seller_account(
    seller_data: SellerCreate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Create a seller account for the current user.
    
    Users can only have one seller account.
    """
    # TODO: Implement seller onboarding
    return {
        "message": "Seller account created (stub response)",
        "sellerId": None,
        "userId": user.user_id,
        "storeName": seller_data.store_name,
    }


# ============ Seller Listings ============


@router.get("/seller/listings")
async def list_seller_products(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None, pattern="^(draft|published)$"),
) -> dict:
    """
    List the current seller's products.
    
    Includes both draft and published products.
    """
    # TODO: Implement seller listings
    return {
        "products": [],
        "page": page,
        "limit": limit,
        "total": 0,
        "totalPages": 0,
    }


@router.post("/seller/listings")
async def create_product_listing(
    product: ProductCreate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Create a new product listing.
    
    Requires an active seller account.
    Products start in draft status by default.
    """
    # TODO: Implement product creation
    return {
        "message": "Product created (stub response)",
        "productId": None,
        "slug": product.slug,
        "status": product.status,
    }


@router.patch("/seller/listings/{product_id}")
async def update_product_listing(
    product_id: str,
    update: ProductUpdate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Update a product listing.
    
    Only the owning seller can update a product.
    """
    # TODO: Implement product update
    return {
        "message": "Product updated (stub response)",
        "productId": product_id,
    }
