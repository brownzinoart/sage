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
        """Mock product search"""
        results = []
        query_lower = query.lower()
        
        for product in self.products:
            score = 0
            
            # Simple text matching
            if query_lower in product['name'].lower():
                score += 10
            if query_lower in product.get('description', '').lower():
                score += 5
            
            # Effect matching
            for effect in product.get('effects', []):
                if query_lower in effect.lower() or effect.lower() in query_lower:
                    score += 8
            
            # Category matching
            if query_lower in product.get('category', '').lower():
                score += 6
            
            # Add some randomness for variety
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