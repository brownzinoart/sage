from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

@router.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "BudGuide API",
        "version": "1.0.0"
    }

@router.get("/db")
async def database_health():
    """Database health check"""
    # For mock database, always return healthy
    return {
        "status": "healthy", 
        "database": "mock",
        "products_count": 10,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
