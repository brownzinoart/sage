# Model Context Protocol (MCP) - BudGuide Digital Budtender

## Overview

This MCP configuration enables AI assistants to interact with the BudGuide hemp product discovery system through standardized protocols. The configuration provides access to product data, conversation management, and recommendation engines while maintaining privacy and compliance requirements.

## Server Configuration

```json
{
  "mcpServers": {
    "budguide": {
      "command": "python",
      "args": ["-m", "budguide_mcp.server"],
      "env": {
        "BUDGUIDE_API_URL": "http://localhost:8000",
        "BUDGUIDE_API_KEY": "${BUDGUIDE_API_KEY}",
        "DATABASE_URL": "${DATABASE_URL}",
        "VECTOR_DB_URL": "${VECTOR_DB_URL}"
      }
    }
  }
}
```

## MCP Server Implementation

```python
# budguide_mcp/server.py
import asyncio
import json
from typing import Any, Dict, List, Optional
from mcp.server import Server, Request, Response
from mcp.server.models import InitializationOptions
from mcp.types import Tool, Resource, Prompt, CompletionResult

class BudGuideMCPServer:
    """MCP Server for BudGuide Digital Budtender"""
    
    def __init__(self):
        self.server = Server("budguide")
        self.setup_handlers()
        
    def setup_handlers(self):
        """Register all MCP handlers"""
        
        @self.server.list_tools()
        async def handle_list_tools() -> List[Tool]:
            return [
                Tool(
                    name="search_products",
                    description="Search hemp/CBD products using natural language",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Natural language search query"
                            },
                            "filters": {
                                "type": "object",
                                "properties": {
                                    "cannabinoid": {"type": "string"},
                                    "effect": {"type": "string"},
                                    "product_type": {"type": "string"},
                                    "max_price": {"type": "number"}
                                }
                            },
                            "limit": {
                                "type": "integer",
                                "default": 5
                            }
                        },
                        "required": ["query"]
                    }
                ),
                Tool(
                    name="get_product_details",
                    description="Get detailed information about a specific product",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "product_id": {
                                "type": "string",
                                "description": "Product UUID"
                            }
                        },
                        "required": ["product_id"]
                    }
                ),
                Tool(
                    name="analyze_user_needs",
                    description="Analyze user requirements and map to product attributes",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "user_input": {
                                "type": "string",
                                "description": "User's description of needs"
                            },
                            "context": {
                                "type": "object",
                                "properties": {
                                    "time_of_day": {"type": "string"},
                                    "experience_level": {"type": "string"},
                                    "medical_conditions": {"type": "array"}
                                }
                            }
                        },
                        "required": ["user_input"]
                    }
                ),
                Tool(
                    name="check_compliance",
                    description="Check product compliance and legal status",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "product_id": {"type": "string"},
                            "user_location": {"type": "string"},
                            "user_age": {"type": "integer"}
                        },
                        "required": ["product_id"]
                    }
                ),
                Tool(
                    name="get_education_content",
                    description="Retrieve educational content about cannabinoids and effects",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "topic": {
                                "type": "string",
                                "enum": ["CBD", "CBG", "CBN", "CBC", "THCA", "terpenes", "dosage", "safety"]
                            },
                            "user_level": {
                                "type": "string",
                                "enum": ["beginner", "intermediate", "advanced"],
                                "default": "beginner"
                            }
                        },
                        "required": ["topic"]
                    }
                ),
                Tool(
                    name="track_conversation",
                    description="Track conversation state and preferences",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "session_id": {"type": "string"},
                            "message": {"type": "string"},
                            "intent": {"type": "string"},
                            "preferences": {"type": "object"},
                            "privacy_level": {
                                "type": "integer",
                                "minimum": 1,
                                "maximum": 4
                            }
                        },
                        "required": ["session_id", "message"]
                    }
                )
            ]
        
        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: Dict) -> Any:
            """Handle tool execution"""
            
            if name == "search_products":
                return await self.search_products(**arguments)
            elif name == "get_product_details":
                return await self.get_product_details(**arguments)
            elif name == "analyze_user_needs":
                return await self.analyze_user_needs(**arguments)
            elif name == "check_compliance":
                return await self.check_compliance(**arguments)
            elif name == "get_education_content":
                return await self.get_education_content(**arguments)
            elif name == "track_conversation":
                return await self.track_conversation(**arguments)
            else:
                raise ValueError(f"Unknown tool: {name}")
        
        @self.server.list_resources()
        async def handle_list_resources() -> List[Resource]:
            return [
                Resource(
                    uri="budguide://products/catalog",
                    name="Product Catalog",
                    description="Complete hemp product catalog with effects and cannabinoid profiles",
                    mimeType="application/json"
                ),
                Resource(
                    uri="budguide://knowledge/cannabinoids",
                    name="Cannabinoid Knowledge Base",
                    description="Scientific information about cannabinoids and their effects",
                    mimeType="application/json"
                ),
                Resource(
                    uri="budguide://compliance/nc-regulations",
                    name="North Carolina Hemp Regulations",
                    description="Current NC hemp/CBD legal requirements and restrictions",
                    mimeType="application/json"
                ),
                Resource(
                    uri="budguide://analytics/metrics",
                    name="Analytics Dashboard",
                    description="Real-time metrics and conversion data",
                    mimeType="application/json"
                )
            ]
        
        @self.server.read_resource()
        async def handle_read_resource(uri: str) -> str:
            """Read resource content"""
            
            if uri == "budguide://products/catalog":
                return await self.get_product_catalog()
            elif uri == "budguide://knowledge/cannabinoids":
                return await self.get_cannabinoid_knowledge()
            elif uri == "budguide://compliance/nc-regulations":
                return await self.get_nc_regulations()
            elif uri == "budguide://analytics/metrics":
                return await self.get_analytics_metrics()
            else:
                raise ValueError(f"Unknown resource: {uri}")
        
        @self.server.list_prompts()
        async def handle_list_prompts() -> List[Prompt]:
            return [
                Prompt(
                    name="hemp_consultation",
                    description="Conduct a hemp product consultation",
                    arguments=[
                        {
                            "name": "user_needs",
                            "description": "What the user is looking for",
                            "required": True
                        },
                        {
                            "name": "experience_level",
                            "description": "User's experience with hemp products",
                            "required": False
                        }
                    ]
                ),
                Prompt(
                    name="product_comparison",
                    description="Compare multiple hemp products",
                    arguments=[
                        {
                            "name": "product_ids",
                            "description": "List of product IDs to compare",
                            "required": True
                        }
                    ]
                ),
                Prompt(
                    name="dosage_guidance",
                    description="Provide dosage recommendations",
                    arguments=[
                        {
                            "name": "product_type",
                            "description": "Type of product (tincture, edible, etc)",
                            "required": True
                        },
                        {
                            "name": "user_experience",
                            "description": "User's experience level",
                            "required": True
                        }
                    ]
                )
            ]
    
    # Tool implementations
    async def search_products(self, query: str, filters: Optional[Dict] = None, 
                             limit: int = 5) -> Dict:
        """Search products using NLP and vector similarity"""
        
        from budguide_mcp.services import ProductSearchService
        
        search_service = ProductSearchService()
        
        # Process query with NLP
        processed_query = await search_service.process_query(query)
        
        # Apply filters
        if filters:
            processed_query['filters'] = filters
        
        # Execute search
        results = await search_service.vector_search(
            embedding=processed_query['embedding'],
            requirements=processed_query['requirements'],
            limit=limit
        )
        
        return {
            "query": query,
            "intent": processed_query['intent'],
            "products": results,
            "total_found": len(results),
            "suggestions": self.generate_suggestions(processed_query['intent'])
        }
    
    async def get_product_details(self, product_id: str) -> Dict:
        """Get comprehensive product information"""
        
        from budguide_mcp.services import ProductService
        
        product_service = ProductService()
        product = await product_service.get_by_id(product_id)
        
        if not product:
            return {"error": "Product not found"}
        
        return {
            "id": product['id'],
            "name": product['name'],
            "brand": product['brand'],
            "description": product['description'],
            "cannabinoids": {
                "cbd_mg": product.get('cbd_mg'),
                "thc_mg": product.get('thc_mg'),
                "cbg_mg": product.get('cbg_mg'),
                "cbn_mg": product.get('cbn_mg'),
                "cbc_mg": product.get('cbc_mg'),
                "thca_percentage": product.get('thca_percentage')
            },
            "effects": product.get('effects', []),
            "terpenes": product.get('terpenes', {}),
            "lab_results": {
                "tested": product.get('lab_tested', False),
                "report_url": product.get('lab_report_url')
            },
            "price": product['price'],
            "availability": product.get('in_stock', True),
            "recommendations": {
                "time_of_day": self.recommend_time_of_day(product),
                "experience_level": self.recommend_experience_level(product),
                "similar_products": await product_service.find_similar(product_id, limit=3)
            }
        }
    
    async def analyze_user_needs(self, user_input: str, 
                                context: Optional[Dict] = None) -> Dict:
        """Analyze user requirements and map to products"""
        
        from budguide_mcp.nlp import NeedsAnalyzer
        
        analyzer = NeedsAnalyzer()
        analysis = await analyzer.analyze(user_input, context)
        
        return {
            "interpreted_needs": {
                "conditions": analysis['conditions'],
                "desired_effects": analysis['effects'],
                "constraints": analysis['constraints']
            },
            "product_requirements": {
                "must_have": analysis['must_have'],
                "should_have": analysis['should_have'],
                "must_not_have": analysis['must_not_have']
            },
            "recommended_cannabinoids": analysis['cannabinoids'],
            "dosage_suggestions": {
                "beginner": analysis['dosage_beginner'],
                "regular": analysis['dosage_regular']
            },
            "safety_considerations": analysis['safety_notes'],
            "education_topics": analysis['education_suggestions']
        }
    
    async def check_compliance(self, product_id: str, 
                              user_location: str = "NC",
                              user_age: Optional[int] = None) -> Dict:
        """Check legal compliance for product"""
        
        from budguide_mcp.compliance import ComplianceChecker
        
        checker = ComplianceChecker()
        product = await self.get_product_details(product_id)
        
        compliance_result = await checker.check(
            product=product,
            location=user_location,
            user_age=user_age
        )
        
        return {
            "product_id": product_id,
            "location": user_location,
            "is_compliant": compliance_result['compliant'],
            "restrictions": compliance_result['restrictions'],
            "age_verification_required": compliance_result['age_verification'],
            "warnings": compliance_result['warnings'],
            "regulations": {
                "thc_limit": "0.3%",
                "age_requirement": "21+ for Delta-8/THCA",
                "testing_required": True,
                "child_resistant_packaging": True
            }
        }
    
    async def get_education_content(self, topic: str, 
                                   user_level: str = "beginner") -> Dict:
        """Get educational content about cannabinoids"""
        
        from budguide_mcp.education import EducationService
        
        education_service = EducationService()
        content = await education_service.get_content(topic, user_level)
        
        return {
            "topic": topic,
            "level": user_level,
            "content": content['main_content'],
            "key_points": content['key_points'],
            "faqs": content['faqs'],
            "related_topics": content['related_topics'],
            "scientific_references": content.get('references', []),
            "practical_tips": content.get('tips', [])
        }
    
    async def track_conversation(self, session_id: str, message: str,
                                intent: Optional[str] = None,
                                preferences: Optional[Dict] = None,
                                privacy_level: int = 1) -> Dict:
        """Track conversation for context and analytics"""
        
        from budguide_mcp.conversation import ConversationTracker
        
        tracker = ConversationTracker()
        
        # Store message with privacy considerations
        result = await tracker.add_message(
            session_id=session_id,
            message=message,
            intent=intent,
            privacy_level=privacy_level
        )
        
        # Update learned preferences if provided
        if preferences and privacy_level >= 2:
            await tracker.update_preferences(session_id, preferences)
        
        # Get conversation summary
        summary = await tracker.get_summary(session_id)
        
        return {
            "session_id": session_id,
            "message_stored": result['stored'],
            "conversation_length": summary['message_count'],
            "identified_intents": summary['intents'],
            "learned_preferences": summary['preferences'] if privacy_level >= 2 else {},
            "product_interests": summary['product_interests'],
            "next_suggestions": self.generate_next_suggestions(summary)
        }
    
    # Helper methods
    def generate_suggestions(self, intent: str) -> List[str]:
        """Generate contextual suggestions based on intent"""
        
        suggestions_map = {
            "search_effect": [
                "Tell me more about the effects",
                "Do you have anything stronger?",
                "What about for daytime use?"
            ],
            "search_condition": [
                "How long before I feel effects?",
                "What's the recommended dosage?",
                "Are there any side effects?"
            ],
            "education": [
                "How is this different from marijuana?",
                "Will this show up on a drug test?",
                "Is this legal in North Carolina?"
            ],
            "browse": [
                "Show me your best sellers",
                "What's good for beginners?",
                "Products under $50"
            ]
        }
        
        return suggestions_map.get(intent, [
            "Tell me more",
            "Show me products",
            "I have a question"
        ])
    
    def recommend_time_of_day(self, product: Dict) -> str:
        """Recommend optimal time of day for product use"""
        
        effects = product.get('effects', [])
        
        if any(e in effects for e in ['sedating', 'relaxing', 'sleep']):
            return "evening/nighttime"
        elif any(e in effects for e in ['energizing', 'focus', 'uplifting']):
            return "morning/daytime"
        else:
            return "anytime"
    
    def recommend_experience_level(self, product: Dict) -> str:
        """Recommend appropriate experience level"""
        
        # Check potency
        cbd_mg = product.get('cbd_mg', 0)
        thc_mg = product.get('thc_mg', 0)
        
        if cbd_mg < 10 and thc_mg < 0.3:
            return "beginner-friendly"
        elif cbd_mg < 30:
            return "intermediate"
        else:
            return "experienced users"
    
    def generate_next_suggestions(self, summary: Dict) -> List[str]:
        """Generate next action suggestions based on conversation"""
        
        if summary['message_count'] < 2:
            return ["Tell me about your needs", "Browse products", "Learn about CBD"]
        elif summary['product_interests']:
            return ["Compare products", "Check availability", "Read reviews"]
        else:
            return ["Refine your search", "Try different effects", "Ask about dosage"]

# budguide_mcp/services.py
import numpy as np
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
import asyncpg

class ProductSearchService:
    """Service for product search operations"""
    
    def __init__(self):
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self.db_pool = None
    
    async def connect(self):
        """Initialize database connection pool"""
        self.db_pool = await asyncpg.create_pool(
            host='localhost',
            database='budguide',
            user='budguide',
            password='password'
        )
    
    async def process_query(self, query: str) -> Dict:
        """Process natural language query"""
        
        # Generate embedding
        embedding = self.encoder.encode(query)
        
        # Extract intent and entities
        intent = self.classify_intent(query)
        entities = self.extract_entities(query)
        requirements = self.map_requirements(intent, entities)
        
        return {
            'query': query,
            'embedding': embedding.tolist(),
            'intent': intent,
            'entities': entities,
            'requirements': requirements
        }
    
    async def vector_search(self, embedding: List[float], 
                           requirements: Dict, limit: int = 5) -> List[Dict]:
        """Execute vector similarity search"""
        
        async with self.db_pool.acquire() as conn:
            # Vector search with filtering
            query = """
                SELECT 
                    id, name, brand, description,
                    cbd_mg, thc_mg, cbg_mg, cbn_mg,
                    effects, price, product_type,
                    1 - (embedding <=> $1::vector) as similarity
                FROM products
                WHERE 1=1
                    AND ($2::text IS NULL OR effects @> $2::jsonb)
                    AND ($3::numeric IS NULL OR price <= $3)
                ORDER BY similarity DESC
                LIMIT $4
            """
            
            # Apply requirement filters
            effects_filter = None
            if requirements.get('must_have'):
                effects_filter = json.dumps(requirements['must_have'])
            
            price_filter = requirements.get('max_price')
            
            rows = await conn.fetch(
                query, 
                embedding, 
                effects_filter,
                price_filter,
                limit
            )
            
            return [dict(row) for row in rows]
    
    def classify_intent(self, query: str) -> str:
        """Classify query intent"""
        
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['help', 'need', 'looking for']):
            return 'search_effect'
        elif any(word in query_lower for word in ['what is', 'explain', 'how does']):
            return 'education'
        elif any(word in query_lower for word in ['safe', 'legal', 'test']):
            return 'safety'
        else:
            return 'browse'
    
    def extract_entities(self, query: str) -> Dict:
        """Extract entities from query"""
        
        entities = {
            'conditions': [],
            'effects': [],
            'cannabinoids': [],
            'time_of_day': []
        }
        
        # Simple keyword extraction (would use spaCy in production)
        conditions = ['pain', 'anxiety', 'sleep', 'stress', 'inflammation']
        for condition in conditions:
            if condition in query.lower():
                entities['conditions'].append(condition)
        
        cannabinoids = ['cbd', 'cbg', 'cbn', 'cbc', 'thc']
        for cannabinoid in cannabinoids:
            if cannabinoid in query.lower():
                entities['cannabinoids'].append(cannabinoid.upper())
        
        if any(word in query.lower() for word in ['morning', 'day']):
            entities['time_of_day'].append('day')
        if any(word in query.lower() for word in ['night', 'evening', 'sleep']):
            entities['time_of_day'].append('night')
        
        return entities
    
    def map_requirements(self, intent: str, entities: Dict) -> Dict:
        """Map entities to product requirements"""
        
        requirements = {
            'must_have': [],
            'should_have': [],
            'must_not_have': []
        }
        
        # Map conditions to effects
        condition_effects = {
            'pain': ['anti-inflammatory', 'analgesic'],
            'anxiety': ['calming', 'anxiolytic'],
            'sleep': ['sedating', 'relaxing'],
            'stress': ['calming', 'stress-relief']
        }
        
        for condition in entities.get('conditions', []):
            if condition in condition_effects:
                requirements['should_have'].extend(condition_effects[condition])
        
        # Time-based requirements
        if 'day' in entities.get('time_of_day', []):
            requirements['must_not_have'].append('sedating')
        elif 'night' in entities.get('time_of_day', []):
            requirements['should_have'].append('sedating')
        
        return requirements

# budguide_mcp/compliance.py
class ComplianceChecker:
    """Check product compliance with regulations"""
    
    async def check(self, product: Dict, location: str, 
                   user_age: Optional[int] = None) -> Dict:
        """Check if product is compliant"""
        
        result = {
            'compliant': True,
            'restrictions': [],
            'age_verification': False,
            'warnings': []
        }
        
        # NC specific checks
        if location == "NC":
            # THC limit check
            thc_mg = product.get('cannabinoids', {}).get('thc_mg', 0)
            if thc_mg > 0.3:
                result['compliant'] = False
                result['restrictions'].append("THC exceeds 0.3% limit")
            
            # Delta-8/THCA age check
            if product.get('cannabinoids', {}).get('thca_percentage', 0) > 0:
                result['age_verification'] = True
                if user_age and user_age < 21:
                    result['compliant'] = False
                    result['restrictions'].append("Must be 21+ for THCA products")
            
            # Lab testing requirement
            if not product.get('lab_results', {}).get('tested'):
                result['warnings'].append("Product should have third-party lab testing")
        
        return result

# budguide_mcp/conversation.py
import json
from datetime import datetime
from typing import Dict, List, Optional

class ConversationTracker:
    """Track and manage conversations"""
    
    def __init__(self):
        self.conversations = {}  # In-memory storage for demo
    
    async def add_message(self, session_id: str, message: str,
                         intent: Optional[str] = None,
                         privacy_level: int = 1) -> Dict:
        """Add message to conversation"""
        
        if session_id not in self.conversations:
            self.conversations[session_id] = {
                'messages': [],
                'intents': [],
                'preferences': {},
                'product_interests': [],
                'started_at': datetime.utcnow().isoformat()
            }
        
        # Store based on privacy level
        stored_message = {
            'timestamp': datetime.utcnow().isoformat(),
            'intent': intent
        }
        
        if privacy_level >= 2:
            stored_message['content'] = message
        
        self.conversations[session_id]['messages'].append(stored_message)
        
        if intent:
            self.conversations[session_id]['intents'].append(intent)
        
        return {'stored': True}
    
    async def update_preferences(self, session_id: str, 
                                preferences: Dict) -> None:
        """Update learned preferences"""
        
        if session_id in self.conversations:
            self.conversations[session_id]['preferences'].update(preferences)
    
    async def get_summary(self, session_id: str) -> Dict:
        """Get conversation summary"""
        
        if session_id not in self.conversations:
            return {
                'message_count': 0,
                'intents': [],
                'preferences': {},
                'product_interests': []
            }
        
        conv = self.conversations[session_id]
        
        return {
            'message_count': len(conv['messages']),
            'intents': list(set(conv['intents'])),
            'preferences': conv['preferences'],
            'product_interests': conv['product_interests']
        }

# budguide_mcp/education.py
class EducationService:
    """Provide educational content"""
    
    def __init__(self):
        self.content_db = self.load_content()
    
    def load_content(self) -> Dict:
        """Load educational content database"""
        
        return {
            'CBD': {
                'beginner': {
                    'main_content': """CBD (Cannabidiol) is a natural compound found in hemp plants. 
                    Unlike THC, CBD doesn't cause a 'high' and is non-intoxicating. It's legal in 
                    North Carolina when derived from hemp with less than 0.3% THC.""",
                    'key_points': [
                        "Non-intoxicating - won't make you high",
                        "Legal in NC from hemp sources",
                        "May help with anxiety, pain, and sleep",
                        "Available in oils, gummies, topicals"
                    ],
                    'faqs': [
                        {
                            'q': "Will CBD show up on a drug test?",
                            'a': "Pure CBD shouldn't, but full-spectrum products with trace THC might."
                        },
                        {
                            'q': "How long does it take to work?",
                            'a': "Effects typically felt within 30-60 minutes for oils, 60-90 for edibles."
                        }
                    ],
                    'related_topics': ['dosage', 'full-spectrum vs isolate', 'drug interactions']
                },
                'intermediate': {
                    'main_content': """CBD interacts with your body's endocannabinoid system (ECS), 
                    which regulates various functions including mood, pain, and sleep. CBD doesn't 
                    bind directly to cannabinoid receptors but influences them indirectly.""",
                    'key_points': [
                        "Works through the endocannabinoid system",
                        "May inhibit enzyme that breaks down anandamide",
                        "Interacts with serotonin and vanilloid receptors",
                        "Bioavailability varies by consumption method"
                    ],
                    'faqs': [],
                    'related_topics': ['ECS function', 'bioavailability', 'entourage effect']
                }
            },
            'CBG': {
                'beginner': {
                    'main_content': """CBG (Cannabigerol) is called the 'mother cannabinoid' because 
                    other cannabinoids develop from it. Unlike CBD which can be calming, CBG may 
                    provide focus and energy without intoxication.""",
                    'key_points': [
                        "Non-intoxicating like CBD",
                        "May increase focus and alertness",
                        "Potential antibacterial properties",
                        "Often used for daytime"
                    ],
                    'faqs': [],
                    'related_topics': ['CBD vs CBG', 'morning routine', 'focus enhancement']
                }
            },
            'dosage': {
                'beginner': {
                    'main_content': """Start low and go slow. Begin with 5-10mg of CBD and increase 
                    gradually every few days until you find your optimal dose. Everyone's body is 
                    different, so what works for others may not work for you.""",
                    'key_points': [
                        "Start with 5-10mg for beginners",
                        "Wait 2 hours before taking more",
                        "Keep a journal of effects",
                        "Consistency is key - take daily for best results"
                    ],
                    'tips': [
                        "Take with food for better absorption",
                        "Set a regular schedule",
                        "Track your response in a journal"
                    ],
                    'faqs': [],
                    'related_topics': ['bioavailability', 'timing', 'tolerance']
                }
            }
        }
    
    async def get_content(self, topic: str, level: str) -> Dict:
        """Get educational content for topic and level"""
        
        if topic in self.content_db:
            if level in self.content_db[topic]:
                return self.content_db[topic][level]
            else:
                # Default to beginner if level not found
                return self.content_db[topic].get('beginner', {})
        
        return {
            'main_content': f"Information about {topic} coming soon.",
            'key_points': [],
            'faqs': [],
            'related_topics': []
        }
```

