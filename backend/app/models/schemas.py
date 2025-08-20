from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class ChatMessage(BaseModel):
    text: str
    session_id: Optional[str] = None
    privacy_level: int = Field(default=1, ge=1, le=4)
    user_id: Optional[uuid.UUID] = None

class ProductInfo(BaseModel):
    id: uuid.UUID
    name: str
    brand: Optional[str]
    description: Optional[str]
    cbd_mg: Optional[float]
    thc_mg: Optional[float]
    cbg_mg: Optional[float]
    cbn_mg: Optional[float]
    cbc_mg: Optional[float]
    thca_percentage: Optional[float]
    price: float
    effects: List[str] = []
    terpenes: Optional[Dict[str, float]] = {}
    lab_tested: bool = False
    lab_report_url: Optional[str] = None
    match_score: Optional[float] = None
    product_type: str
    strain_type: Optional[str] = None
    in_stock: bool = True

class EducationalContent(BaseModel):
    title: str
    content: str
    level: str  # beginner, intermediate, advanced
    key_points: List[str] = []
    faqs: List[Dict[str, str]] = []
    related_topics: List[str] = []

class ChatResponse(BaseModel):
    session_id: str
    response: str
    products: List[ProductInfo] = []
    suggestions: List[str] = []
    educational_content: Optional[EducationalContent] = None

class ConversationSummary(BaseModel):
    session_id: str
    message_count: int
    intents: List[str]
    preferences: Dict[str, Any] = {}
    product_interests: List[str] = []
    started_at: datetime
    ended_at: Optional[datetime] = None

class ProductFilter(BaseModel):
    cannabinoid: Optional[str] = None
    effect: Optional[str] = None
    product_type: Optional[str] = None
    max_price: Optional[float] = None
    min_cbd: Optional[float] = None
    max_thc: Optional[float] = None

class SearchRequest(BaseModel):
    query: str
    filters: Optional[ProductFilter] = None
    limit: int = Field(default=5, ge=1, le=20)
    session_id: Optional[str] = None

class AnalyticsEvent(BaseModel):
    event_type: str
    session_id: Optional[str] = None
    user_id: Optional[uuid.UUID] = None
    properties: Dict[str, Any] = {}
    page_url: Optional[str] = None
    referrer: Optional[str] = None
    user_agent: Optional[str] = None