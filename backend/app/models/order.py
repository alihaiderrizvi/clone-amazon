"""Order and OrderItem models."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class OrderStatus(str, Enum):
    """Order status values."""

    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Address(BaseModel):
    """Shipping/billing address."""

    full_name: str = Field(..., alias="fullName", description="Recipient full name")
    street_line1: str = Field(..., alias="streetLine1", description="Street address line 1")
    street_line2: str | None = Field(None, alias="streetLine2", description="Street address line 2")
    city: str = Field(..., description="City")
    state: str = Field(..., description="State/Province")
    postal_code: str = Field(..., alias="postalCode", description="Postal/ZIP code")
    country: str = Field(..., description="Country code (e.g., US)")
    phone: str | None = Field(None, description="Phone number")

    model_config = {"populate_by_name": True}


class OrderItem(BaseModel):
    """Order item snapshot (frozen at time of order)."""

    product_id: str = Field(..., alias="productId", description="Product ID")
    product_slug: str = Field(..., alias="productSlug", description="Product slug at time of order")
    title: str = Field(..., description="Product title at time of order")
    image_url: str | None = Field(None, alias="imageUrl", description="Product image URL")
    quantity: int = Field(..., ge=1, description="Quantity ordered")
    price_cents: int = Field(..., alias="priceCents", ge=0, description="Price per unit in cents")
    seller_id: str = Field(..., alias="sellerId", description="Seller ID")

    model_config = {"populate_by_name": True}


class Order(BaseModel):
    """Order model."""

    id: str = Field(..., description="Unique order ID")
    user_id: str = Field(..., alias="userId", description="Customer user ID")
    items: list[OrderItem] = Field(..., description="Order items (snapshots)")
    subtotal_cents: int = Field(..., alias="subtotalCents", ge=0, description="Subtotal in cents")
    shipping_cents: int = Field(..., alias="shippingCents", ge=0, description="Shipping cost in cents")
    tax_cents: int = Field(..., alias="taxCents", ge=0, description="Tax amount in cents")
    total_cents: int = Field(..., alias="totalCents", ge=0, description="Total amount in cents")
    address: Address = Field(..., description="Shipping address")
    status: OrderStatus = Field(..., description="Order status")
    placed_at: datetime = Field(..., alias="placedAt", description="Order placement timestamp")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "order_123",
                "userId": "user_456",
                "items": [
                    {
                        "productId": "prod_789",
                        "productSlug": "wireless-headphones",
                        "title": "Wireless Bluetooth Headphones",
                        "imageUrl": "https://example.com/img.jpg",
                        "quantity": 1,
                        "priceCents": 4999,
                        "sellerId": "seller_321",
                    }
                ],
                "subtotalCents": 4999,
                "shippingCents": 599,
                "taxCents": 450,
                "totalCents": 6048,
                "address": {
                    "fullName": "John Doe",
                    "streetLine1": "123 Main St",
                    "city": "San Francisco",
                    "state": "CA",
                    "postalCode": "94102",
                    "country": "US",
                },
                "status": "confirmed",
                "placedAt": "2024-01-15T14:30:00Z",
            }
        },
    }


class OrderCreate(BaseModel):
    """Order creation request (checkout)."""

    address: Address = Field(..., description="Shipping address")
    payment_method: str = Field("card", alias="paymentMethod", description="Payment method identifier")

    model_config = {"populate_by_name": True}

    # Note: Payment processing would be handled separately via a payment provider
    # This just captures the intent to checkout with the current cart


# Response models


class OrderResponse(BaseModel):
    """Single order response."""

    id: str = Field(..., description="Order ID")
    user_id: str = Field(..., alias="userId")
    items: list[OrderItem] = Field(...)
    subtotal_cents: int = Field(..., alias="subtotalCents")
    shipping_cents: int = Field(..., alias="shippingCents")
    tax_cents: int = Field(..., alias="taxCents")
    total_cents: int = Field(..., alias="totalCents")
    address: Address = Field(...)
    payment_method: str = Field(..., alias="paymentMethod")
    status: OrderStatus = Field(...)
    placed_at: datetime = Field(..., alias="placedAt")
    updated_at: datetime | None = Field(None, alias="updatedAt")

    model_config = {"populate_by_name": True}


class OrderSummary(BaseModel):
    """Summarized order for list view."""

    id: str = Field(..., description="Order ID")
    item_count: int = Field(..., alias="itemCount", description="Total number of items")
    total_cents: int = Field(..., alias="totalCents")
    status: OrderStatus = Field(...)
    placed_at: datetime = Field(..., alias="placedAt")
    first_item_image: str | None = Field(None, alias="firstItemImage", description="Image of first item")

    model_config = {"populate_by_name": True}


class OrderListResponse(BaseModel):
    """Paginated list of orders."""

    orders: list[OrderSummary] = Field(default_factory=list)
    page: int = Field(...)
    limit: int = Field(...)
    total: int = Field(..., description="Total number of orders")
    total_pages: int = Field(..., alias="totalPages")

    model_config = {"populate_by_name": True}
