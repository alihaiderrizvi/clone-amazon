"""Shopping cart API routes."""

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.auth import CurrentUser, get_current_user
from app.database import get_db
from app.models.cart import (
    CartItemCreate,
    CartItemResponse,
    CartItemUpdate,
    CartResponse,
    CartTotals,
    ProductSnapshot,
)

router = APIRouter()


async def _get_product(db: AsyncIOMotorDatabase, product_id: str) -> dict | None:
    """Get a product by ID."""
    return await db.products.find_one({"id": product_id})


async def _build_cart_response(
    db: AsyncIOMotorDatabase, user_id: str, cart_doc: dict | None
) -> CartResponse:
    """Build a cart response with populated product details."""
    if not cart_doc or not cart_doc.get("items"):
        return CartResponse(
            userId=user_id,
            items=[],
            totals=CartTotals(itemCount=0, uniqueItems=0, subtotalCents=0),
            updatedAt=cart_doc.get("updatedAt") if cart_doc else None,
        )

    # Get all product IDs from cart
    product_ids = [item["productId"] for item in cart_doc["items"]]

    # Fetch all products in one query
    products_cursor = db.products.find({"id": {"$in": product_ids}})
    products_map = {p["id"]: p async for p in products_cursor}

    # Build response items
    response_items: list[CartItemResponse] = []
    total_items = 0
    subtotal_cents = 0

    for item in cart_doc["items"]:
        product = products_map.get(item["productId"])
        if not product:
            # Product no longer exists - skip it
            continue

        quantity = item["quantity"]
        price_cents = product.get("priceCents", 0)
        line_total = quantity * price_cents

        product_snapshot = ProductSnapshot(
            id=product["id"],
            slug=product["slug"],
            title=product["title"],
            brand=product.get("brand"),
            imageUrl=product["images"][0] if product.get("images") else None,
            priceCents=price_cents,
            listPriceCents=product.get("listPriceCents"),
            stock=product.get("stock", 0),
            inStock=product.get("stock", 0) > 0,
        )

        response_items.append(
            CartItemResponse(
                productId=item["productId"],
                quantity=quantity,
                product=product_snapshot,
                addedAt=item["addedAt"],
                lineTotalCents=line_total,
            )
        )

        total_items += quantity
        subtotal_cents += line_total

    return CartResponse(
        userId=user_id,
        items=response_items,
        totals=CartTotals(
            itemCount=total_items,
            uniqueItems=len(response_items),
            subtotalCents=subtotal_cents,
        ),
        updatedAt=cart_doc.get("updatedAt"),
    )


@router.get("", response_model=CartResponse)
async def get_cart(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> CartResponse:
    """
    Get the current user's cart.

    Returns the cart with all items populated with product details and totals.
    """
    cart_doc = await db.carts.find_one({"userId": user.user_id})
    return await _build_cart_response(db, user.user_id, cart_doc)


@router.post("/items", response_model=CartResponse, status_code=status.HTTP_200_OK)
async def add_to_cart(
    item: CartItemCreate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> CartResponse:
    """
    Add an item to the cart.

    If the item already exists, quantity is increased.
    Validates that the product exists and has sufficient stock.
    """
    # Validate product exists
    product = await _get_product(db, item.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{item.product_id}' not found",
        )

    # Check stock availability
    if product.get("stock", 0) < item.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available: {product.get('stock', 0)}",
        )

    now = datetime.now(timezone.utc)

    # Get existing cart
    cart_doc = await db.carts.find_one({"userId": user.user_id})

    if cart_doc:
        # Check if item already in cart
        existing_item = next(
            (i for i in cart_doc.get("items", []) if i["productId"] == item.product_id),
            None,
        )

        if existing_item:
            # Update quantity
            new_quantity = existing_item["quantity"] + item.quantity

            # Validate total quantity against stock
            if product.get("stock", 0) < new_quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock. Available: {product.get('stock', 0)}, requested total: {new_quantity}",
                )

            await db.carts.update_one(
                {"userId": user.user_id, "items.productId": item.product_id},
                {
                    "$set": {
                        "items.$.quantity": new_quantity,
                        "updatedAt": now,
                    }
                },
            )
        else:
            # Add new item
            new_item = {
                "productId": item.product_id,
                "quantity": item.quantity,
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
                    "productId": item.product_id,
                    "quantity": item.quantity,
                    "addedAt": now,
                }
            ],
            "updatedAt": now,
        }
        await db.carts.insert_one(new_cart)

    # Return updated cart
    cart_doc = await db.carts.find_one({"userId": user.user_id})
    return await _build_cart_response(db, user.user_id, cart_doc)


@router.patch("/items/{product_id}", response_model=CartResponse)
async def update_cart_item(
    product_id: str,
    update: CartItemUpdate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> CartResponse:
    """
    Update the quantity of a cart item.

    If quantity is 0, the item is removed from the cart.
    """
    cart_doc = await db.carts.find_one({"userId": user.user_id})
    if not cart_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found",
        )

    # Check if item exists in cart
    existing_item = next(
        (i for i in cart_doc.get("items", []) if i["productId"] == product_id),
        None,
    )
    if not existing_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item '{product_id}' not found in cart",
        )

    now = datetime.now(timezone.utc)

    if update.quantity == 0:
        # Remove item
        await db.carts.update_one(
            {"userId": user.user_id},
            {
                "$pull": {"items": {"productId": product_id}},
                "$set": {"updatedAt": now},
            },
        )
    else:
        # Validate stock
        product = await _get_product(db, product_id)
        if product and product.get("stock", 0) < update.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock. Available: {product.get('stock', 0)}",
            )

        # Update quantity
        await db.carts.update_one(
            {"userId": user.user_id, "items.productId": product_id},
            {
                "$set": {
                    "items.$.quantity": update.quantity,
                    "updatedAt": now,
                }
            },
        )

    # Return updated cart
    cart_doc = await db.carts.find_one({"userId": user.user_id})
    return await _build_cart_response(db, user.user_id, cart_doc)


@router.delete("/items/{product_id}", response_model=CartResponse)
async def remove_from_cart(
    product_id: str,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> CartResponse:
    """
    Remove an item from the cart.
    """
    cart_doc = await db.carts.find_one({"userId": user.user_id})
    if not cart_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found",
        )

    # Check if item exists in cart
    existing_item = next(
        (i for i in cart_doc.get("items", []) if i["productId"] == product_id),
        None,
    )
    if not existing_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item '{product_id}' not found in cart",
        )

    now = datetime.now(timezone.utc)

    await db.carts.update_one(
        {"userId": user.user_id},
        {
            "$pull": {"items": {"productId": product_id}},
            "$set": {"updatedAt": now},
        },
    )

    # Return updated cart
    cart_doc = await db.carts.find_one({"userId": user.user_id})
    return await _build_cart_response(db, user.user_id, cart_doc)


@router.delete("", response_model=CartResponse)
async def clear_cart(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> CartResponse:
    """
    Clear all items from the cart.
    """
    now = datetime.now(timezone.utc)

    await db.carts.update_one(
        {"userId": user.user_id},
        {"$set": {"items": [], "updatedAt": now}},
        upsert=True,
    )

    cart_doc = await db.carts.find_one({"userId": user.user_id})
    return await _build_cart_response(db, user.user_id, cart_doc)
