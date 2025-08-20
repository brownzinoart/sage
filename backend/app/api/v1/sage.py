from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.services.advanced_gemini_service import AdvancedGeminiService

router = APIRouter()

# Initialize Advanced Gemini service
sage_service = AdvancedGeminiService()

class SageQuery(BaseModel):
    query: str
    experience_level: Optional[str] = "curious"

class SageResponse(BaseModel):
    explanation: str
    products: List[Dict[str, Any]]
    intent: Optional[str] = None
    persona: Optional[str] = None
    follow_up_questions: Optional[List[str]] = None

@router.post("/ask", response_model=SageResponse)
async def ask_sage(query: SageQuery):
    """
    Advanced Sage endpoint with sophisticated AI reasoning
    """
    
    try:
        # Generate comprehensive AI response with experience level
        response_data = sage_service.generate_sage_response(query.query, experience_level=query.experience_level)
        
        return SageResponse(
            explanation=response_data['explanation'],
            products=response_data['products'],
            intent=response_data.get('intent'),
            persona=response_data.get('persona'),
            follow_up_questions=response_data.get('follow_up_questions', [])
        )
        
    except Exception as e:
        print(f"Error processing Sage query: {e}")
        raise HTTPException(status_code=500, detail="Error processing query")

@router.get("/health")
async def sage_health():
    """Health check for Sage service"""
    return {
        "status": "healthy",
        "service": "Advanced Sage AI",
        "gemini_available": sage_service.is_available()
    }