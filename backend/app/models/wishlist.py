"""Wishlist model."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.cart import ProductSnapshot


class WishlistItem(BaseModel):
    """Individual wishlist item (stored in DB)."""

    product_id: str = Field(..., alias="productId", description="Product ID")
    added_at: datetime = Field(..., alias="addedAt", description="When item was added")

    model_config = {"populate_by_name": True}


class Wishlist(BaseModel):
    """User wishlist model (DB document)."""

    user_id: str = Field(..., alias="userId", description="Owner user ID")
    items: list[WishlistItem] = Field(default_factory=list, description="Wishlist items")
    updated_at: datetime = Field(..., alias="updatedAt", description="Last update timestamp")

    model_config = {"populate_by_name": True}


class WishlistItemCreate(BaseModel):
    """Request to add item to wishlist."""

    product_id: str = Field(..., alias="productId")

    model_config = {"populate_by_name": True}


# Response models


class WishlistItemResponse(BaseModel):
    """Wishlist item with populated product details."""

    product_id: str = Field(..., alias="productId")
    product: ProductSnapshot = Field(..., description="Product details")
    added_at: datetime = Field(..., alias="addedAt")

    model_config = {"populate_by_name": True}


class WishlistResponse(BaseModel):
    """Full wishlist response with items."""

    user_id: str = Field(..., alias="userId")
    items: list[WishlistItemResponse] = Field(default_factory=list)
    item_count: int = Field(..., alias="itemCount", description="Number of items in wishlist")
    updated_at: datetime | None = Field(None, alias="updatedAt")

    model_config = {"populate_by_name": True}