## MCP Client Configuration

```json
{
  "name": "BudGuide Digital Budtender",
  "version": "1.0.0",
  "description": "MCP interface for hemp/CBD product discovery and education",
  "capabilities": {
    "tools": true,
    "resources": true,
    "prompts": true,
    "sampling": true
  },
  "configuration": {
    "privacy_levels": {
      "1": "Anonymous - No data storage",
      "2": "Session - Temporary memory",
      "3": "Local - Browser storage only",
      "4": "Account - Full personalization"
    },
    "compliance": {
      "location": "NC",
      "age_verification_required": true,
      "thc_limit": 0.003
    },
    "search": {
      "max_results": 20,
      "embedding_model": "all-MiniLM-L6-v2",
      "vector_dimensions": 384
    }
  }
}
```

## Usage Examples

### Example 1: Product Discovery Flow

```python
# Client usage example
async def product_discovery_flow():
    """Example flow for product discovery"""
    
    # Analyze user needs
    needs = await mcp_client.call_tool(
        "analyze_user_needs",
        {
            "user_input": "I have trouble sleeping and wake up groggy",
            "context": {
                "time_of_day": "night",
                "experience_level": "beginner"
            }
        }
    )
    
    # Search for matching products
    products = await mcp_client.call_tool(
        "search_products",
        {
            "query": "sleep aid no grogginess",
            "filters": {
                "cannabinoid": "CBN",
                "max_price": 60
            },
            "limit": 5
        }
    )
    
    # Check compliance for top product
    if products['products']:
        compliance = await mcp_client.call_tool(
            "check_compliance",
            {
                "product_id": products['products'][0]['id'],
                "user_location": "NC",
                "user_age": 25
            }
        )
    
    # Get educational content
    education = await mcp_client.call_tool(
        "get_education_content",
        {
            "topic": "CBN",
            "user_level": "beginner"
        }
    )
    
    return {
        "needs_analysis": needs,
        "product_matches": products,
        "compliance_check": compliance,
        "education": education
    }
```

