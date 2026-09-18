"""Product review API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.auth import CurrentUser, get_current_user, get_current_user_optional
from app.models.review import Review, ReviewCreate

router = APIRouter()


@router.get("/products/{product_id}/reviews")
async def list_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    sort: str = Query("recent", pattern="^(recent|helpful|rating_high|rating_low)$"),
    user: Annotated[CurrentUser | None, Depends(get_current_user_optional)] = None,
) -> dict:
    """
    List reviews for a product.
    
    Supports sorting by recent, helpful votes, or rating.
    If user is authenticated, indicates whether they've reviewed this product.
    """
    # TODO: Implement review listing
    return {
        "reviews": [],
        "productId": product_id,
        "page": page,
        "limit": limit,
        "total": 0,
        "totalPages": 0,
        "userHasReviewed": False,
        "ratingDistribution": {
            "5": 0,
            "4": 0,
            "3": 0,
            "2": 0,
            "1": 0,
        },
    }


@router.post("/products/{product_id}/reviews")
async def create_review(
    product_id: str,
    review: ReviewCreate,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Create a review for a product.
    
    Users can only review a product once.
    Verified purchase status is automatically determined.
    """
    # TODO: Implement review creation
    return {
        "message": "Review created (stub response)",
        "reviewId": None,
        "productId": product_id,
        "rating": review.rating,
    }
