"""Product and Category models."""

from datetime import datetime
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, Field


class ProductStatus(str, Enum):
    """Product publication status."""

    DRAFT = "draft"
    PUBLISHED = "published"


class Product(BaseModel):
    """Product model."""

    id: str = Field(..., description="Unique product ID")
    slug: str = Field(..., description="URL-friendly product slug")
    title: str = Field(..., description="Product title")
    brand: str | None = Field(None, description="Product brand")
    category_id: str = Field(..., alias="categoryId", description="Category ID")
    price_cents: int = Field(..., alias="priceCents", ge=0, description="Current price in cents")
    list_price_cents: int | None = Field(None, alias="listPriceCents", ge=0, description="Original list price in cents")
    images: list[str] = Field(default_factory=list, description="List of image URLs")
    bullets: list[str] = Field(default_factory=list, description="Product bullet points")
    description: str | None = Field(None, description="Full product description")
    attributes: dict[str, str] = Field(default_factory=dict, description="Product attributes (e.g., color, size)")
    rating_avg: float | None = Field(None, alias="ratingAvg", ge=0, le=5, description="Average rating")
    rating_count: int = Field(0, alias="ratingCount", ge=0, description="Number of ratings")
    stock: int = Field(0, ge=0, description="Available stock")
    seller_id: str = Field(..., alias="sellerId", description="Seller ID")
    status: ProductStatus = Field(ProductStatus.DRAFT, description="Product status")
    created_at: datetime = Field(..., alias="createdAt", description="Creation timestamp")
    updated_at: datetime = Field(..., alias="updatedAt", description="Last update timestamp")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "prod_123",
                "slug": "wireless-bluetooth-headphones",
                "title": "Wireless Bluetooth Headphones",
                "brand": "AudioTech",
                "categoryId": "cat_electronics",
                "priceCents": 4999,
                "listPriceCents": 7999,
                "images": ["https://example.com/img1.jpg"],
                "bullets": ["40-hour battery life", "Active noise cancellation"],
                "description": "Premium wireless headphones...",
                "attributes": {"color": "black", "connectivity": "bluetooth"},
                "ratingAvg": 4.5,
                "ratingCount": 1250,
                "stock": 150,
                "sellerId": "seller_456",
                "status": "published",
                "createdAt": "2024-01-01T00:00:00Z",
                "updatedAt": "2024-01-15T00:00:00Z",
            }
        },
    }


class ProductCreate(BaseModel):
    """Product creation request."""

    slug: str = Field(..., min_length=1, max_length=200)
    title: str = Field(..., min_length=1, max_length=500)
    brand: str | None = None
    category_id: str = Field(..., alias="categoryId")
    price_cents: int = Field(..., alias="priceCents", ge=0)
    list_price_cents: int | None = Field(None, alias="listPriceCents", ge=0)
    images: list[str] = Field(default_factory=list)
    bullets: list[str] = Field(default_factory=list)
    description: str | None = None
    attributes: dict[str, str] = Field(default_factory=dict)
    stock: int = Field(0, ge=0)
    status: ProductStatus = ProductStatus.DRAFT

    model_config = {"populate_by_name": True}


class ProductUpdate(BaseModel):
    """Product update request (all fields optional)."""

    title: str | None = Field(None, min_length=1, max_length=500)
    brand: str | None = None
    category_id: str | None = Field(None, alias="categoryId")
    price_cents: int | None = Field(None, alias="priceCents", ge=0)
    list_price_cents: int | None = Field(None, alias="listPriceCents", ge=0)
    images: list[str] | None = None
    bullets: list[str] | None = None
    description: str | None = None
    attributes: dict[str, str] | None = None
    stock: int | None = Field(None, ge=0)
    status: ProductStatus | None = None

    model_config = {"populate_by_name": True}


class Category(BaseModel):
    """Category model."""

    id: str = Field(..., description="Unique category ID")
    slug: str = Field(..., description="URL-friendly category slug")
    name: str = Field(..., description="Category display name")
    parent_id: str | None = Field(None, alias="parentId", description="Parent category ID")
    image_url: str | None = Field(None, alias="imageUrl", description="Category image URL")
    sort_order: int = Field(0, alias="sortOrder", description="Display sort order")

    model_config = {"populate_by_name": True}


class CategoryCreate(BaseModel):
    """Category creation request."""

    slug: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=200)
    parent_id: str | None = Field(None, alias="parentId")
    image_url: str | None = Field(None, alias="imageUrl")
    sort_order: int = Field(0, alias="sortOrder")

    model_config = {"populate_by_name": True}
