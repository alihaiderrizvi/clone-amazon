"""Category API routes."""

from fastapi import APIRouter

from app.models.product import Category

router = APIRouter()


@router.get("")
async def list_categories() -> dict:
    """
    List all categories.
    
    Returns a hierarchical list of categories.
    """
    # TODO: Implement category listing
    return {
        "categories": [],
    }


@router.get("/{slug}")
async def get_category_by_slug(slug: str) -> dict:
    """
    Get a category by its slug.
    
    Returns the category and its subcategories.
    """
    # TODO: Implement category lookup
    return {
        "category": None,
        "subcategories": [],
        "message": f"Category with slug '{slug}' not found (stub response)",
    }
