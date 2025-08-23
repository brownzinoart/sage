"""
Premo Cannabis Backend Integration
Custom backend endpoints and services for Premo Cannabis demo
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
import json
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Create Premo-specific router
premo_router = APIRouter(prefix="/api/v1/premo", tags=["premo-cannabis"])

class PremoProductService:
    """Service for managing Premo Cannabis product data"""
    
    def __init__(self):
        self.products_file = "demos/premo-cannabis/products.json"
        self.config_file = "demos/premo-cannabis/config.json"
        self._products_cache = None
        self._config_cache = None
    
    def load_products(self) -> Dict[str, Any]:
        """Load Premo products from JSON file"""
        
        if self._products_cache is None:
            try:
                if os.path.exists(self.products_file):
                    with open(self.products_file, 'r') as f:
                        self._products_cache = json.load(f)
                else:
                    # Fallback demo data if scraper hasn't run
                    self._products_cache = self._get_fallback_products()
            except Exception as e:
                logger.error(f"Error loading Premo products: {e}")
                self._products_cache = self._get_fallback_products()
        
        return self._products_cache
    
    def load_config(self) -> Dict[str, Any]:
        """Load Premo configuration"""
        
        if self._config_cache is None:
            try:
                with open(self.config_file, 'r') as f:
                    self._config_cache = json.load(f)
            except Exception as e:
                logger.error(f"Error loading Premo config: {e}")
                self._config_cache = self._get_fallback_config()
        
        return self._config_cache
    
    def get_products_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get products filtered by category"""
        
        products = self.load_products()
        
        if category == "all":
            # Return all products from all categories
            all_products = []
            for cat_products in products.get('categories', {}).values():
                all_products.extend(cat_products)
            return all_products
        
        return products.get('categories', {}).get(category, [])
    
    def search_products(self, query: str, category: Optional[str] = None, 
                       max_price: Optional[float] = None,
                       min_thc: Optional[float] = None) -> List[Dict[str, Any]]:
        """Search products with filters"""
        
        if category:
            products = self.get_products_by_category(category)
        else:
            products = self.get_products_by_category("all")
        
        filtered_products = []
        
        for product in products:
            # Text search
            if query.lower() in product.get('name', '').lower() or \
               query.lower() in product.get('description', '').lower() or \
               query.lower() in product.get('brand', '').lower():
                
                # Price filter
                if max_price:
                    product_price = self._extract_price(product.get('price', ''))
                    if product_price and product_price > max_price:
                        continue
                
                # THC filter
                if min_thc:
                    product_thc = product.get('thc_percentage', 0)
                    if product_thc < min_thc:
                        continue
                
                filtered_products.append(product)
        
        return filtered_products[:20]  # Limit results
    
    def get_featured_products(self, count: int = 6) -> List[Dict[str, Any]]:
        """Get featured/recommended products"""
        
        products = self.get_products_by_category("all")
        
        # Sort by rating and review count for featured products
        featured = sorted(
            products,
            key=lambda p: (p.get('rating', 0) * p.get('review_count', 0)),
            reverse=True
        )
        
        return featured[:count]
    
    def get_inventory_stats(self) -> Dict[str, Any]:
        """Get inventory statistics for demo"""
        
        products = self.load_products()
        config = self.load_config()
        
        return {
            'total_products': products.get('total_products', 0),
            'categories': len(products.get('categories', {})),
            'brands': len(products.get('brands', [])),
            'in_stock_products': sum(
                len([p for p in cat_products if p.get('in_stock', True)])
                for cat_products in products.get('categories', {}).values()
            ),
            'price_range': products.get('price_range', {'min': 0, 'max': 0}),
            'dispensary': config.get('dispensary', {}).get('name', 'Premo Cannabis'),
            'last_updated': products.get('scraped_at', datetime.now().isoformat())
        }
    
    def _extract_price(self, price_text: str) -> Optional[float]:
        """Extract numeric price from price string"""
        
        if not price_text:
            return None
        
        import re
        price_match = re.search(r'(\d+(?:\.\d{2})?)', price_text.replace('$', '').replace(',', ''))
        
        if price_match:
            return float(price_match.group(1))
        
        return None
    
    def _get_fallback_products(self) -> Dict[str, Any]:
        """Fallback demo products if scraper data unavailable"""
        
        return {
            "dispensary": "Premo Cannabis",
            "total_products": 12,
            "categories": {
                "flower": [
                    {
                        "name": "Blue Dream - Premium Flower",
                        "category": "flower",
                        "brand": "Premo House",
                        "price": "$45.00",
                        "thc_percentage": 22.5,
                        "cbd_percentage": 0.8,
                        "description": "Classic sativa-dominant hybrid with sweet berry aroma and balanced effects",
                        "terpenes": [
                            {"name": "Myrcene", "percentage": 1.2},
                            {"name": "Limonene", "percentage": 0.8},
                            {"name": "Pinene", "percentage": 0.6}
                        ],
                        "in_stock": True,
                        "rating": 4.7,
                        "review_count": 89
                    },
                    {
                        "name": "Grandaddy Purple - Top Shelf",
                        "category": "flower",
                        "brand": "Northwest Cannabis",
                        "price": "$52.00",
                        "thc_percentage": 19.2,
                        "cbd_percentage": 0.3,
                        "description": "Legendary indica with deep purple hues and grape-like flavor",
                        "terpenes": [
                            {"name": "Myrcene", "percentage": 2.1},
                            {"name": "Linalool", "percentage": 0.9},
                            {"name": "Caryophyllene", "percentage": 0.7}
                        ],
                        "in_stock": True,
                        "rating": 4.8,
                        "review_count": 156
                    }
                ],
                "concentrates": [
                    {
                        "name": "Live Rosin - Zkittlez",
                        "category": "concentrates",
                        "brand": "Artisan Cannabis",
                        "price": "$65.00",
                        "thc_percentage": 78.5,
                        "cbd_percentage": 0.2,
                        "description": "Solventless live rosin with incredible flavor and potency",
                        "in_stock": True,
                        "rating": 4.9,
                        "review_count": 73
                    }
                ],
                "edibles": [
                    {
                        "name": "Sour Gummies - Mixed Berry",
                        "category": "edibles", 
                        "brand": "Emerald City Edibles",
                        "price": "$18.00",
                        "thc_percentage": 10.0,
                        "cbd_percentage": 0.0,
                        "description": "10mg THC per gummy, 10 pieces per package",
                        "in_stock": True,
                        "rating": 4.5,
                        "review_count": 201
                    }
                ]
            },
            "brands": ["Premo House", "Northwest Cannabis", "Artisan Cannabis", "Emerald City Edibles"],
            "price_range": {"min": 18.0, "max": 65.0}
        }
    
    def _get_fallback_config(self) -> Dict[str, Any]:
        """Fallback configuration"""
        
        return {
            "dispensary": {
                "name": "Premo Cannabis",
                "location": {"state": "Washington", "city": "Seattle"},
                "branding": {
                    "primaryColor": "#000000",
                    "accentColor": "#6262F5"
                }
            }
        }

