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
    # Hemp-focused fields (for NC/other states)
    cbd_mg: Optional[float]
    thc_mg: Optional[float]
    cbg_mg: Optional[float]
    cbn_mg: Optional[float]
    cbc_mg: Optional[float]
    thca_percentage: Optional[float]
    # NJ Cannabis-focused fields
    thc_percentage: Optional[float]
    cbd_percentage: Optional[float]
    cbda_percentage: Optional[float]
    cbg_percentage: Optional[float]
    cbga_percentage: Optional[float]
    cbn_percentage: Optional[float]
    dominant_terpene: Optional[str] = None
    batch_number: Optional[str] = None
    harvest_date: Optional[str] = None
    price: float
    effects: List[str] = Field(default_factory=list)
    terpenes: Optional[Dict[str, float]] = Field(default_factory=dict)
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
    key_points: List[str] = Field(default_factory=list)
    faqs: List[Dict[str, str]] = Field(default_factory=list)
    related_topics: List[str] = Field(default_factory=list)

class ChatResponse(BaseModel):
    session_id: str
    response: str
    products: List[ProductInfo] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    educational_content: Optional[EducationalContent] = None
    educational_resources: Optional[Dict[str, Any]] = None
    educational_summary: Optional[Dict[str, Any]] = None
    service_status: Optional[int] = None
    status_message: Optional[str] = None

class ConversationSummary(BaseModel):
    session_id: str
    message_count: int
    intents: List[str]
    preferences: Dict[str, Any] = Field(default_factory=dict)
    product_interests: List[str] = Field(default_factory=list)
    started_at: datetime
    ended_at: Optional[datetime] = None

class ProductFilter(BaseModel):
    cannabinoid: Optional[str] = None
    effect: Optional[str] = None
    product_type: Optional[str] = None
    strain_type: Optional[str] = None  # indica/sativa/hybrid
    dominant_terpene: Optional[str] = None
    max_price: Optional[float] = None
    min_price: Optional[float] = None
    min_cbd: Optional[float] = None
    max_thc: Optional[float] = None
    min_thc: Optional[float] = None

class SearchRequest(BaseModel):
    query: str
    filters: Optional[ProductFilter] = None
    limit: int = Field(default=5, ge=1, le=20)
    session_id: Optional[str] = None

class AnalyticsEvent(BaseModel):
    event_type: str
    session_id: Optional[str] = None
    user_id: Optional[uuid.UUID] = None
    properties: Dict[str, Any] = Field(default_factory=dict)
    page_url: Optional[str] = None
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