### Example 2: Conversation Management

```python
async def conversation_flow():
    """Example conversation tracking"""
    
    session_id = str(uuid.uuid4())
    
    # Track initial message
    await mcp_client.call_tool(
        "track_conversation",
        {
            "session_id": session_id,
            "message": "I'm new to CBD and have anxiety",
            "intent": "search_condition",
            "privacy_level": 2
        }
    )
    
    # Search products
    results = await mcp_client.call_tool(
        "search_products",
        {
            "query": "CBD for anxiety beginners",
            "limit": 3
        }
    )
    
    # Track preferences learned
    await mcp_client.call_tool(
        "track_conversation",
        {
            "session_id": session_id,
            "message": "Show me the gummies",
            "intent": "browse",
            "preferences": {
                "product_type": "edible",
                "condition": "anxiety"
            },
            "privacy_level": 2
        }
    )
    
    return results
```

### Example 3: Educational Query

```python
async def education_flow():
    """Example educational content retrieval"""
    
    # Get cannabinoid knowledge base
    knowledge = await mcp_client.read_resource(
        "budguide://knowledge/cannabinoids"
    )
    
    # Get specific education content
    cbd_info = await mcp_client.call_tool(
        "get_education_content",
        {
            "topic": "CBD",
            "user_level": "intermediate"
        }
    )
    
    # Get compliance information
    regulations = await mcp_client.read_resource(
        "budguide://compliance/nc-regulations"
    )
    
    return {
        "general_knowledge": knowledge,
        "cbd_education": cbd_info,
        "legal_info": regulations
    }
```

