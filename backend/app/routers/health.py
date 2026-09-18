"""Health check endpoint."""

from fastapi import APIRouter

from app.database import check_mongodb_connection

router = APIRouter()


@router.get("/health")
async def health_check() -> dict:
    """
    Health check endpoint.
    
    Returns the API status and MongoDB connection status.
    """
    mongodb_connected = await check_mongodb_connection()
    
    return {
        "status": "ok",
        "mongodb": "connected" if mongodb_connected else "disconnected",
    }
