"""Cart and CartItem models."""

from datetime import datetime

from pydantic import BaseModel, Field


class CartItem(BaseModel):
    """Individual cart item."""

    product_id: str = Field(..., alias="productId", description="Product ID")
    quantity: int = Field(..., ge=1, description="Item quantity")
    price_cents: int = Field(..., alias="priceCents", ge=0, description="Price per unit in cents at time of adding")
    added_at: datetime = Field(..., alias="addedAt", description="When item was added to cart")

    model_config = {"populate_by_name": True}


class Cart(BaseModel):
    """Shopping cart model."""

    id: str = Field(..., description="Unique cart ID")
    user_id: str = Field(..., alias="userId", description="Owner user ID")
    items: list[CartItem] = Field(default_factory=list, description="Cart items")
    updated_at: datetime = Field(..., alias="updatedAt", description="Last update timestamp")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "cart_123",
                "userId": "user_456",
                "items": [
                    {
                        "productId": "prod_789",
                        "quantity": 2,
                        "priceCents": 4999,
                        "addedAt": "2024-01-15T10:30:00Z",
                    }
                ],
                "updatedAt": "2024-01-15T10:30:00Z",
            }
        },
    }


class CartItemCreate(BaseModel):
    """Request to add item to cart."""

    product_id: str = Field(..., alias="productId")
    quantity: int = Field(1, ge=1)

    model_config = {"populate_by_name": True}


class CartItemUpdate(BaseModel):
    """Request to update cart item quantity."""

    quantity: int = Field(..., ge=1)
