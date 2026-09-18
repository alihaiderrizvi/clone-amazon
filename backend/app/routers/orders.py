"""Order API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.auth import CurrentUser, get_current_user
from app.models.order import Order, OrderCreate

router = APIRouter()


@router.post("")
async def create_order(
    order_request: OrderCreate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Create a new order (checkout).
    
    Converts the current cart into an order with the provided shipping address.
    Cart is cleared after successful order creation.
    
    Note: Payment processing would be handled separately.
    """
    # TODO: Implement checkout
    return {
        "message": "Order created (stub response)",
        "orderId": None,
        "status": "pending",
    }


@router.get("")
async def list_orders(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
) -> dict:
    """
    List the current user's orders.
    
    Returns orders sorted by most recent first.
    """
    # TODO: Implement order history
    return {
        "orders": [],
        "page": page,
        "limit": limit,
        "total": 0,
        "totalPages": 0,
    }


@router.get("/{order_id}")
async def get_order(
    order_id: str,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Get details of a specific order.
    
    Only returns orders belonging to the current user.
    """
    # TODO: Implement order detail retrieval
    return {
        "order": None,
        "message": f"Order '{order_id}' not found (stub response)",
    }
