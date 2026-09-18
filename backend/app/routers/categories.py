"""Category API routes."""

import math
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.product import Category

router = APIRouter()


# =============================================================================
# Response Models
# =============================================================================


class CategoryWithCount(BaseModel):
    """Category with product count."""
    id: str
    slug: str
    name: str
    parent_id: str | None = Field(None, alias="parentId")
    image_url: str | None = Field(None, alias="imageUrl")
    sort_order: int = Field(0, alias="sortOrder")
    product_count: int = Field(0, alias="productCount")
    
    model_config = {"populate_by_name": True}


class CategoryListResponse(BaseModel):
    """Response for category list endpoint."""
    categories: list[CategoryWithCount]


class PaginationMeta(BaseModel):
    """Pagination metadata."""
    page: int
    limit: int
    total: int
    total_pages: int = Field(alias="totalPages")
    
    model_config = {"populate_by_name": True}


class ProductListItem(BaseModel):
    """Product item in list responses."""
    id: str
    slug: str
    title: str
    brand: str | None = None
    category_id: str = Field(alias="categoryId")
    price_cents: int = Field(alias="priceCents")
    list_price_cents: int | None = Field(None, alias="listPriceCents")
    images: list[str] = []
    rating_avg: float | None = Field(None, alias="ratingAvg")
    rating_count: int = Field(0, alias="ratingCount")
    stock: int = 0
    
    model_config = {"populate_by_name": True}


class CategoryDetailResponse(BaseModel):
    """Response for single category endpoint."""
    category: Category
    subcategories: list[Category] = []
    products: list[ProductListItem] = []
    pagination: PaginationMeta


# =============================================================================
# Endpoints
# =============================================================================


@router.get("", response_model=CategoryListResponse)
async def list_categories(
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
):
    """
    List all categories.
    
    Returns a flat list of categories with product counts, sorted by sort_order.
    """
    # Get all categories
    cursor = db.categories.find({}).sort("sortOrder", 1)
    categories = await cursor.to_list(length=100)
    
    # Get product counts per category using aggregation
    pipeline = [
        {"$match": {"status": "published"}},
        {"$group": {"_id": "$categoryId", "count": {"$sum": 1}}},
    ]
    counts_cursor = db.products.aggregate(pipeline)
    counts = {doc["_id"]: doc["count"] async for doc in counts_cursor}
    
    # Build response with counts
    categories_with_counts = [
        CategoryWithCount(
            **cat,
            productCount=counts.get(cat["id"], 0),
        )
        for cat in categories
    ]
    
    return CategoryListResponse(categories=categories_with_counts)


@router.get("/{slug}", response_model=CategoryDetailResponse)
async def get_category_by_slug(
    slug: str,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """
    Get a category by its slug.
    
    Returns the category with its subcategories and paginated products.
    """
    # Find category by slug
    category_doc = await db.categories.find_one({"slug": slug})
    
    if not category_doc:
        raise HTTPException(status_code=404, detail=f"Category with slug '{slug}' not found")
    
    category = Category(**category_doc)
    
    # Get subcategories (categories with this as parent)
    subcategories_cursor = db.categories.find({"parentId": category.id}).sort("sortOrder", 1)
    subcategories_docs = await subcategories_cursor.to_list(length=50)
    subcategories = [Category(**doc) for doc in subcategories_docs]
    
    # Get products in this category (paginated)
    query = {
        "categoryId": category.id,
        "status": "published",
    }
    
    total = await db.products.count_documents(query)
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    skip = (page - 1) * limit
    products_cursor = (
        db.products.find(query)
        .sort([("ratingAvg", -1), ("ratingCount", -1)])
        .skip(skip)
        .limit(limit)
    )
    products_docs = await products_cursor.to_list(length=limit)
    products = [ProductListItem(**doc) for doc in products_docs]
    
    return CategoryDetailResponse(
        category=category,
        subcategories=subcategories,
        products=products,
        pagination=PaginationMeta(
            page=page,
            limit=limit,
            total=total,
            totalPages=total_pages,
        ),
    )
