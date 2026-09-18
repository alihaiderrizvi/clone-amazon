"""Product catalog API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.auth import CurrentUser, get_current_user_optional
from app.models.product import Product

router = APIRouter()


@router.get("")
async def list_products(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    category_id: str | None = Query(None, alias="categoryId", description="Filter by category"),
    seller_id: str | None = Query(None, alias="sellerId", description="Filter by seller"),
) -> dict:
    """
    List products with pagination and optional filters.
    
    Returns a paginated list of published products.
    """
    # TODO: Implement actual database query
    return {
        "products": [],
        "page": page,
        "limit": limit,
        "total": 0,
        "totalPages": 0,
    }


@router.get("/search")
async def search_products(
    q: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
) -> dict:
    """
    Search products by text query.
    
    Uses MongoDB text index on title, brand, and description.
    """
    # TODO: Implement text search
    return {
        "products": [],
        "query": q,
        "page": page,
        "limit": limit,
        "total": 0,
        "totalPages": 0,
    }


@router.get("/{slug}")
async def get_product_by_slug(
    slug: str,
    user: Annotated[CurrentUser | None, Depends(get_current_user_optional)] = None,
) -> dict:
    """
    Get a single product by its slug.
    
    Returns full product details including seller info.
    """
    # TODO: Implement product lookup
    return {
        "product": None,
        "message": f"Product with slug '{slug}' not found (stub response)",
    }