# Initialize service
premo_service = PremoProductService()

# API Endpoints
@premo_router.get("/products")
async def get_premo_products(
    category: str = Query("all", description="Product category"),
    limit: int = Query(20, description="Maximum number of products")
):
    """Get Premo Cannabis products"""
    
    try:
        products = premo_service.get_products_by_category(category)
        return {
            "dispensary": "Premo Cannabis",
            "category": category,
            "count": len(products),
            "products": products[:limit]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@premo_router.get("/products/search")
async def search_premo_products(
    q: str = Query(..., description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    min_thc: Optional[float] = Query(None, description="Minimum THC percentage")
):
    """Search Premo Cannabis products"""
    
    try:
        products = premo_service.search_products(q, category, max_price, min_thc)
        return {
            "query": q,
            "filters": {
                "category": category,
                "max_price": max_price,
                "min_thc": min_thc
            },
            "count": len(products),
            "products": products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@premo_router.get("/products/featured")
async def get_featured_products(count: int = Query(6, description="Number of featured products")):
    """Get featured Premo Cannabis products"""
    
    try:
        products = premo_service.get_featured_products(count)
        return {
            "featured_products": products,
            "count": len(products)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@premo_router.get("/inventory/stats")
async def get_inventory_stats():
    """Get Premo Cannabis inventory statistics"""
    
    try:
        stats = premo_service.get_inventory_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@premo_router.get("/config")
async def get_premo_config():
    """Get Premo Cannabis demo configuration"""
    
    try:
        config = premo_service.load_config()
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced Sage Service Integration
class PremoSageService:
    """Premo-specific Sage AI responses"""
    
    def __init__(self):
        self.product_service = premo_service
        self.dispensary_name = "Premo Cannabis"
        self.location = "Seattle, Washington"
    
    def generate_premo_response(self, query: str, intent: str = "general") -> Dict[str, Any]:
        """Generate Premo-branded Sage response"""
        
        # Get relevant products based on query
        relevant_products = self._find_relevant_products(query, intent)
        
        # Generate personalized explanation
        explanation = self._generate_explanation(query, intent, relevant_products)
        
        # Add Premo-specific context
        explanation = self._add_premo_context(explanation)
        
        return {
            "explanation": explanation,
            "products": relevant_products[:3],  # Top 3 recommendations
            "dispensary": self.dispensary_name,
            "location": self.location,
            "intent": intent,
            "follow_up_questions": self._generate_follow_ups(intent),
            "compliance_note": "Please consume responsibly. Must be 21+ or valid medical patient."
        }
    
    def _find_relevant_products(self, query: str, intent: str) -> List[Dict[str, Any]]:
        """Find products relevant to user query"""
        
        # Search products
        products = self.product_service.search_products(query)
        
        # If no direct matches, get products by intent
        if not products and intent:
            if intent in ["sleep", "relaxation"]:
                products = self.product_service.get_products_by_category("flower")
                # Filter for indica-leaning products (simplified for demo)
                products = [p for p in products if "indica" in p.get('description', '').lower()]
            elif intent in ["energy", "focus", "creativity"]:
                products = self.product_service.get_products_by_category("flower") 
                products = [p for p in products if "sativa" in p.get('description', '').lower()]
            elif intent in ["pain", "inflammation"]:
                products = self.product_service.search_products("", min_thc=15.0)
        
        # Fallback to featured products
        if not products:
            products = self.product_service.get_featured_products(6)
        
        return products
    
    def _generate_explanation(self, query: str, intent: str, products: List[Dict]) -> str:
        """Generate explanation text"""
        
        if not products:
            return f"I'd love to help you find what you're looking for at {self.dispensary_name}. Could you tell me more about what effects or experience you're seeking?"
        
        product_names = [p['name'] for p in products[:3]]
        
        base_explanation = f"Based on your interest in '{query}', I'd recommend these products from our {self.dispensary_name} selection: {', '.join(product_names)}."
        
        # Add intent-specific context
        if intent == "sleep":
            base_explanation += " These strains are known for their relaxing, sedative effects that can help with sleep."
        elif intent == "anxiety":
            base_explanation += " These products offer calming effects that many customers find helpful for managing stress and anxiety."
        elif intent == "pain":
            base_explanation += " These options have strong therapeutic properties for pain management."
        
        return base_explanation
    
    def _add_premo_context(self, explanation: str) -> str:
        """Add Premo-specific branding and context"""
        
        premo_context = f" At {self.dispensary_name}, we pride ourselves on curating only the finest cannabis products from Washington's top producers. All our products are lab-tested for quality and potency."
        
        return explanation + premo_context
    
    def _generate_follow_ups(self, intent: str) -> List[str]:
        """Generate follow-up questions"""
        
        general_questions = [
            "Would you like to know about our current deals?",
            "Are you interested in a specific product category?",
            "Do you have experience with cannabis products?"
        ]
        
        intent_questions = {
            "sleep": [
                "What time do you usually go to bed?",
                "Do you prefer edibles or flower for sleep?",
                "Any sensitivity to strong sedative effects?"
            ],
            "pain": [
                "What type of pain are you managing?", 
                "Do you prefer topicals or ingestible products?",
                "Any experience with high-THC products?"
            ]
        }
        
        return intent_questions.get(intent, general_questions)

# Initialize Premo Sage service
premo_sage = PremoSageService()

@premo_router.post("/sage/ask")
async def ask_premo_sage(query_data: dict):
    """Ask Premo's AI budtender"""
    
    try:
        query = query_data.get('query', '')
        intent = query_data.get('intent', 'general')
        
        response = premo_sage.generate_premo_response(query, intent)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add the router to main app (this would be done in main.py)
# app.include_router(premo_router)