"""Wishlist model."""

from datetime import datetime

from pydantic import BaseModel, Field


class WishlistItem(BaseModel):
    """Individual wishlist item."""

    product_id: str = Field(..., alias="productId", description="Product ID")
    added_at: datetime = Field(..., alias="addedAt", description="When item was added")

    model_config = {"populate_by_name": True}


class Wishlist(BaseModel):
    """User wishlist model."""

    id: str = Field(..., description="Unique wishlist ID")
    user_id: str = Field(..., alias="userId", description="Owner user ID")
    items: list[WishlistItem] = Field(default_factory=list, description="Wishlist items")
    updated_at: datetime = Field(..., alias="updatedAt", description="Last update timestamp")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "wishlist_123",
                "userId": "user_456",
                "items": [
                    {
                        "productId": "prod_789",
                        "addedAt": "2024-01-15T10:30:00Z",
                    }
                ],
                "updatedAt": "2024-01-15T10:30:00Z",
            }
        },
    }


class WishlistItemCreate(BaseModel):
    """Request to add item to wishlist."""

    product_id: str = Field(..., alias="productId")

    model_config = {"populate_by_name": True}
