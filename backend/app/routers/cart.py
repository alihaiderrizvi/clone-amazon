"""Shopping cart API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth import CurrentUser, get_current_user
from app.models.cart import Cart, CartItemCreate, CartItemUpdate

router = APIRouter()


@router.get("")
async def get_cart(
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Get the current user's cart.
    
    Returns the cart with all items and their current prices.
    """
    # TODO: Implement cart retrieval
    return {
        "cart": {
            "id": None,
            "userId": user.user_id,
            "items": [],
            "updatedAt": None,
        },
    }


@router.post("/items")
async def add_to_cart(
    item: CartItemCreate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Add an item to the cart.
    
    If the item already exists, quantity is increased.
    """
    # TODO: Implement add to cart
    return {
        "message": "Item added to cart (stub response)",
        "productId": item.product_id,
        "quantity": item.quantity,
    }


@router.patch("/items/{product_id}")
async def update_cart_item(
    product_id: str,
    update: CartItemUpdate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Update the quantity of a cart item.
    """
    # TODO: Implement quantity update
    return {
        "message": "Cart item updated (stub response)",
        "productId": product_id,
        "quantity": update.quantity,
    }


@router.delete("/items/{product_id}")
async def remove_from_cart(
    product_id: str,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Remove an item from the cart.
    """
    # TODO: Implement remove from cart
    return {
        "message": "Item removed from cart (stub response)",
        "productId": product_id,
    }
