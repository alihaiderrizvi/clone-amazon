"""User, Seller, and Advertiser models."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
    """User profile model (synced from Supabase Auth)."""

    id: str = Field(..., description="User ID from Supabase Auth")
    email: str | None = Field(None, description="User email")
    display_name: str | None = Field(None, alias="displayName", description="Display name")
    avatar_url: str | None = Field(None, alias="avatarUrl", description="Avatar URL")
    created_at: datetime = Field(..., alias="createdAt", description="Account creation timestamp")

    model_config = {"populate_by_name": True}


class Seller(BaseModel):
    """Seller account model."""

    id: str = Field(..., description="Unique seller ID")
    user_id: str = Field(..., alias="userId", description="Associated user ID")
    store_name: str = Field(..., alias="storeName", description="Store name")
    display_name: str = Field(..., alias="displayName", description="Seller display name")
    contact_email: EmailStr = Field(..., alias="contactEmail", description="Contact email")
    created_at: datetime = Field(..., alias="createdAt", description="Seller account creation timestamp")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "seller_123",
                "userId": "user_456",
                "storeName": "TechGadgets Store",
                "displayName": "TechGadgets",
                "contactEmail": "contact@techgadgets.com",
                "createdAt": "2024-01-01T00:00:00Z",
            }
        },
    }


class SellerCreate(BaseModel):
    """Seller onboarding request."""

    store_name: str = Field(..., alias="storeName", min_length=1, max_length=100)
    display_name: str = Field(..., alias="displayName", min_length=1, max_length=100)
    contact_email: EmailStr = Field(..., alias="contactEmail")

    model_config = {"populate_by_name": True}
