"""
Premo Cannabis NJ - Integration Script
Demonstrates THC product integration for recreational dispensary
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

sys.path.append(str(Path(__file__).parent.parent.parent))

# from backend.app.models.schemas import ProductInfo  # Optional import
from product_schema_thc import THCProduct, NJComplianceInfo, ProductSearchFilters

class PremoCannabisIntegration:
    """Integration handler for Premo Cannabis dispensary products"""
    
    def __init__(self):
        self.dispensary_info = {
            "name": "Premo Cannabis Company",
            "address": "2 E Front St, Keyport, NJ 07735",
            "license": "NJ-REC-2022-0145",
            "delivery_radius_miles": 10,
            "min_delivery_order": 75,
            "free_delivery_threshold": 120
        }
        
        self.compliance = NJComplianceInfo(
            license_number="NJ-REC-2022-0145",
            dispensary_license="NJ-DISP-KEY-001",
            dispensary_name="Premo Cannabis Company"
        )
        
        self.products: List[THCProduct] = []
        self.load_products()
    
    def load_products(self):
        """Load THC products from sample data"""
        product_file = Path(__file__).parent / "sample_products.json"
        with open(product_file, 'r') as f:
            raw_products = json.load(f)
        
        for product_data in raw_products:
            thc_product = THCProduct(**product_data)
            self.products.append(thc_product)
    
    def search_products(self, filters: ProductSearchFilters) -> List[THCProduct]:
        """Search products with THC-specific filters"""
        results = self.products.copy()
        
        if filters.category:
            results = [p for p in results if p.category == filters.category]
        
        if filters.strain_type:
            results = [p for p in results if p.strain_type == filters.strain_type]
        
        if filters.min_thc is not None:
            results = [p for p in results if 
                      (p.thc_percentage and p.thc_percentage >= filters.min_thc) or
                      (p.thc_mg and p.thc_mg >= filters.min_thc)]
        
        if filters.max_thc is not None:
            results = [p for p in results if 
                      (p.thc_percentage and p.thc_percentage <= filters.max_thc) or
                      (p.thc_mg and p.thc_mg <= filters.max_thc)]
        
        if filters.effects:
            results = [p for p in results if 
                      any(effect in p.effects for effect in filters.effects)]
        
        if filters.in_stock_only:
            results = [p for p in results if p.in_stock]
        
        return results
    
    def check_purchase_limits(self, cart_items: List[Dict[str, Any]], is_medical: bool = False) -> Dict[str, Any]:
        """Check if cart complies with NJ purchase limits"""
        total_flower_grams = 0
        total_concentrate_grams = 0
        total_edibles_thc_mg = 0
        
        for item in cart_items:
            product = next((p for p in self.products if p.external_id == item['product_id']), None)
            if not product:
                continue
            
            quantity = item.get('quantity', 1)
            
            if product.category == 'flower':
                total_flower_grams += (product.weight_grams or 0) * quantity
            elif product.category == 'concentrates':
                total_concentrate_grams += (product.weight_grams or 0) * quantity
            elif product.category == 'edibles':
                total_edibles_thc_mg += (product.thc_mg or 0) * quantity
        
        compliance_check = {
            "compliant": True,
            "messages": [],
            "limits": {
                "flower": {
                    "current": total_flower_grams,
                    "limit": self.compliance.daily_limit_flower_grams,
                    "compliant": total_flower_grams <= self.compliance.daily_limit_flower_grams
                },
                "concentrates": {
                    "current": total_concentrate_grams,
                    "limit": self.compliance.daily_limit_concentrate_grams,
                    "compliant": total_concentrate_grams <= self.compliance.daily_limit_concentrate_grams
                },
                "edibles": {
                    "current": total_edibles_thc_mg,
                    "limit": self.compliance.daily_limit_edibles_mg_thc,
                    "compliant": total_edibles_thc_mg <= self.compliance.daily_limit_edibles_mg_thc
                }
            },
            "is_medical": is_medical,
            "tax_rate": 0 if is_medical else self.compliance.tax_rate_recreational
        }
        
        for category, check in compliance_check["limits"].items():
            if not check["compliant"]:
                compliance_check["compliant"] = False
                compliance_check["messages"].append(
                    f"Exceeds {category} limit: {check['current']} / {check['limit']}"
                )
        
        return compliance_check
    
    def get_recommendations(self, intent: str, preferences: Dict[str, Any]) -> List[THCProduct]:
        """Get product recommendations based on user intent"""
        recommendations = []
        
        intent_mappings = {
            "pain_relief": {
                "effects": ["relaxed", "sleepy"],
                "strain_type": "indica",
                "min_thc": 18
            },
            "energy": {
                "effects": ["energetic", "uplifted", "focused"],
                "strain_type": "sativa",
                "min_thc": 15
            },
            "anxiety": {
                "effects": ["relaxed", "happy", "calm"],
                "strain_type": "hybrid",
                "max_thc": 20
            },
            "sleep": {
                "effects": ["sleepy", "relaxed"],
                "strain_type": "indica",
                "min_thc": 20
            },
            "creativity": {
                "effects": ["creative", "uplifted", "focused"],
                "strain_type": "sativa"
            }
        }
        
        if intent in intent_mappings:
            filters = ProductSearchFilters(**intent_mappings[intent])
            recommendations = self.search_products(filters)[:5]
        
        return recommendations
    
    def format_for_sage(self, product: THCProduct) -> Dict[str, Any]:
        """Convert THC product to Sage platform format"""
        return {
            "id": str(product.id),
            "external_id": product.external_id,
            "name": product.name,
            "brand": product.brand,
            "description": product.description,
            "category": product.category,
            "strain_type": product.strain_type,
            "thc_content": product.thc_percentage or product.thc_mg,
            "thc_unit": "%" if product.thc_percentage else "mg",
            "price": product.price_unit or product.price_eighth,
            "effects": product.effects,
            "terpenes": product.terpenes,
            "lab_tested": product.lab_tested,
            "in_stock": product.in_stock,
            "compliance": {
                "state": product.state,
                "age_restriction": product.age_restriction,
                "recreational": product.recreational,
                "medical": product.medical
            }
        }

def demo_integration():
    """Demo the Premo Cannabis integration"""
    integration = PremoCannabisIntegration()
    
    print(f"Loaded {len(integration.products)} THC products from Premo Cannabis")
    print("\n=== Sample Product Categories ===")
    
    categories = set(p.category for p in integration.products)
    for category in categories:
        count = len([p for p in integration.products if p.category == category])
        print(f"- {category.capitalize()}: {count} products")
    
    print("\n=== Testing Product Search ===")
    filters = ProductSearchFilters(
        strain_type="indica",
        min_thc=20,
        effects=["relaxed"]
    )
    results = integration.search_products(filters)
    print(f"Found {len(results)} indica products with THC > 20% and relaxing effects")
    
    if results:
        print(f"Example: {results[0].name} - THC: {results[0].thc_percentage}%")
    
    print("\n=== Testing Compliance Check ===")
    test_cart = [
        {"product_id": "premo_flower_001", "quantity": 4},  # 14g flower
        {"product_id": "premo_edible_001", "quantity": 2}   # 200mg THC
    ]
    
    compliance = integration.check_purchase_limits(test_cart)
    print(f"Cart compliance: {'✓' if compliance['compliant'] else '✗'}")
    print(f"Flower: {compliance['limits']['flower']['current']}g / {compliance['limits']['flower']['limit']}g")
    print(f"Edibles: {compliance['limits']['edibles']['current']}mg / {compliance['limits']['edibles']['limit']}mg")
    
    print("\n=== Testing Recommendations ===")
    recommendations = integration.get_recommendations("sleep", {})
    print(f"Sleep recommendations: {len(recommendations)} products")
    for rec in recommendations[:3]:
        print(f"- {rec.name} ({rec.strain_type}) - {rec.thc_percentage}% THC")

if __name__ == "__main__":
    demo_integration()