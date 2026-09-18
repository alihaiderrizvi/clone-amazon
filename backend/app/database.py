"""MongoDB database setup with Motor async driver."""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings

logger = logging.getLogger(__name__)

# Global database client
_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_to_mongodb() -> None:
    """Connect to MongoDB and create indexes."""
    global _client, _db
    settings = get_settings()

    try:
        _client = AsyncIOMotorClient(settings.mongodb_uri)
        _db = _client.get_default_database()

        # Verify connection
        await _client.admin.command("ping")
        logger.info("Connected to MongoDB")

        # Create indexes
        await _create_indexes()
    except Exception as e:
        logger.warning(f"Failed to connect to MongoDB: {e}")
        logger.warning("App will start but database operations will fail")


async def _create_indexes() -> None:
    """Create database indexes for optimal query performance."""
    if _db is None:
        return

    # Products: text search on title/brand/description, index on sellerId
    await _db.products.create_index(
        [("title", "text"), ("brand", "text"), ("description", "text")],
        name="products_text_search",
    )
    await _db.products.create_index("sellerId", name="products_seller_id")
    await _db.products.create_index("slug", unique=True, name="products_slug")
    await _db.products.create_index("categoryId", name="products_category_id")

    # Categories: index on slug
    await _db.categories.create_index("slug", unique=True, name="categories_slug")

    # Sellers: unique index on userId
    await _db.sellers.create_index("userId", unique=True, name="sellers_user_id")

    # Advertisers: unique index on sellerId
    await _db.advertisers.create_index("sellerId", unique=True, name="advertisers_seller_id")

    # Carts: unique index on userId
    await _db.carts.create_index("userId", unique=True, name="carts_user_id")

    # Wishlists: unique index on userId
    await _db.wishlists.create_index("userId", unique=True, name="wishlists_user_id")

    # Orders: index on userId
    await _db.orders.create_index("userId", name="orders_user_id")

    # Reviews: compound index on productId + userId
    await _db.reviews.create_index(
        [("productId", 1), ("userId", 1)],
        unique=True,
        name="reviews_product_user",
    )

    # Ad Campaigns: index on keywords and advertiserId
    await _db.adCampaigns.create_index("keywords", name="ad_campaigns_keywords")
    await _db.adCampaigns.create_index("advertiserId", name="ad_campaigns_advertiser_id")

    # Ad Events: compound index on campaignId + ts
    await _db.adEvents.create_index(
        [("campaignId", 1), ("ts", -1)],
        name="ad_events_campaign_ts",
    )

    # Ad Spend Daily: compound index on campaignId + date
    await _db.adSpendDaily.create_index(
        [("campaignId", 1), ("date", 1)],
        unique=True,
        name="ad_spend_daily_campaign_date",
    )

    logger.info("Database indexes created")


async def close_mongodb_connection() -> None:
    """Close MongoDB connection."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        logger.info("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance. Raises if not connected."""
    if _db is None:
        raise RuntimeError("Database not connected. Call connect_to_mongodb() first.")
    return _db


async def get_db() -> AsyncGenerator[AsyncIOMotorDatabase, None]:
    """FastAPI dependency to get database instance."""
    yield get_database()


async def check_mongodb_connection() -> bool:
    """Check if MongoDB is connected."""
    if _client is None:
        return False
    try:
        await _client.admin.command("ping")
        return True
    except Exception:
        return False


@asynccontextmanager
async def lifespan_mongodb():
    """Context manager for MongoDB connection lifecycle."""
    await connect_to_mongodb()
    try:
        yield
    finally:
        await close_mongodb_connection()
