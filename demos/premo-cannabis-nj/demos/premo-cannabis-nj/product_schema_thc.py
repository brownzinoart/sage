from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
import uuid

class THCProduct(BaseModel):
    """Extended product model for THC/cannabis products"""
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    external_id: str
    name: str
    brand: str
    
    # Cannabis-specific categorization
    category: Literal["flower", "edibles", "vapes", "concentrates", "pre-rolls", "topicals"]
    strain_type: Literal["indica", "sativa", "hybrid", "cbd-dominant", "balanced"]
    
    # Cannabinoid profile (in mg for edibles, % for flower/concentrates)
    thc_percentage: Optional[float] = Field(None, ge=0, le=100)
    thc_mg: Optional[float] = Field(None, ge=0)
    thca_percentage: Optional[float] = Field(None, ge=0, le=100)
    cbd_percentage: Optional[float] = Field(None, ge=0, le=100)
    cbd_mg: Optional[float] = Field(None, ge=0)
    cbg_percentage: Optional[float] = Field(None, ge=0, le=100)
    cbn_percentage: Optional[float] = Field(None, ge=0, le=100)
    
    # Product details
    description: str
    weight_grams: Optional[float] = None
    volume_ml: Optional[float] = None
    unit_count: Optional[int] = None
    
    # Pricing
    price_eighth: Optional[float] = None  # For flower
    price_quarter: Optional[float] = None
    price_half: Optional[float] = None
    price_ounce: Optional[float] = None
    price_unit: Optional[float] = None  # For other products
    
    # Effects and terpenes
    effects: List[str] = []
    terpenes: Dict[str, float] = {}
    dominant_terpene: Optional[str] = None
    
    # Compliance and testing
    lab_tested: bool = True
    lab_test_date: Optional[datetime] = None
    lab_report_url: Optional[str] = None
    batch_number: Optional[str] = None
    harvest_date: Optional[datetime] = None
    
    # State compliance
    state: str = "NJ"
    recreational: bool = True
    medical: bool = True
    age_restriction: int = 21
    purchase_limit_grams: Optional[float] = 28.35  # 1 oz in NJ
    
    # Availability
    in_stock: bool = True
    quantity_available: Optional[int] = None
    
    # Additional metadata
    image_url: Optional[str] = None
    cultivation_method: Optional[Literal["indoor", "outdoor", "greenhouse"]] = None
    organic: bool = False
    
class NJComplianceInfo(BaseModel):
    """New Jersey specific compliance information"""
    license_number: str
    dispensary_name: str = "Premo Cannabis Company"
    dispensary_license: str
    requires_id_check: bool = True
    min_age: int = 21
    daily_limit_flower_grams: float = 28.35  # 1 oz
    daily_limit_concentrate_grams: float = 5
    daily_limit_edibles_mg_thc: float = 1000
    tax_rate_recreational: float = 0.0625  # 6.25% state tax
    tax_rate_medical: float = 0.0  # Medical is tax-exempt in NJ
    
class ProductSearchFilters(BaseModel):
    """Filters for THC product search"""
    category: Optional[str] = None
    strain_type: Optional[str] = None
    min_thc: Optional[float] = None
    max_thc: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    effects: Optional[List[str]] = None
    terpenes: Optional[List[str]] = None
    brand: Optional[str] = None
    in_stock_only: bool = True
    recreational: Optional[bool] = None
    medical: Optional[bool] = None