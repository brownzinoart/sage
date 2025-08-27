"""
Mock database for local development without PostgreSQL
"""
import json
import uuid
from typing import List, Dict, Any, Optional
from pathlib import Path

class MockDatabase:
    """In-memory mock database for development"""
    
    def __init__(self):
        self.products = []
        self.conversations = {}
        self.load_sample_products()
    
    def load_sample_products(self):
        """Load sample products from JSON file"""
        try:
            data_file = Path(__file__).parent.parent.parent.parent / "data" / "sample_products.json"
            with open(data_file, 'r') as f:
                sample_products = json.load(f)
            
            # Convert to internal format with UUIDs
            for product in sample_products:
                product['id'] = str(uuid.uuid4())
                # Mock embedding (384 dimensions of zeros)
                product['embedding'] = [0.0] * 384
                self.products.append(product)
                
            print(f"✅ Loaded {len(self.products)} sample products")
        except Exception as e:
            print(f"⚠️  Could not load sample products: {e}")
    
    async def search_products(self, query: str, filters: Optional[Dict] = None, limit: int = 5) -> List[Dict]:
        """Smart product search with cannabinoid matching"""
        results = []
        query_lower = query.lower()
        
        # Intent-based cannabinoid matching
        intent_mapping = {
            'high': ['delta-8', 'delta-9', 'hhc', 'thca', 'thcp'],
            'legal high': ['delta-8', 'hhc', 'delta-10', 'thca'],
            'euphoria': ['delta-8', 'hhc', 'delta-9', 'thcp'],
            'buzz': ['delta-8', 'hhc', 'delta-10'],
            'party': ['delta-8', 'hhc', 'delta-10', 'blend'],
            'social': ['delta-8', 'hhc', 'blend'],
            'creative': ['delta-10', 'thcv', 'cbg'],
            'focus': ['thcv', 'cbg', 'delta-10'],
            'energy': ['thcv', 'cbg', 'delta-10'],
            'sleep': ['cbn', 'delta-8', 'thc'],
            'pain': ['thc', 'cbd', 'cbc', 'ratio'],
            'anxiety': ['cbd', 'delta-8'],
            'microdose': ['delta-9'],
            'appetite': ['thcv'],
            'weight': ['thcv']
        }
        
        for product in self.products:
            score = 0
            
            # Direct name/description matching
            if query_lower in product['name'].lower():
                score += 15
            if query_lower in product.get('description', '').lower():
                score += 8
            
            # Intent-based subcategory matching
            subcategory = product.get('subcategory', '').lower()
            for intent, preferred_types in intent_mapping.items():
                if intent in query_lower:
                    if subcategory in preferred_types:
                        score += 25  # High priority for intent matches
                    break
            
            # Direct cannabinoid matching
            cannabinoid_terms = ['cbd', 'thc', 'delta-8', 'delta-9', 'delta-10', 'hhc', 'thcp', 'thcv', 'cbg', 'cbn', 'cbc', 'thca']
            for term in cannabinoid_terms:
                if term in query_lower and term in subcategory:
                    score += 20
            
            # Effect matching
            for effect in product.get('effects', []):
                effect_words = effect.replace('-', ' ').split()
                for word in effect_words:
                    if word in query_lower:
                        score += 10
            
            # Category matching
            if query_lower in product.get('category', '').lower():
                score += 5
            
            # Product type preferences
            if any(term in query_lower for term in ['gummy', 'gummies', 'edible']) and product.get('product_type') == 'edible':
                score += 8
            if any(term in query_lower for term in ['vape', 'cartridge', 'cart']) and product.get('product_type') == 'vape':
                score += 8
            if any(term in query_lower for term in ['tincture', 'drops', 'oil']) and product.get('product_type') == 'tincture':
                score += 8
            
            if score > 0:
                product_copy = product.copy()
                product_copy['match_score'] = score
                results.append(product_copy)
        
        # Sort by score and return top results
        results.sort(key=lambda x: x['match_score'], reverse=True)
        return results[:limit]
    
    async def get_product_by_id(self, product_id: str) -> Optional[Dict]:
        """Get product by ID"""
        for product in self.products:
            if product['id'] == product_id:
                return product
        return None
    
    async def create_conversation(self, session_id: str, privacy_level: int = 1) -> Dict:
        """Create or get conversation"""
        if session_id not in self.conversations:
            self.conversations[session_id] = {
                'session_id': session_id,
                'messages': [],
                'context': {},
                'privacy_level': privacy_level,
                'created_at': 'now'
            }
        return self.conversations[session_id]
    
    async def add_message(self, session_id: str, user_message: str, bot_response: str, intent: str = None):
        """Add message to conversation"""
        if session_id not in self.conversations:
            await self.create_conversation(session_id)
        
        self.conversations[session_id]['messages'].extend([
            {'role': 'user', 'content': user_message, 'timestamp': 'now'},
            {'role': 'assistant', 'content': bot_response, 'timestamp': 'now'}
        ])
        
        if intent:
            self.conversations[session_id]['context']['last_intent'] = intent

# Global mock database instance
mock_db = MockDatabase()