## Security & Privacy

### Data Handling by Privacy Level

| Level | Name | Data Storage | Features |
|-------|------|--------------|----------|
| 1 | Anonymous | None | Basic search only |
| 2 | Session | Memory only | Temporary preferences |
| 3 | Local | Browser storage | Persistent preferences |
| 4 | Account | Server database | Full personalization |

### Compliance Requirements

```python
# Automatic compliance checking
async def ensure_compliance(product_id: str, user_data: Dict):
    """Ensure all compliance requirements are met"""
    
    # Age verification for restricted products
    if product_requires_age_verification(product_id):
        if not user_data.get('age_verified'):
            return {
                "allowed": False,
                "reason": "Age verification required",
                "action": "verify_age"
            }
    
    # Location-based restrictions
    location = user_data.get('location', 'NC')
    if not product_legal_in_location(product_id, location):
        return {
            "allowed": False,
            "reason": f"Product not available in {location}",
            "action": "suggest_alternatives"
        }
    
    return {"allowed": True}
```

## Performance Optimization

### Caching Strategy

```python
class MCPCache:
    """Caching layer for MCP operations"""
    
    def __init__(self):
        self.product_cache = {}  # Product details cache
        self.search_cache = {}   # Search results cache
        self.education_cache = {} # Educational content cache
        
    async def get_or_fetch_product(self, product_id: str):
        """Get product from cache or fetch"""
        
        if product_id in self.product_cache:
            if self.is_fresh(self.product_cache[product_id]):
                return self.product_cache[product_id]['data']
        
        # Fetch and cache
        product = await fetch_product(product_id)
        self.product_cache[product_id] = {
            'data': product,
            'timestamp': datetime.utcnow()
        }
        
        return product
    
    def is_fresh(self, cached_item: Dict, max_age_seconds: int = 3600):
        """Check if cached item is fresh"""
        
        age = (datetime.utcnow() - cached_item['timestamp']).seconds
        return age < max_age_seconds
```

