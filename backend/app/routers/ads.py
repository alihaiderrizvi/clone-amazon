"""Advertising API routes with second-price auction."""

import math
import uuid
from datetime import date, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.auth import CurrentUser, get_current_user, get_current_user_optional
from app.database import get_db
from app.models.ads import (
    AdCampaign,
    AdCampaignCreate,
    AdCampaignUpdate,
    AdClickRequest,
    AdEventType,
    AdSpendDaily,
    Advertiser,
    CampaignStats,
    CampaignStatus,
    CampaignWithStats,
    SponsoredProduct,
)

router = APIRouter()


def generate_id(prefix: str) -> str:
    """Generate a unique ID with a prefix."""
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def today_str() -> str:
    """Get today's date as a string."""
    return date.today().isoformat()


# ============ Advertiser Onboarding ============


@router.post("/seller/ads/enable")
async def enable_advertising(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """
    Enable advertising for the current seller.
    
    Creates an advertiser account linked to the seller account.
    Requires an active seller account.
    """
    # Check if user has a seller account
    seller = await db.sellers.find_one({"userId": user.user_id})
    if not seller:
        raise HTTPException(
            status_code=400,
            detail="You must have a seller account to enable advertising",
        )

    # Check if advertising is already enabled
    existing = await db.advertisers.find_one({"sellerId": seller["id"]})
    if existing:
        return {
            "message": "Advertising already enabled",
            "advertiserId": existing["id"],
            "sellerId": seller["id"],
            "userId": user.user_id,
            "enabled": True,
        }

    # Create advertiser record
    advertiser_id = generate_id("adv")
    advertiser = {
        "id": advertiser_id,
        "sellerId": seller["id"],
        "userId": user.user_id,
        "enabledAt": datetime.utcnow(),
    }
    await db.advertisers.insert_one(advertiser)

    return {
        "message": "Advertising enabled successfully",
        "advertiserId": advertiser_id,
        "sellerId": seller["id"],
        "userId": user.user_id,
        "enabled": True,
    }


@router.get("/seller/ads/status")
async def get_advertising_status(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """
    Check if advertising is enabled for the current seller.
    """
    # Check if user has a seller account
    seller = await db.sellers.find_one({"userId": user.user_id})
    if not seller:
        return {"enabled": False, "hasSeller": False}

    # Check if advertiser exists
    advertiser = await db.advertisers.find_one({"sellerId": seller["id"]})
    if not advertiser:
        return {"enabled": False, "hasSeller": True, "sellerId": seller["id"]}

    return {
        "enabled": True,
        "hasSeller": True,
        "advertiserId": advertiser["id"],
        "sellerId": seller["id"],
    }


# ============ Campaign Management ============


async def get_advertiser_for_user(
    db: AsyncIOMotorDatabase, user_id: str
) -> dict:
    """Get advertiser record for a user, raising 403 if not found."""
    seller = await db.sellers.find_one({"userId": user_id})
    if not seller:
        raise HTTPException(status_code=403, detail="Seller account required")

    advertiser = await db.advertisers.find_one({"sellerId": seller["id"]})
    if not advertiser:
        raise HTTPException(status_code=403, detail="Advertising not enabled")

    return advertiser


async def get_today_spend(db: AsyncIOMotorDatabase, campaign_id: str) -> dict:
    """Get today's spend data for a campaign."""
    today = today_str()
    spend = await db.adSpendDaily.find_one({"campaignId": campaign_id, "date": today})
    return spend or {"spentCents": 0, "impressions": 0, "clicks": 0}


@router.get("/seller/ads/campaigns")
async def list_campaigns(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None, pattern="^(active|paused)$"),
) -> dict:
    """
    List the current advertiser's campaigns with stats.
    """
    advertiser = await get_advertiser_for_user(db, user.user_id)

    # Build query
    query: dict = {"advertiserId": advertiser["id"]}
    if status:
        query["status"] = status

    # Get total count
    total = await db.adCampaigns.count_documents(query)
    total_pages = math.ceil(total / limit) if total > 0 else 1

    # Get paginated results
    skip = (page - 1) * limit
    cursor = db.adCampaigns.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    campaigns = await cursor.to_list(length=limit)

    # Enrich with today's stats
    today = today_str()
    enriched = []
    for c in campaigns:
        spend = await db.adSpendDaily.find_one({"campaignId": c["id"], "date": today})
        enriched.append({
            **c,
            "spentTodayCents": spend["spentCents"] if spend else 0,
            "impressionsToday": spend["impressions"] if spend else 0,
            "clicksToday": spend["clicks"] if spend else 0,
        })

    return {
        "campaigns": enriched,
        "page": page,
        "limit": limit,
        "total": total,
        "totalPages": total_pages,
    }


@router.post("/seller/ads/campaigns")
async def create_campaign(
    campaign: AdCampaignCreate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """
    Create a new ad campaign.
    
    The product must belong to the seller.
    Campaign starts in active status.
    """
    advertiser = await get_advertiser_for_user(db, user.user_id)

    # Verify product belongs to this seller
    product = await db.products.find_one({"id": campaign.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    seller = await db.sellers.find_one({"id": advertiser["sellerId"]})
    if not seller or product.get("sellerId") != seller["id"]:
        raise HTTPException(
            status_code=403, detail="Product does not belong to your seller account"
        )

    # Create campaign
    now = datetime.utcnow()
    campaign_id = generate_id("camp")
    campaign_doc = {
        "id": campaign_id,
        "advertiserId": advertiser["id"],
        "productId": campaign.product_id,
        "keywords": [k.lower().strip() for k in campaign.keywords],
        "bidCents": campaign.bid_cents,
        "dailyBudgetCents": campaign.daily_budget_cents,
        "status": CampaignStatus.ACTIVE.value,
        "createdAt": now,
        "updatedAt": now,
    }
    await db.adCampaigns.insert_one(campaign_doc)

    return {
        "message": "Campaign created successfully",
        "campaign": campaign_doc,
    }


@router.get("/seller/ads/campaigns/{campaign_id}")
async def get_campaign(
    campaign_id: str,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """
    Get a campaign's details with stats.
    """
    advertiser = await get_advertiser_for_user(db, user.user_id)

    campaign = await db.adCampaigns.find_one({"id": campaign_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign["advertiserId"] != advertiser["id"]:
        raise HTTPException(status_code=403, detail="Not your campaign")

    # Get product info
    product = await db.products.find_one({"id": campaign["productId"]})

    # Get today's stats
    spend = await get_today_spend(db, campaign_id)

    return {
        "campaign": {
            **campaign,
            "spentTodayCents": spend["spentCents"],
            "impressionsToday": spend["impressions"],
            "clicksToday": spend["clicks"],
        },
        "product": product,
    }


@router.patch("/seller/ads/campaigns/{campaign_id}")
async def update_campaign(
    campaign_id: str,
    update: AdCampaignUpdate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """
    Update an ad campaign.
    
    Can update keywords, bid, budget, or status.
    """
    advertiser = await get_advertiser_for_user(db, user.user_id)

    campaign = await db.adCampaigns.find_one({"id": campaign_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign["advertiserId"] != advertiser["id"]:
        raise HTTPException(status_code=403, detail="Not your campaign")

    # Build update document
    update_doc: dict = {"updatedAt": datetime.utcnow()}

    if update.keywords is not None:
        update_doc["keywords"] = [k.lower().strip() for k in update.keywords]
    if update.bid_cents is not None:
        update_doc["bidCents"] = update.bid_cents
    if update.daily_budget_cents is not None:
        update_doc["dailyBudgetCents"] = update.daily_budget_cents
    if update.status is not None:
        update_doc["status"] = update.status.value

    await db.adCampaigns.update_one({"id": campaign_id}, {"$set": update_doc})

    # Return updated campaign
    updated = await db.adCampaigns.find_one({"id": campaign_id})
    return {
        "message": "Campaign updated successfully",
        "campaign": updated,
    }


@router.delete("/seller/ads/campaigns/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """
    Delete an ad campaign.
    """
    advertiser = await get_advertiser_for_user(db, user.user_id)

    campaign = await db.adCampaigns.find_one({"id": campaign_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign["advertiserId"] != advertiser["id"]:
        raise HTTPException(status_code=403, detail="Not your campaign")

    await db.adCampaigns.delete_one({"id": campaign_id})

    return {"message": "Campaign deleted successfully"}


# ============ Campaign Stats ============


@router.get("/seller/ads/campaigns/{campaign_id}/stats")
async def get_campaign_stats(
    campaign_id: str,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    start_date: str | None = Query(None, alias="startDate"),
    end_date: str | None = Query(None, alias="endDate"),
) -> dict:
    """
    Get campaign performance statistics.
    
    Returns aggregated stats for the date range.
    """
    advertiser = await get_advertiser_for_user(db, user.user_id)

    campaign = await db.adCampaigns.find_one({"id": campaign_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign["advertiserId"] != advertiser["id"]:
        raise HTTPException(status_code=403, detail="Not your campaign")

    # Default to last 30 days
    if not end_date:
        end_date = today_str()
    if not start_date:
        start_date = (date.today() - timedelta(days=30)).isoformat()

    # Aggregate daily stats
    query = {
        "campaignId": campaign_id,
        "date": {"$gte": start_date, "$lte": end_date},
    }
    cursor = db.adSpendDaily.find(query).sort("date", 1)
    daily_stats = await cursor.to_list(length=100)

    # Calculate totals
    total_impressions = sum(d.get("impressions", 0) for d in daily_stats)
    total_clicks = sum(d.get("clicks", 0) for d in daily_stats)
    total_spend = sum(d.get("spentCents", 0) for d in daily_stats)
    total_conversions = sum(d.get("conversions", 0) for d in daily_stats)

    ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0

    # Get orders attributed to this campaign (if we track that)
    # For now, use conversions as proxy
    attributed_orders = total_conversions
    attributed_revenue = 0  # Would need order tracking

    acos = (total_spend / attributed_revenue * 100) if attributed_revenue > 0 else None

    return {
        "campaignId": campaign_id,
        "startDate": start_date,
        "endDate": end_date,
        "stats": {
            "impressions": total_impressions,
            "clicks": total_clicks,
            "ctr": round(ctr, 2),
            "spendCents": total_spend,
            "orders": attributed_orders,
            "revenueCents": attributed_revenue,
            "acos": round(acos, 2) if acos is not None else None,
        },
        "daily": [
            {
                "date": d["date"],
                "impressions": d.get("impressions", 0),
                "clicks": d.get("clicks", 0),
                "spentCents": d.get("spentCents", 0),
            }
            for d in daily_stats
        ],
    }


# ============ Ad Serving (Second-Price Auction) ============


@router.get("/ads/serve")
async def serve_ads(
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    user: Annotated[CurrentUser | None, Depends(get_current_user_optional)] = None,
    q: str = Query(..., min_length=1, description="Search query for keyword matching"),
    limit: int = Query(3, ge=1, le=10, description="Max sponsored products to return"),
) -> dict:
    """
    Serve sponsored products for a search query using second-price auction.
    
    1. Find active campaigns with keyword matching query tokens
    2. Filter out campaigns over daily budget
    3. Rank by bidCents descending
    4. Return top N products with their campaign IDs
    5. Record impressions
    
    Note: This endpoint is internal, called by product search.
    """
    today = today_str()
    query_tokens = set(q.lower().split())

    # Find active campaigns with matching keywords
    # Using $in with the keywords array
    campaigns = await db.adCampaigns.find({
        "status": "active",
        "keywords": {"$in": list(query_tokens)},
    }).to_list(length=100)

    if not campaigns:
        return {"sponsoredProducts": [], "query": q}

    # Filter out campaigns over daily budget and enrich with today's spend
    eligible = []
    for c in campaigns:
        spend = await db.adSpendDaily.find_one({"campaignId": c["id"], "date": today})
        spent_today = spend["spentCents"] if spend else 0

        if spent_today < c["dailyBudgetCents"]:
            eligible.append({
                **c,
                "spentTodayCents": spent_today,
            })

    if not eligible:
        return {"sponsoredProducts": [], "query": q}

    # Sort by bid (descending) for auction
    eligible.sort(key=lambda x: x["bidCents"], reverse=True)

    # Take top N
    winners = eligible[:limit]

    # Calculate second prices for each winner and fetch product details
    # Second price = next highest bid + 1 cent (or min bid if last)
    sponsored_products = []
    for i, winner in enumerate(winners):
        if i + 1 < len(eligible):
            second_price = eligible[i + 1]["bidCents"] + 1
        else:
            # No next bidder, use minimum (1 cent)
            second_price = 1

        # Fetch product details
        product = await db.products.find_one({"id": winner["productId"]})
        product_data = None
        if product:
            product_data = {
                "id": product["id"],
                "slug": product.get("slug", ""),
                "title": product.get("title", ""),
                "brand": product.get("brand", ""),
                "priceCents": product.get("priceCents", 0),
                "listPriceCents": product.get("listPriceCents"),
                "mainImage": product.get("images", ["/placeholder-product.svg"])[0] if product.get("images") else "/placeholder-product.svg",
                "ratingAvg": product.get("ratingAvg", 0),
                "ratingCount": product.get("ratingCount", 0),
            }

        sponsored_products.append({
            "campaignId": winner["id"],
            "productId": winner["productId"],
            "bidCents": winner["bidCents"],
            "secondPriceCents": second_price,
            "product": product_data,
        })

        # Record impression
        event_id = generate_id("evt")
        await db.adEvents.insert_one({
            "id": event_id,
            "campaignId": winner["id"],
            "productId": winner["productId"],
            "eventType": AdEventType.IMPRESSION.value,
            "query": q,
            "ts": datetime.utcnow(),
            "userId": user.user_id if user else None,
            "costCents": 0,
        })

        # Update daily impressions
        await db.adSpendDaily.update_one(
            {"campaignId": winner["id"], "date": today},
            {
                "$inc": {"impressions": 1},
                "$setOnInsert": {"id": generate_id("spd"), "clicks": 0, "spentCents": 0, "conversions": 0},
            },
            upsert=True,
        )

    return {"sponsoredProducts": sponsored_products, "query": q}


@router.post("/ads/click")
async def record_ad_click(
    click: AdClickRequest,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    user: Annotated[CurrentUser | None, Depends(get_current_user_optional)] = None,
) -> dict:
    """
    Record an ad click and charge the advertiser.
    
    Uses second-price auction pricing:
    - Find the next highest bidder
    - Charge second price + 1 cent
    
    Body: { campaignId, productId, query }
    """
    today = today_str()

    # Get campaign
    campaign = await db.adCampaigns.find_one({"id": click.campaign_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Check if campaign is still active and under budget
    spend = await db.adSpendDaily.find_one({"campaignId": click.campaign_id, "date": today})
    spent_today = spend["spentCents"] if spend else 0

    if campaign["status"] != "active":
        return {"message": "Campaign is not active", "charged": False}

    if spent_today >= campaign["dailyBudgetCents"]:
        return {"message": "Campaign over daily budget", "charged": False}

    # Calculate second price
    # Find competing campaigns for same keywords
    query_tokens = set(click.query.lower().split())
    competitors = await db.adCampaigns.find({
        "status": "active",
        "keywords": {"$in": list(query_tokens)},
        "id": {"$ne": click.campaign_id},
    }).sort("bidCents", -1).to_list(length=1)

    if competitors:
        second_price = competitors[0]["bidCents"] + 1
    else:
        second_price = 1  # Minimum bid

    # Don't charge more than the bid
    charge_amount = min(second_price, campaign["bidCents"])

    # Record click event
    event_id = generate_id("evt")
    await db.adEvents.insert_one({
        "id": event_id,
        "campaignId": click.campaign_id,
        "productId": click.product_id,
        "eventType": AdEventType.CLICK.value,
        "query": click.query,
        "ts": datetime.utcnow(),
        "userId": user.user_id if user else None,
        "costCents": charge_amount,
    })

    # Update daily spend
    await db.adSpendDaily.update_one(
        {"campaignId": click.campaign_id, "date": today},
        {
            "$inc": {"clicks": 1, "spentCents": charge_amount},
            "$setOnInsert": {"id": generate_id("spd"), "impressions": 0, "conversions": 0},
        },
        upsert=True,
    )

    return {
        "message": "Click recorded",
        "charged": True,
        "costCents": charge_amount,
    }


# ============ Advertiser Dashboard Stats ============


@router.get("/seller/ads/overview")
async def get_ads_overview(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """
    Get overview stats for the advertiser dashboard.
    """
    advertiser = await get_advertiser_for_user(db, user.user_id)

    # Get date range (last 30 days)
    end_date = today_str()
    start_date = (date.today() - timedelta(days=30)).isoformat()

    # Get all campaigns for this advertiser
    campaigns = await db.adCampaigns.find({"advertiserId": advertiser["id"]}).to_list(length=1000)
    campaign_ids = [c["id"] for c in campaigns]

    if not campaign_ids:
        return {
            "totalSpendCents": 0,
            "totalImpressions": 0,
            "totalClicks": 0,
            "avgCtr": 0,
            "activeCampaigns": 0,
            "pausedCampaigns": 0,
        }

    # Aggregate stats
    pipeline = [
        {
            "$match": {
                "campaignId": {"$in": campaign_ids},
                "date": {"$gte": start_date, "$lte": end_date},
            }
        },
        {
            "$group": {
                "_id": None,
                "totalSpend": {"$sum": "$spentCents"},
                "totalImpressions": {"$sum": "$impressions"},
                "totalClicks": {"$sum": "$clicks"},
            }
        },
    ]

    result = await db.adSpendDaily.aggregate(pipeline).to_list(length=1)

    if result:
        stats = result[0]
        total_impressions = stats.get("totalImpressions", 0)
        total_clicks = stats.get("totalClicks", 0)
        ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
    else:
        stats = {"totalSpend": 0, "totalImpressions": 0, "totalClicks": 0}
        ctr = 0

    active = sum(1 for c in campaigns if c["status"] == "active")
    paused = sum(1 for c in campaigns if c["status"] == "paused")

    return {
        "totalSpendCents": stats.get("totalSpend", 0),
        "totalImpressions": stats.get("totalImpressions", 0),
        "totalClicks": stats.get("totalClicks", 0),
        "avgCtr": round(ctr, 2),
        "activeCampaigns": active,
        "pausedCampaigns": paused,
    }


# ============ Seller's Products for Campaign Creation ============


@router.get("/seller/ads/products")
async def get_seller_products_for_ads(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict:
    """
    Get the seller's published products that can be advertised.
    """
    seller = await db.sellers.find_one({"userId": user.user_id})
    if not seller:
        raise HTTPException(status_code=403, detail="Seller account required")

    # Get published products for this seller
    products = await db.products.find({
        "sellerId": seller["id"],
        "status": "published",
    }).to_list(length=100)

    return {
        "products": [
            {
                "id": p["id"],
                "title": p.get("title", ""),
                "slug": p.get("slug", ""),
                "mainImage": p.get("images", ["/placeholder-product.svg"])[0] if p.get("images") else "/placeholder-product.svg",
                "priceCents": p.get("priceCents", 0),
            }
            for p in products
        ]
    }
