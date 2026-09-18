"""Advertising API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.auth import CurrentUser, get_current_user
from app.models.ads import AdCampaign, AdCampaignCreate, AdCampaignUpdate, Advertiser, SponsoredProduct

router = APIRouter()


# ============ Advertiser Onboarding ============


@router.post("/seller/ads/enable")
async def enable_advertising(
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Enable advertising for the current seller.
    
    Creates an advertiser account linked to the seller account.
    Requires an active seller account.
    """
    # TODO: Implement advertiser onboarding
    return {
        "message": "Advertising enabled (stub response)",
        "advertiserId": None,
        "userId": user.user_id,
    }


# ============ Campaign Management ============


@router.get("/seller/ads/campaigns")
async def list_campaigns(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None, pattern="^(active|paused)$"),
) -> dict:
    """
    List the current advertiser's campaigns.
    """
    # TODO: Implement campaign listing
    return {
        "campaigns": [],
        "page": page,
        "limit": limit,
        "total": 0,
        "totalPages": 0,
    }


@router.post("/seller/ads/campaigns")
async def create_campaign(
    campaign: AdCampaignCreate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Create a new ad campaign.
    
    The product must belong to the seller.
    Campaign starts in active status.
    """
    # TODO: Implement campaign creation
    return {
        "message": "Campaign created (stub response)",
        "campaignId": None,
        "productId": campaign.product_id,
        "status": "active",
    }


@router.patch("/seller/ads/campaigns/{campaign_id}")
async def update_campaign(
    campaign_id: str,
    update: AdCampaignUpdate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Update an ad campaign.
    
    Can update keywords, bid, budget, or status.
    """
    # TODO: Implement campaign update
    return {
        "message": "Campaign updated (stub response)",
        "campaignId": campaign_id,
    }


# ============ Ad Serving (Internal) ============


@router.get("/ads/serve")
async def serve_ads(
    q: str = Query(..., min_length=1, description="Search query for keyword matching"),
    limit: int = Query(3, ge=1, le=10, description="Max sponsored products to return"),
) -> dict:
    """
    Serve sponsored products for a search query (internal endpoint).
    
    Returns products with active campaigns matching the query keywords.
    Sorted by bid amount (auction-style).
    
    Note: This endpoint would typically be internal, called by the
    product search endpoint to inject sponsored results.
    """
    # TODO: Implement ad serving
    return {
        "sponsoredProducts": [],
        "query": q,
    }