### Batch Operations

```python
async def batch_product_search(queries: List[str]):
    """Batch multiple search queries for efficiency"""
    
    # Generate embeddings in batch
    embeddings = encoder.encode(queries)
    
    # Execute parallel searches
    tasks = []
    for query, embedding in zip(queries, embeddings):
        task = search_products_with_embedding(embedding)
        tasks.append(task)
    
    results = await asyncio.gather(*tasks)
    
    return results
```

## Monitoring & Analytics

### Event Tracking

```python
class MCPAnalytics:
    """Analytics for MCP operations"""
    
    async def track_tool_usage(self, tool_name: str, 
                               arguments: Dict, 
                               result: Dict):
        """Track tool usage for analytics"""
        
        event = {
            "type": "tool_call",
            "tool": tool_name,
            "timestamp": datetime.utcnow(),
            "success": result.get('error') is None,
            "response_time": result.get('_response_time'),
            "user_session": result.get('_session_id')
        }
        
        await self.send_to_analytics(event)
    
    async def track_conversion(self, session_id: str, 
                              product_id: str,
                              action: str):
        """Track conversion events"""
        
        event = {
            "type": "conversion",
            "session_id": session_id,
            "product_id": product_id,
            "action": action,  # view, add_to_cart, purchase
            "timestamp": datetime.utcnow()
        }
        
        await self.send_to_analytics(event)
```

