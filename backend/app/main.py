"""FastAPI application for Amazon Clone backend."""

import logging
import re
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import check_mongodb_connection, close_mongodb_connection, connect_to_mongodb
from app.routers import ads, cart, categories, health, orders, products, reviews, sellers, wishlist

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting Amazon Clone Backend...")
    await connect_to_mongodb()
    yield
    # Shutdown
    logger.info("Shutting down...")
    await close_mongodb_connection()


app = FastAPI(
    title="Amazon Clone API",
    description="Backend API for Amazon Clone e-commerce platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Configuration
# Allow localhost for development and Vercel for production
ALLOWED_ORIGIN_PATTERNS = [
    r"^http://localhost:\d+$",
    r"^http://127\.0\.0\.1:\d+$",
    r"^https://.*\.vercel\.app$",
]


def is_allowed_origin(origin: str) -> bool:
    """Check if origin matches allowed patterns."""
    return any(re.match(pattern, origin) for pattern in ALLOWED_ORIGIN_PATTERNS)


# Using allow_origin_regex for pattern matching
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"(http://localhost:\d+|http://127\.0\.0\.1:\d+|https://.*\.vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])
app.include_router(wishlist.router, prefix="/wishlist", tags=["Wishlist"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(reviews.router, tags=["Reviews"])
app.include_router(sellers.router, tags=["Sellers"])
app.include_router(ads.router, tags=["Ads"])


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "Amazon Clone API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
    }
