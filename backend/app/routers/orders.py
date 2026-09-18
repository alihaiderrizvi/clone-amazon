"""Order API routes."""

import math
import secrets
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.auth import CurrentUser, get_current_user
from app.database import get_db
from app.models.order import (
    OrderCreate,
    OrderItem,
    OrderListResponse,
    OrderResponse,
    OrderStatus,
    OrderSummary,
)

router = APIRouter()

# Pricing constants
FREE_SHIPPING_THRESHOLD_CENTS = 3500  # $35.00
SHIPPING_COST_CENTS = 499  # $4.99
TAX_RATE = 0.09  # 9%


def _generate_order_id() -> str:
    """Generate a unique order ID."""
    return f"order_{secrets.token_hex(8)}"


def _calculate_shipping(subtotal_cents: int) -> int:
    """Calculate shipping cost. Free over $35."""
    if subtotal_cents >= FREE_SHIPPING_THRESHOLD_CENTS:
        return 0
    return SHIPPING_COST_CENTS


def _calculate_tax(subtotal_cents: int) -> int:
    """Calculate tax at 9%."""
    return round(subtotal_cents * TAX_RATE)


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_request: OrderCreate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> OrderResponse:
    """
    Create a new order (checkout).

    Converts the current cart into an order with the provided shipping address.
    - Validates cart is not empty
    - Validates all items are still in stock
    - Creates order with snapshot of items (prices at time of order)
    - Decrements product stock
    - Clears the cart

    Note: Payment processing would be handled separately.
    """
    # Get user's cart
    cart_doc = await db.carts.find_one({"userId": user.user_id})
    if not cart_doc or not cart_doc.get("items"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    cart_items = cart_doc["items"]

    # Get all products from cart
    product_ids = [item["productId"] for item in cart_items]
    products_cursor = db.products.find({"id": {"$in": product_ids}})
    products_map = {p["id"]: p async for p in products_cursor}

    # Validate all products and stock
    order_items: list[OrderItem] = []
    subtotal_cents = 0
    stock_updates: list[tuple[str, int]] = []  # (product_id, quantity)

    for cart_item in cart_items:
        product_id = cart_item["productId"]
        quantity = cart_item["quantity"]

        product = products_map.get(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product_id}' no longer exists",
            )

        if product.get("stock", 0) < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product['title']}'. Available: {product.get('stock', 0)}, requested: {quantity}",
            )

        price_cents = product.get("priceCents", 0)
        line_total = price_cents * quantity

        # Create order item snapshot
        order_item = OrderItem(
            productId=product_id,
            productSlug=product["slug"],
            title=product["title"],
            imageUrl=product["images"][0] if product.get("images") else None,
            quantity=quantity,
            priceCents=price_cents,
            sellerId=product["sellerId"],
        )
        order_items.append(order_item)
        subtotal_cents += line_total
        stock_updates.append((product_id, quantity))

    # Calculate totals
    shipping_cents = _calculate_shipping(subtotal_cents)
    tax_cents = _calculate_tax(subtotal_cents)
    total_cents = subtotal_cents + shipping_cents + tax_cents

    now = datetime.now(timezone.utc)
    order_id = _generate_order_id()

    # Create order document
    order_doc = {
        "id": order_id,
        "userId": user.user_id,
        "items": [item.model_dump(by_alias=True) for item in order_items],
        "subtotalCents": subtotal_cents,
        "shippingCents": shipping_cents,
        "taxCents": tax_cents,
        "totalCents": total_cents,
        "address": order_request.address.model_dump(by_alias=True),
        "paymentMethod": order_request.payment_method,
        "status": OrderStatus.PENDING.value,
        "placedAt": now,
        "updatedAt": now,
    }

    # Insert order
    await db.orders.insert_one(order_doc)

    # Decrement stock for all products
    for product_id, quantity in stock_updates:
        await db.products.update_one(
            {"id": product_id},
            {"$inc": {"stock": -quantity}},
        )

    # Clear cart
    await db.carts.update_one(
        {"userId": user.user_id},
        {"$set": {"items": [], "updatedAt": now}},
    )

    return OrderResponse(
        id=order_id,
        userId=user.user_id,
        items=order_items,
        subtotalCents=subtotal_cents,
        shippingCents=shipping_cents,
        taxCents=tax_cents,
        totalCents=total_cents,
        address=order_request.address,
        paymentMethod=order_request.payment_method,
        status=OrderStatus.PENDING,
        placedAt=now,
        updatedAt=now,
    )


@router.get("", response_model=OrderListResponse)
async def list_orders(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
) -> OrderListResponse:
    """
    List the current user's orders.

    Returns orders sorted by most recent first, with pagination.
    """
    # Count total orders
    total = await db.orders.count_documents({"userId": user.user_id})

    if total == 0:
        return OrderListResponse(
            orders=[],
            page=page,
            limit=limit,
            total=0,
            totalPages=0,
        )

    total_pages = math.ceil(total / limit)
    skip = (page - 1) * limit

    # Fetch orders
    cursor = (
        db.orders.find({"userId": user.user_id})
        .sort("placedAt", -1)
        .skip(skip)
        .limit(limit)
    )

    orders_summary: list[OrderSummary] = []
    async for order_doc in cursor:
        items = order_doc.get("items", [])
        item_count = sum(item.get("quantity", 0) for item in items)
        first_item_image = items[0].get("imageUrl") if items else None

        orders_summary.append(
            OrderSummary(
                id=order_doc["id"],
                itemCount=item_count,
                totalCents=order_doc.get("totalCents", 0),
                status=OrderStatus(order_doc.get("status", "pending")),
                placedAt=order_doc["placedAt"],
                firstItemImage=first_item_image,
            )
        )

    return OrderListResponse(
        orders=orders_summary,
        page=page,
        limit=limit,
        total=total,
        totalPages=total_pages,
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> OrderResponse:
    """
    Get details of a specific order.

    Only returns orders belonging to the current user.
    """
    order_doc = await db.orders.find_one(
        {"id": order_id, "userId": user.user_id}
    )

    if not order_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' not found",
        )

    # Parse items
    order_items = [
        OrderItem(
            productId=item["productId"],
            productSlug=item["productSlug"],
            title=item["title"],
            imageUrl=item.get("imageUrl"),
            quantity=item["quantity"],
            priceCents=item["priceCents"],
            sellerId=item["sellerId"],
        )
        for item in order_doc.get("items", [])
    ]

    from app.models.order import Address

    return OrderResponse(
        id=order_doc["id"],
        userId=order_doc["userId"],
        items=order_items,
        subtotalCents=order_doc.get("subtotalCents", 0),
        shippingCents=order_doc.get("shippingCents", 0),
        taxCents=order_doc.get("taxCents", 0),
        totalCents=order_doc.get("totalCents", 0),
        address=Address(**order_doc["address"]),
        paymentMethod=order_doc.get("paymentMethod", "card"),
        status=OrderStatus(order_doc.get("status", "pending")),
        placedAt=order_doc["placedAt"],
        updatedAt=order_doc.get("updatedAt"),
    )