## Error Handling

```python
class MCPErrorHandler:
    """Centralized error handling for MCP operations"""
    
    @staticmethod
    def handle_tool_error(tool_name: str, error: Exception) -> Dict:
        """Handle tool execution errors"""
        
        if isinstance(error, ValueError):
            return {
                "error": "Invalid input",
                "message": str(error),
                "suggestion": "Please check your input parameters"
            }
        elif isinstance(error, asyncpg.PostgresError):
            return {
                "error": "Database error",
                "message": "Unable to fetch data",
                "suggestion": "Please try again later"
            }
        else:
            return {
                "error": "Unknown error",
                "message": "An unexpected error occurred",
                "suggestion": "Please contact support if this persists"
            }
```

## Testing Framework

```python
# tests/test_mcp_server.py
import pytest
from budguide_mcp.server import BudGuideMCPServer

@pytest.fixture
async def mcp_server():
    server = BudGuideMCPServer()
    await server.initialize()
    return server

@pytest.mark.asyncio
async def test_product_search(mcp_server):
    """Test product search functionality"""
    
    result = await mcp_server.search_products(
        query="CBD for sleep",
        limit=5
    )
    
    assert 'products' in result
    assert len(result['products']) <= 5
    assert result['intent'] == 'search_effect'

@pytest.mark.asyncio
async def test_compliance_check(mcp_server):
    """Test compliance checking"""
    
    result = await mcp_server.check_compliance(
        product_id="test-product-id",
        user_location="NC",
        user_age=21
    )
    
    assert 'is_compliant' in result
    assert 'restrictions' in result
```

## Deployment

### Docker Configuration

```dockerfile
# Dockerfile.mcp
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy MCP server
COPY budguide_mcp/ ./budguide_mcp/

# Run MCP server
CMD ["python", "-m", "budguide_mcp.server"]
```

### Environment Variables

```bash
# .env.mcp
BUDGUIDE_API_URL=http://api.budguide.com
BUDGUIDE_API_KEY=your-api-key
DATABASE_URL=postgresql://user:pass@localhost/budguide
VECTOR_DB_URL=http://localhost:8000
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=INFO
```

This MCP configuration provides a complete interface for AI assistants to interact with the BudGuide system, enabling natural language product discovery, compliance checking, education delivery, and conversation management while maintaining privacy and regulatory compliance.