"""Review model."""

from datetime import datetime

from pydantic import BaseModel, Field


class Review(BaseModel):
    """Product review model."""

    id: str = Field(..., description="Unique review ID")
    product_id: str = Field(..., alias="productId", description="Product being reviewed")
    user_id: str = Field(..., alias="userId", description="Reviewer user ID")
    user_display_name: str | None = Field(None, alias="userDisplayName", description="Reviewer display name")
    rating: int = Field(..., ge=1, le=5, description="Rating (1-5 stars)")
    title: str | None = Field(None, description="Review title")
    body: str | None = Field(None, description="Review body text")
    verified_purchase: bool = Field(False, alias="verifiedPurchase", description="Whether reviewer purchased the product")
    helpful_count: int = Field(0, alias="helpfulCount", ge=0, description="Number of helpful votes")
    created_at: datetime = Field(..., alias="createdAt", description="Review creation timestamp")
    updated_at: datetime | None = Field(None, alias="updatedAt", description="Last update timestamp")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "review_123",
                "productId": "prod_456",
                "userId": "user_789",
                "userDisplayName": "John D.",
                "rating": 5,
                "title": "Excellent product!",
                "body": "These headphones exceeded my expectations...",
                "verifiedPurchase": True,
                "helpfulCount": 42,
                "createdAt": "2024-01-20T09:15:00Z",
                "updatedAt": None,
            }
        },
    }


class ReviewCreate(BaseModel):
    """Review creation request."""

    rating: int = Field(..., ge=1, le=5)
    title: str | None = Field(None, max_length=200)
    body: str | None = Field(None, max_length=5000)
