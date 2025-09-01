"""
Mock database for local development without PostgreSQL
"""
import json
import uuid
from typing import List, Dict, Any, Optional
from pathlib import Path
import os

class MockDatabase:
    """In-memory mock database for development"""
    
    def __init__(self):
        self.products = []
        self.conversations = {}
        self.load_sample_products()
    
    def load_sample_products(self):
        """Load sample products from JSON file - prioritize ZenLeaf Neptune products"""
        try:
            # Resolve data directory (env override > project default)
            data_dir_env = os.getenv("DATA_DIR")
            base_dir = Path(data_dir_env) if data_dir_env else Path(__file__).parent.parent.parent.parent / "data"

            # Try ZenLeaf Neptune products first
            zenleaf_data_file = base_dir / "zenleaf_neptune_products.json"
            if zenleaf_data_file.exists():
                with open(zenleaf_data_file, 'r') as f:
                    sample_products = json.load(f)
                print(f"✅ Loading ZenLeaf Neptune cannabis products")
            else:
                # Fallback to generic NJ products
                nj_data_file = base_dir / "nj_sample_products.json"
                if nj_data_file.exists():
                    with open(nj_data_file, 'r') as f:
                        sample_products = json.load(f)
                    print(f"✅ Loading NJ cannabis products")
                else:
                    # Final fallback to hemp products
                    data_file = base_dir / "sample_products.json"
                    with open(data_file, 'r') as f:
                        sample_products = json.load(f)
                    print(f"✅ Loading hemp products")
            
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
        
        # Enhanced intent-based matching for ZenLeaf Neptune cannabis products
        intent_mapping = {
            # Primary cannabis effects (ZenLeaf Neptune focus)
            'sleep': ['indica', 'myrcene', 'linalool', 'cbn', 'sedating', 'sleepy'],
            'insomnia': ['indica', 'myrcene', 'linalool', 'cbn', 'sedating', 'sleepy'],
            'relaxing': ['indica', 'hybrid', 'myrcene', 'linalool', 'relaxed'],
            'pain': ['indica', 'hybrid', 'caryophyllene', 'myrcene', 'pain-relief'],
            'chronic pain': ['indica', 'caryophyllene', 'myrcene', 'pain-relief', 'anti-inflammatory'],
            'energy': ['sativa', 'limonene', 'pinene', 'energizing', 'uplifting'],
            'energizing': ['sativa', 'limonene', 'pinene', 'energizing', 'uplifting'],
            'focus': ['sativa', 'hybrid', 'pinene', 'limonene', 'focused', 'creative'],
            'creativity': ['sativa', 'hybrid', 'terpinolene', 'limonene', 'creative'],
            'creative': ['sativa', 'hybrid', 'terpinolene', 'limonene', 'creative'],
            'anxiety': ['indica', 'hybrid', 'linalool', 'cbd', 'calming', 'stress-relief'],
            'stress': ['hybrid', 'linalool', 'limonene', 'stress-relief', 'calming'],
            'mood': ['sativa', 'hybrid', 'limonene', 'uplifting', 'happy', 'euphoric'],
            'depression': ['sativa', 'limonene', 'pinene', 'uplifting', 'mood-boost'],
            'social': ['hybrid', 'sativa', 'limonene', 'social', 'talkative', 'euphoric'],
            'party': ['sativa', 'hybrid', 'limonene', 'energizing', 'social'],
            # Product type preferences
            'beginner': ['hybrid', 'low-thc', 'balanced', 'gentle'],
            'new user': ['hybrid', 'low-thc', 'balanced', 'gentle'],
            'experienced': ['high-thc', 'potent', 'strong'],
            'strong': ['high-thc', 'potent', 'intense'],
            # Consumption preferences
            'discrete': ['vape', 'edible', 'tincture'],
            'quick': ['flower', 'vape', 'immediate'],
            'long lasting': ['edible', 'tincture', 'topical'],
            # Brand preferences (ZenLeaf Neptune)
            'premium': ['verano', 'reserve', 'craft', 'artisan'],
            'affordable': ['essence', 'value', 'budget'],
            # Time-based usage
            'daytime': ['sativa', 'hybrid', 'energizing', 'focused'],
            'nighttime': ['indica', 'sedating', 'relaxing', 'sleep'],
            'morning': ['sativa', 'energizing', 'uplifting', 'focused'],
            'evening': ['indica', 'hybrid', 'relaxing', 'calming']
        }
        
        for product in self.products:
            score = 0
            
            # Extract product characteristics
            product_name = product['name'].lower()
            product_brand = product.get('brand', '').lower()
            product_desc = product.get('description', '').lower()
            subcategory = product.get('subcategory', '').lower()
            strain_type = product.get('strain_type', '').lower()
            dominant_terpene = product.get('dominant_terpene', '').lower()
            product_type = product.get('product_type', '').lower()
            effects = [effect.lower() for effect in product.get('effects', [])]
            thc_percentage = product.get('thc_percentage', 0)
            
            # Direct name/brand/description matching (higher priority)
            if query_lower in product_name:
                score += 25  # Increased from 15
            if query_lower in product_brand:
                score += 15  # Brand matching
            if query_lower in product_desc:
                score += 10  # Increased from 8
            
            # Multi-intent matching (can match multiple intents)
            matched_intents = 0
            for intent, preferred_types in intent_mapping.items():
                if intent in query_lower:
                    matched_intents += 1
                    intent_score = 0
                    
                    # Strain type matching (primary indicator)
                    if strain_type in preferred_types:
                        intent_score += 35  # Increased from 30
                    
                    # Effect matching (direct effect correlation)
                    effect_matches = sum(1 for effect in effects if any(pref in effect for pref in preferred_types))
                    intent_score += effect_matches * 15
                    
                    # Terpene matching (scientific backing)
                    if dominant_terpene in preferred_types:
                        intent_score += 25  # Increased from 20
                    
                    # Product type matching
                    if product_type in preferred_types or subcategory in preferred_types:
                        intent_score += 20
                    
                    # THC potency matching for experience level
                    if 'beginner' in intent or 'new user' in intent:
                        if 15 <= thc_percentage <= 20:  # Ideal for beginners
                            intent_score += 15
                        elif thc_percentage > 25:  # Too strong for beginners
                            intent_score -= 10
                    elif 'experienced' in intent or 'strong' in intent:
                        if thc_percentage > 25:  # High potency
                            intent_score += 15
                        elif thc_percentage < 20:  # May be too weak
                            intent_score -= 5
                    
                    score += intent_score
            
            # Bonus for multiple intent matches (comprehensive products)
            if matched_intents > 1:
                score += matched_intents * 5
            
            # Strain name and terpene matching
            if strain_type in ['indica', 'sativa', 'hybrid']:
                # Cannabis strain matching
                strain_terms = ['indica', 'sativa', 'hybrid', 'flower', 'bud']
                for term in strain_terms:
                    if term in query_lower:
                        if term == strain_type:
                            score += 25
                        elif term in ['flower', 'bud'] and product.get('product_type') == 'flower':
                            score += 15
            else:
                # Hemp cannabinoid matching
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
            
            # Terpene matching for cannabis products
            terpenes = product.get('terpenes', {})
            terpene_terms = ['myrcene', 'limonene', 'pinene', 'linalool', 'caryophyllene', 'terpinolene']
            for terpene in terpene_terms:
                if terpene in query_lower and terpene in terpenes:
                    score += 8
            
            # Category matching
            if query_lower in product.get('category', '').lower():
                score += 5
            
            # Product type preferences
            product_type_mapping = {
                'edible': ['gummy', 'gummies', 'edible', 'chocolate', 'candy'],
                'vape': ['vape', 'cartridge', 'cart', 'pen'],
                'tincture': ['tincture', 'drops', 'oil', 'sublingual'],
                'flower': ['flower', 'bud', 'eighth', 'quarter', 'oz'],
                'pre-roll': ['pre-roll', 'joint', 'preroll'],
                'concentrate': ['concentrate', 'shatter', 'wax', 'rosin', 'resin', 'dab'],
                'topical': ['topical', 'cream', 'balm', 'salve', 'lotion']
            }
            
            for product_type, terms in product_type_mapping.items():
                if any(term in query_lower for term in terms):
                    if product.get('product_type') == product_type:
                        score += 12
            
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
