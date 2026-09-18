"""Product catalog API routes."""

import math
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.auth import CurrentUser, get_current_user_optional
from app.database import get_db
from app.models.product import Product
from app.models.user import Seller

router = APIRouter()


# =============================================================================
# Response Models
# =============================================================================

from pydantic import BaseModel, Field, model_validator


class PaginationMeta(BaseModel):
    """Pagination metadata."""
    page: int
    limit: int
    total: int
    total_pages: int = Field(alias="totalPages")
    
    model_config = {"populate_by_name": True}


class ProductListItem(BaseModel):
    """Product item in list responses (subset of fields)."""
    id: str
    slug: str
    title: str
    brand: str | None = None
    category_id: str = Field(alias="categoryId")
    price_cents: int = Field(alias="priceCents")
    list_price_cents: int | None = Field(None, alias="listPriceCents")
    images: list[str] = []
    main_image: str | None = Field(None, alias="mainImage")
    rating_avg: float | None = Field(None, alias="ratingAvg")
    rating_count: int = Field(0, alias="ratingCount")
    stock: int = 0
    
    model_config = {"populate_by_name": True}

    @model_validator(mode="after")
    def populate_main_image(self):
        if not self.main_image and self.images:
            self.main_image = self.images[0]
        return self


class ProductListResponse(BaseModel):
    """Response for product list endpoints."""
    products: list[ProductListItem]
    pagination: PaginationMeta


class SellerInfo(BaseModel):
    """Seller info embedded in product detail."""
    id: str
    store_name: str = Field(alias="storeName")
    display_name: str = Field(alias="displayName")
    
    model_config = {"populate_by_name": True}


class ProductDetailResponse(BaseModel):
    """Response for single product endpoint."""
    product: Product
    seller: SellerInfo | None = None


class SearchResultItem(ProductListItem):
    """Search result with relevance score."""
    score: float | None = None


class ProductSearchResponse(BaseModel):
    """Response for product search endpoint."""
    products: list[SearchResultItem]
    query: str
    pagination: PaginationMeta


# =============================================================================
# Endpoints
# =============================================================================

SortOption = Literal["price_asc", "price_desc", "rating", "newest"]


@router.get("", response_model=ProductListResponse)
async def list_products(
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    category: str | None = Query(None, alias="category", description="Filter by category slug"),
    category_id: str | None = Query(None, alias="categoryId", description="Filter by category ID"),
    min_price: float | None = Query(None, alias="minPrice", ge=0, description="Minimum price in dollars"),
    max_price: float | None = Query(None, alias="maxPrice", ge=0, description="Maximum price in dollars"),
    brand: str | None = Query(None, description="Filter by brand name"),
    seller_id: str | None = Query(None, alias="sellerId", description="Filter by seller"),
    sort: SortOption = Query("newest", description="Sort order"),
):
    """
    List products with pagination and optional filters.
    
    Returns a paginated list of published products.
    """
    # Build query filter
    query: dict = {"status": "published"}
    
    # Category filter - support both slug and ID
    if category:
        # Look up category by slug to get ID
        cat = await db.categories.find_one({"slug": category})
        if cat:
            query["categoryId"] = cat["id"]
    elif category_id:
        query["categoryId"] = category_id
    
    # Price filter (convert dollars to cents)
    if min_price is not None or max_price is not None:
        price_filter = {}
        if min_price is not None:
            price_filter["$gte"] = int(min_price * 100)
        if max_price is not None:
            price_filter["$lte"] = int(max_price * 100)
        query["priceCents"] = price_filter
    
    # Brand filter (case-insensitive)
    if brand:
        query["brand"] = {"$regex": f"^{brand}$", "$options": "i"}
    
    # Seller filter
    if seller_id:
        query["sellerId"] = seller_id
    
    # Sort mapping
    sort_mapping = {
        "price_asc": [("priceCents", 1)],
        "price_desc": [("priceCents", -1)],
        "rating": [("ratingAvg", -1), ("ratingCount", -1)],
        "newest": [("createdAt", -1)],
    }
    sort_order = sort_mapping.get(sort, [("createdAt", -1)])
    
    # Get total count
    total = await db.products.count_documents(query)
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    # Get paginated results
    skip = (page - 1) * limit
    cursor = db.products.find(query).sort(sort_order).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    
    # Convert to response model
    product_items = [ProductListItem(**p) for p in products]
    
    return ProductListResponse(
        products=product_items,
        pagination=PaginationMeta(
            page=page,
            limit=limit,
            total=total,
            totalPages=total_pages,
        ),
    )


@router.get("/search", response_model=ProductSearchResponse)
async def search_products(
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    q: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Search products by text query.
    
    Uses MongoDB text index on title, brand, and description.
    Returns results sorted by relevance score.
    """
    # Text search query
    query = {
        "$text": {"$search": q},
        "status": "published",
    }
    
    # Project with text score
    projection = {
        "score": {"$meta": "textScore"},
    }
    
    # Get total count (for text search, we need to run the query)
    total = await db.products.count_documents(query)
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    # Get paginated results sorted by text score
    skip = (page - 1) * limit
    cursor = (
        db.products.find(query, projection)
        .sort([("score", {"$meta": "textScore"})])
        .skip(skip)
        .limit(limit)
    )
    products = await cursor.to_list(length=limit)
    
    # Convert to response model with scores
    product_items = []
    for p in products:
        # Extract score separately since it's added by projection
        score = p.pop("score", None)
        product_items.append(SearchResultItem(**p, score=score))
    
    return ProductSearchResponse(
        products=product_items,
        query=q,
        pagination=PaginationMeta(
            page=page,
            limit=limit,
            total=total,
            totalPages=total_pages,
        ),
    )


@router.get("/{slug}", response_model=ProductDetailResponse)
async def get_product_by_slug(
    slug: str,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    user: Annotated[CurrentUser | None, Depends(get_current_user_optional)] = None,
):
    """
    Get a single product by its slug.
    
    Returns full product details including seller info.
    """
    # Find product by slug
    product_doc = await db.products.find_one({"slug": slug})
    
    if not product_doc:
        raise HTTPException(status_code=404, detail=f"Product with slug '{slug}' not found")
    
    # Get seller info
    seller_info = None
    if product_doc.get("sellerId"):
        seller_doc = await db.sellers.find_one({"id": product_doc["sellerId"]})
        if seller_doc:
            seller_info = SellerInfo(
                id=seller_doc["id"],
                storeName=seller_doc["storeName"],
                displayName=seller_doc["displayName"],
            )
    
    # Convert to Product model
    product = Product(**product_doc)
    
    return ProductDetailResponse(
        product=product,
        seller=seller_info,
    )
