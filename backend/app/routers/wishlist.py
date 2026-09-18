"""Wishlist API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth import CurrentUser, get_current_user
from app.models.wishlist import Wishlist, WishlistItemCreate

router = APIRouter()


@router.get("")
async def get_wishlist(
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Get the current user's wishlist.
    
    Returns all wishlist items with product details.
    """
    # TODO: Implement wishlist retrieval
    return {
        "wishlist": {
            "id": None,
            "userId": user.user_id,
            "items": [],
            "updatedAt": None,
        },
    }


@router.post("/items")
async def add_to_wishlist(
    item: WishlistItemCreate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Add an item to the wishlist.
    
    Silently succeeds if item already exists.
    """
    # TODO: Implement add to wishlist
    return {
        "message": "Item added to wishlist (stub response)",
        "productId": item.product_id,
    }


@router.delete("/items/{product_id}")
async def remove_from_wishlist(
    product_id: str,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Remove an item from the wishlist.
    """
    # TODO: Implement remove from wishlist
    return {
        "message": "Item removed from wishlist (stub response)",
        "productId": product_id,
    }
