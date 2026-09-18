"""Cart and CartItem models."""

from datetime import datetime

from pydantic import BaseModel, Field


class CartItem(BaseModel):
    """Individual cart item (stored in DB)."""

    product_id: str = Field(..., alias="productId", description="Product ID")
    quantity: int = Field(..., ge=1, description="Item quantity")
    added_at: datetime = Field(..., alias="addedAt", description="When item was added to cart")

    model_config = {"populate_by_name": True}


class Cart(BaseModel):
    """Shopping cart model (DB document)."""

    user_id: str = Field(..., alias="userId", description="Owner user ID")
    items: list[CartItem] = Field(default_factory=list, description="Cart items")
    updated_at: datetime = Field(..., alias="updatedAt", description="Last update timestamp")

    model_config = {"populate_by_name": True}


class CartItemCreate(BaseModel):
    """Request to add item to cart."""

    product_id: str = Field(..., alias="productId")
    quantity: int = Field(1, ge=1)

    model_config = {"populate_by_name": True}


class CartItemUpdate(BaseModel):
    """Request to update cart item quantity."""

    quantity: int = Field(..., ge=0)  # 0 means remove item


# Response models with populated product data


class ProductSnapshot(BaseModel):
    """Product info for cart/wishlist responses."""

    id: str = Field(..., description="Product ID")
    slug: str = Field(..., description="Product slug")
    title: str = Field(..., description="Product title")
    brand: str | None = Field(None, description="Product brand")
    image_url: str | None = Field(None, alias="imageUrl", description="Main product image")
    price_cents: int = Field(..., alias="priceCents", description="Current price in cents")
    list_price_cents: int | None = Field(None, alias="listPriceCents", description="Original list price")
    stock: int = Field(..., description="Available stock")
    in_stock: bool = Field(..., alias="inStock", description="Whether product is in stock")

    model_config = {"populate_by_name": True}


class CartItemResponse(BaseModel):
    """Cart item with populated product details."""

    product_id: str = Field(..., alias="productId")
    quantity: int = Field(...)
    product: ProductSnapshot = Field(..., description="Product details")
    added_at: datetime = Field(..., alias="addedAt")
    line_total_cents: int = Field(..., alias="lineTotalCents", description="quantity * priceCents")

    model_config = {"populate_by_name": True}


class CartTotals(BaseModel):
    """Cart summary totals."""

    item_count: int = Field(..., alias="itemCount", description="Total number of items")
    unique_items: int = Field(..., alias="uniqueItems", description="Number of unique products")
    subtotal_cents: int = Field(..., alias="subtotalCents", description="Subtotal in cents")

    model_config = {"populate_by_name": True}


class CartResponse(BaseModel):
    """Full cart response with items and totals."""

    user_id: str = Field(..., alias="userId")
    items: list[CartItemResponse] = Field(default_factory=list)
    totals: CartTotals = Field(...)
    updated_at: datetime | None = Field(None, alias="updatedAt")

    model_config = {"populate_by_name": True}
