"""Advertising models: Advertiser, AdCampaign, AdEvent, AdSpendDaily."""

import datetime as dt
from enum import Enum

from pydantic import BaseModel, Field


class CampaignStatus(str, Enum):
    """Ad campaign status."""

    ACTIVE = "active"
    PAUSED = "paused"


class AdEventType(str, Enum):
    """Ad event types for tracking."""

    IMPRESSION = "impression"
    CLICK = "click"
    CONVERSION = "conversion"


class Advertiser(BaseModel):
    """Advertiser account (linked to a seller)."""

    id: str = Field(..., description="Unique advertiser ID")
    seller_id: str = Field(..., alias="sellerId", description="Associated seller ID")
    user_id: str = Field(..., alias="userId", description="Associated user ID")
    enabled_at: dt.datetime = Field(..., alias="enabledAt", description="When advertising was enabled")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "adv_123",
                "sellerId": "seller_456",
                "userId": "user_789",
                "enabledAt": "2024-01-01T00:00:00Z",
            }
        },
    }


class AdCampaign(BaseModel):
    """Ad campaign model."""

    id: str = Field(..., description="Unique campaign ID")
    advertiser_id: str = Field(..., alias="advertiserId", description="Advertiser ID")
    product_id: str = Field(..., alias="productId", description="Product being advertised")
    keywords: list[str] = Field(default_factory=list, description="Target keywords")
    bid_cents: int = Field(..., alias="bidCents", ge=1, description="Bid amount in cents per click")
    daily_budget_cents: int = Field(..., alias="dailyBudgetCents", ge=100, description="Daily budget in cents")
    status: CampaignStatus = Field(..., description="Campaign status")
    created_at: dt.datetime = Field(..., alias="createdAt", description="Creation timestamp")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "camp_123",
                "advertiserId": "adv_456",
                "productId": "prod_789",
                "keywords": ["wireless", "headphones", "bluetooth"],
                "bidCents": 50,
                "dailyBudgetCents": 5000,
                "status": "active",
                "createdAt": "2024-01-15T00:00:00Z",
            }
        },
    }


class AdCampaignCreate(BaseModel):
    """Ad campaign creation request."""

    product_id: str = Field(..., alias="productId")
    keywords: list[str] = Field(..., min_length=1)
    bid_cents: int = Field(..., alias="bidCents", ge=1)
    daily_budget_cents: int = Field(..., alias="dailyBudgetCents", ge=100)

    model_config = {"populate_by_name": True}


class AdCampaignUpdate(BaseModel):
    """Ad campaign update request."""

    keywords: list[str] | None = None
    bid_cents: int | None = Field(None, alias="bidCents", ge=1)
    daily_budget_cents: int | None = Field(None, alias="dailyBudgetCents", ge=100)
    status: CampaignStatus | None = None

    model_config = {"populate_by_name": True}


class AdEvent(BaseModel):
    """Ad event for tracking impressions, clicks, conversions."""

    id: str = Field(..., description="Unique event ID")
    campaign_id: str = Field(..., alias="campaignId", description="Campaign ID")
    event_type: AdEventType = Field(..., alias="eventType", description="Event type")
    ts: dt.datetime = Field(..., description="Event timestamp")
    user_id: str | None = Field(None, alias="userId", description="User ID if known")
    cost_cents: int = Field(0, alias="costCents", ge=0, description="Cost of this event in cents")

    model_config = {"populate_by_name": True}


class AdSpendDaily(BaseModel):
    """Daily ad spend aggregation."""

    id: str = Field(..., description="Unique record ID")
    campaign_id: str = Field(..., alias="campaignId", description="Campaign ID")
    date: dt.date = Field(..., description="Date of spend")
    impressions: int = Field(0, ge=0, description="Total impressions")
    clicks: int = Field(0, ge=0, description="Total clicks")
    conversions: int = Field(0, ge=0, description="Total conversions")
    spend_cents: int = Field(0, alias="spendCents", ge=0, description="Total spend in cents")

    model_config = {"populate_by_name": True}


class SponsoredProduct(BaseModel):
    """Sponsored product returned by ad serving."""

    campaign_id: str = Field(..., alias="campaignId", description="Campaign ID")
    product_id: str = Field(..., alias="productId", description="Product ID")
    bid_cents: int = Field(..., alias="bidCents", description="Winning bid in cents")

    model_config = {"populate_by_name": True}
