# CLAUDE.md - BudGuide Digital Budtender Implementation

## Project Overview

BudGuide is a conversational digital budtender for hemp/CBD product discovery targeting North Carolina Triangle hemp retailers. The system uses natural language processing to match customer queries with products while addressing privacy concerns and education gaps.

**Core Value Proposition**: Transform queries like "something for sleep that won't make me groggy" into precise hemp product recommendations through conversational AI.

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    Next.js 14 + TypeScript                   │
│                         Tailwind CSS                         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      API Gateway                             │
│                   FastAPI + Pydantic                         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Core Services                             │
├──────────────────────────────────────────────────────────────┤
│  NLP Engine         │  Recommendation    │  Compliance      │
│  spaCy + Transformers│  Vector Search     │  Monitor         │
├──────────────────────────────────────────────────────────────┤
│                    Data Layer                                │
│  PostgreSQL + pgvector  │  Redis Cache  │  S3 Storage       │
└──────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: MVP Foundation (Weeks 1-4)

#### 1.1 Project Setup

```bash
# Create project structure
mkdir budguide && cd budguide
mkdir -p {backend,frontend,ml,data,scripts,tests,docs}

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Initialize requirements.txt
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
redis==5.0.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
httpx==0.25.2
beautifulsoup4==4.12.2
spacy==3.7.2
sentence-transformers==2.2.2
pgvector==0.2.3
pandas==2.1.3
numpy==1.24.3
scikit-learn==1.3.2
pytest==7.4.3
pytest-asyncio==0.21.1
python-dotenv==1.0.0
EOF

pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Frontend setup
cd ../frontend
npx create-next-app@14 . --typescript --tailwind --app --src-dir --import-alias "@/*"

# Additional frontend dependencies
npm install @tanstack/react-query axios zustand react-hook-form zod
npm install -D @types/node
```

#### 1.2 Database Schema

```sql
-- migrations/001_initial_schema.sql

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    description TEXT,
    
    -- Cannabinoid content
    cbd_mg DECIMAL(10,2),
    thc_mg DECIMAL(10,2),
    cbg_mg DECIMAL(10,2),
    cbn_mg DECIMAL(10,2),
    cbc_mg DECIMAL(10,2),
    thca_percentage DECIMAL(5,2),
    
    -- Product details
    price DECIMAL(10,2),
    size VARCHAR(50),
    product_type VARCHAR(50), -- flower, edible, tincture, topical
    strain_type VARCHAR(50), -- indica, sativa, hybrid, NA
    
    -- Effects and metadata
    effects JSONB, -- ["relaxing", "energizing", "pain-relief"]
    terpenes JSONB, -- {"limonene": 2.1, "myrcene": 1.5}
    lab_tested BOOLEAN DEFAULT false,
    lab_report_url TEXT,
    
    -- Embeddings for semantic search
    embedding vector(384),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Search optimization
    search_vector tsvector
);

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_effects ON products USING GIN(effects);
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_products_embedding ON products USING ivfflat (embedding vector_cosine_ops);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    user_id UUID, -- Optional, for registered users
    
    -- Conversation state
    messages JSONB NOT NULL DEFAULT '[]',
    context JSONB DEFAULT '{}',
    intent VARCHAR(100),
    
    -- Preferences learned
    preferences JSONB DEFAULT '{}',
    recommended_products UUID[] DEFAULT '{}',
    
    -- Analytics
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    conversion BOOLEAN DEFAULT false,
    
    -- Privacy level (1-4)
    privacy_level INTEGER DEFAULT 1
);

CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_user ON conversations(user_id);

-- User preferences (optional accounts)
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    
    -- Preferences
    preferred_cannabinoids JSONB DEFAULT '{}',
    avoided_ingredients TEXT[],
    preferred_effects TEXT[],
    dosage_preferences JSONB DEFAULT '{}',
    
    -- Medical considerations (encrypted)
    medical_notes_encrypted TEXT,
    
    -- Settings
    privacy_settings JSONB DEFAULT '{"share_data": false, "analytics": false}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    session_id VARCHAR(255),
    user_id UUID,
    
    -- Event data
    properties JSONB DEFAULT '{}',
    
    -- Context
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
```

#### 1.3 Backend API Structure

```python
# backend/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.api.v1 import products, chat, analytics, health
from app.ml.nlp_engine import NLPEngine
from app.db.database import init_db

# Initialize ML models on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    app.state.nlp_engine = NLPEngine()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="BudGuide API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1/health", tags=["health"])
app.include_router(products.router, prefix="/api/v1/products", tags=["products"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

# backend/app/core/config.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "BudGuide"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    REDIS_URL: str
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # ML Models
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    NLP_MODEL: str = "en_core_web_sm"
    
    # External APIs
    OPENAI_API_KEY: str = None  # Optional for advanced queries
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### Phase 2: Core NLP Implementation

#### 2.1 NLP Engine

```python
# backend/app/ml/nlp_engine.py
import spacy
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Tuple
import numpy as np
from enum import Enum

class Intent(Enum):
    BROWSE = "browse"
    SEARCH_EFFECT = "search_effect"
    SEARCH_CONDITION = "search_condition"
    EDUCATION = "education"
    DOSAGE = "dosage"
    SAFETY = "safety"
    COMPARISON = "comparison"
    UNKNOWN = "unknown"

class NLPEngine:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Intent patterns
        self.intent_patterns = {
            Intent.SEARCH_EFFECT: [
                "help with", "looking for", "need something for",
                "want to feel", "make me", "help me"
            ],
            Intent.SEARCH_CONDITION: [
                "pain", "anxiety", "sleep", "insomnia", "arthritis",
                "inflammation", "stress", "depression", "nausea"
            ],
            Intent.EDUCATION: [
                "what is", "how does", "explain", "tell me about",
                "difference between", "learn about"
            ],
            Intent.DOSAGE: [
                "how much", "dosage", "dose", "mg", "milligrams",
                "start with", "beginner dose"
            ],
            Intent.SAFETY: [
                "safe", "interact", "drug test", "legal", "side effects",
                "pregnant", "medication"
            ]
        }
        
        # Effect mappings
        self.effect_mappings = {
            "sleep": ["sedating", "relaxing", "calming", "nighttime"],
            "energy": ["energizing", "uplifting", "focus", "daytime"],
            "pain": ["anti-inflammatory", "analgesic", "pain-relief"],
            "anxiety": ["anxiolytic", "calming", "stress-relief"],
            "focus": ["clarity", "concentration", "alertness"]
        }
        
        # Cannabinoid properties
        self.cannabinoid_effects = {
            "CBD": ["anti-anxiety", "anti-inflammatory", "non-intoxicating"],
            "CBG": ["focus", "energy", "anti-bacterial"],
            "CBN": ["sedating", "sleep", "appetite"],
            "CBC": ["mood", "anti-inflammatory"],
            "THCA": ["anti-inflammatory", "neuroprotective", "non-intoxicating"]
        }
    
    def process_query(self, text: str) -> Dict[str, Any]:
        """Process user query and extract intent, entities, and embeddings"""
        doc = self.nlp(text.lower())
        
        # Extract intent
        intent = self._classify_intent(text)
        
        # Extract entities
        entities = self._extract_entities(doc)
        
        # Generate embedding for semantic search
        embedding = self.encoder.encode(text)
        
        # Extract keywords for hybrid search
        keywords = self._extract_keywords(doc)
        
        # Map to product requirements
        requirements = self._map_requirements(intent, entities, text)
        
        return {
            "original_text": text,
            "intent": intent.value,
            "entities": entities,
            "embedding": embedding.tolist(),
            "keywords": keywords,
            "requirements": requirements
        }
    
    def _classify_intent(self, text: str) -> Intent:
        """Classify the intent of the query"""
        text_lower = text.lower()
        
        # Check each intent pattern
        for intent, patterns in self.intent_patterns.items():
            if any(pattern in text_lower for pattern in patterns):
                return intent
        
        # Default intents based on question words
        if text_lower.startswith(("what", "how", "why", "when")):
            return Intent.EDUCATION
        elif any(word in text_lower for word in ["browse", "show", "see"]):
            return Intent.BROWSE
            
        return Intent.UNKNOWN
    
    def _extract_entities(self, doc) -> Dict[str, List[str]]:
        """Extract relevant entities from the query"""
        entities = {
            "conditions": [],
            "effects": [],
            "time_of_day": [],
            "cannabinoids": [],
            "product_types": [],
            "dosage": []
        }
        
        # Condition extraction
        conditions = ["pain", "anxiety", "sleep", "stress", "inflammation", 
                     "arthritis", "insomnia", "depression", "nausea", "appetite"]
        for token in doc:
            if token.text in conditions:
                entities["conditions"].append(token.text)
        
        # Time of day extraction
        if any(word in doc.text for word in ["morning", "daytime", "day"]):
            entities["time_of_day"].append("day")
        if any(word in doc.text for word in ["evening", "night", "bedtime", "sleep"]):
            entities["time_of_day"].append("night")
        
        # Cannabinoid extraction
        cannabinoids = ["cbd", "cbg", "cbn", "cbc", "thc", "thca"]
        for token in doc:
            if token.text.lower() in cannabinoids:
                entities["cannabinoids"].append(token.text.upper())
        
        # Product type extraction
        product_types = ["flower", "tincture", "oil", "edible", "gummy", 
                        "topical", "cream", "vape", "capsule"]
        for token in doc:
            if token.text in product_types:
                entities["product_types"].append(token.text)
        
        # Dosage extraction
        for ent in doc.ents:
            if ent.label_ == "QUANTITY":
                entities["dosage"].append(ent.text)
        
        return entities
    
    def _extract_keywords(self, doc) -> List[str]:
        """Extract keywords for hybrid search"""
        # Extract nouns and adjectives
        keywords = []
        for token in doc:
            if token.pos_ in ["NOUN", "ADJ"] and not token.is_stop:
                keywords.append(token.lemma_)
        
        # Add important bigrams
        bigrams = []
        for i in range(len(doc) - 1):
            if doc[i].pos_ == "ADJ" and doc[i + 1].pos_ == "NOUN":
                bigrams.append(f"{doc[i].text} {doc[i + 1].text}")
        
        return keywords + bigrams
    
    def _map_requirements(self, intent: Intent, entities: Dict, 
                         text: str) -> Dict[str, Any]:
        """Map intent and entities to product requirements"""
        requirements = {
            "must_have": [],
            "should_have": [],
            "must_not_have": [],
            "preferred_cannabinoids": [],
            "dosage_range": None,
            "time_of_day": None
        }
        
        # Map conditions to effects
        for condition in entities.get("conditions", []):
            if condition in ["pain", "inflammation", "arthritis"]:
                requirements["should_have"].extend(["anti-inflammatory", "analgesic"])
                requirements["preferred_cannabinoids"].extend(["CBD", "CBC"])
            elif condition in ["sleep", "insomnia"]:
                requirements["should_have"].extend(["sedating", "relaxing"])
                requirements["preferred_cannabinoids"].extend(["CBN", "CBD"])
            elif condition in ["anxiety", "stress"]:
                requirements["should_have"].extend(["calming", "anxiolytic"])
                requirements["preferred_cannabinoids"].extend(["CBD", "CBG"])
        
        # Time-based requirements
        if "day" in entities.get("time_of_day", []):
            requirements["must_not_have"].append("sedating")
            requirements["should_have"].append("energizing")
        elif "night" in entities.get("time_of_day", []):
            requirements["should_have"].append("sedating")
            requirements["must_not_have"].append("energizing")
        
        # Handle negations
        if "not" in text or "no" in text or "without" in text:
            # Simple negation handling - would need more sophisticated parsing
            if "groggy" in text:
                requirements["must_not_have"].append("heavy sedation")
            if "high" in text or "intoxicating" in text:
                requirements["must_not_have"].append("THC")
        
        return requirements

# backend/app/ml/product_matcher.py
import numpy as np
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import text
import json

class ProductMatcher:
    def __init__(self, db: Session):
        self.db = db
    
    async def find_matches(self, query_result: Dict[str, Any], 
                          limit: int = 5) -> List[Dict]:
        """Find matching products based on NLP analysis"""
        
        # Get requirements
        requirements = query_result.get("requirements", {})
        embedding = query_result.get("embedding", [])
        keywords = query_result.get("keywords", [])
        
        # Build the query
        products = await self._hybrid_search(
            embedding=embedding,
            keywords=keywords,
            requirements=requirements,
            limit=limit * 2  # Get more for filtering
        )
        
        # Score and rank products
        scored_products = self._score_products(products, requirements)
        
        # Return top matches
        return scored_products[:limit]
    
    async def _hybrid_search(self, embedding: List[float], 
                            keywords: List[str],
                            requirements: Dict,
                            limit: int) -> List[Dict]:
        """Perform hybrid vector + keyword search"""
        
        # Vector similarity search
        vector_query = text("""
            SELECT 
                id, name, description, effects, 
                cbd_mg, thc_mg, cbg_mg, cbn_mg,
                price, product_type,
                1 - (embedding <=> :embedding::vector) as similarity
            FROM products
            WHERE 1=1
                AND (:must_not_thc = false OR thc_mg < 0.3)
            ORDER BY similarity DESC
            LIMIT :limit
        """)
        
        # Check for THC restriction
        must_not_thc = "THC" in requirements.get("must_not_have", [])
        
        result = self.db.execute(
            vector_query,
            {
                "embedding": embedding,
                "must_not_thc": must_not_thc,
                "limit": limit
            }
        )
        
        products = []
        for row in result:
            products.append({
                "id": row.id,
                "name": row.name,
                "description": row.description,
                "effects": row.effects,
                "cbd_mg": float(row.cbd_mg) if row.cbd_mg else 0,
                "thc_mg": float(row.thc_mg) if row.thc_mg else 0,
                "cbg_mg": float(row.cbg_mg) if row.cbg_mg else 0,
                "cbn_mg": float(row.cbn_mg) if row.cbn_mg else 0,
                "price": float(row.price) if row.price else 0,
                "product_type": row.product_type,
                "similarity": float(row.similarity)
            })
        
        return products
    
    def _score_products(self, products: List[Dict], 
                       requirements: Dict) -> List[Dict]:
        """Score products based on requirements"""
        
        for product in products:
            score = product.get("similarity", 0) * 100
            
            # Check must-have requirements
            product_effects = product.get("effects", [])
            for req in requirements.get("must_have", []):
                if req in product_effects:
                    score += 20
                else:
                    score -= 30
            
            # Check should-have requirements
            for req in requirements.get("should_have", []):
                if req in product_effects:
                    score += 10
            
            # Check must-not-have requirements
            for req in requirements.get("must_not_have", []):
                if req in product_effects:
                    score -= 50
            
            # Cannabinoid preferences
            preferred_cannabinoids = requirements.get("preferred_cannabinoids", [])
            if "CBD" in preferred_cannabinoids and product.get("cbd_mg", 0) > 0:
                score += 15
            if "CBG" in preferred_cannabinoids and product.get("cbg_mg", 0) > 0:
                score += 15
            if "CBN" in preferred_cannabinoids and product.get("cbn_mg", 0) > 0:
                score += 15
            
            product["match_score"] = score
        
        # Sort by score
        return sorted(products, key=lambda x: x["match_score"], reverse=True)
```

#### 2.2 Conversation Management

```python
# backend/app/api/v1/chat.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import uuid
import json

from app.db.database import get_db
from app.ml.nlp_engine import NLPEngine
from app.ml.product_matcher import ProductMatcher
from app.models.schemas import ChatMessage, ChatResponse
from app.services.conversation_service import ConversationService

router = APIRouter()

@router.post("/message", response_model=ChatResponse)
async def process_message(
    message: ChatMessage,
    request: Request,
    db: Session = Depends(get_db)
):
    """Process a chat message and return response with recommendations"""
    
    # Get NLP engine from app state
    nlp_engine = request.app.state.nlp_engine
    
    # Get or create session
    session_id = message.session_id or str(uuid.uuid4())
    
    # Initialize services
    conversation_service = ConversationService(db)
    product_matcher = ProductMatcher(db)
    
    # Load conversation context
    conversation = await conversation_service.get_or_create(session_id)
    
    # Process the message with NLP
    query_result = nlp_engine.process_query(message.text)
    
    # Find matching products
    products = await product_matcher.find_matches(query_result, limit=5)
    
    # Generate response based on intent
    response = await generate_response(
        query_result=query_result,
        products=products,
        conversation=conversation
    )
    
    # Update conversation
    await conversation_service.update_conversation(
        session_id=session_id,
        user_message=message.text,
        bot_response=response["text"],
        products=products,
        intent=query_result["intent"]
    )
    
    return ChatResponse(
        session_id=session_id,
        response=response["text"],
        products=products,
        suggestions=response.get("suggestions", []),
        educational_content=response.get("educational_content")
    )

async def generate_response(
    query_result: Dict,
    products: List[Dict],
    conversation: Dict
) -> Dict[str, Any]:
    """Generate conversational response based on intent and products"""
    
    intent = query_result["intent"]
    entities = query_result["entities"]
    
    response = {
        "text": "",
        "suggestions": [],
        "educational_content": None
    }
    
    # Intent-based response generation
    if intent == "search_effect" or intent == "search_condition":
        if products:
            response["text"] = generate_product_response(products, entities)
            response["suggestions"] = [
                "Tell me more about the first option",
                "Do you have anything stronger?",
                "What about for daytime use?"
            ]
        else:
            response["text"] = "I couldn't find exact matches for your needs. Could you tell me more about what you're looking for?"
            response["suggestions"] = [
                "I need help with sleep",
                "Looking for pain relief",
                "Something for anxiety"
            ]
    
    elif intent == "education":
        response["text"] = generate_educational_response(entities)
        response["educational_content"] = get_educational_content(entities)
        response["suggestions"] = [
            "How do I know the right dosage?",
            "Is this legal in North Carolina?",
            "Will this show up on a drug test?"
        ]
    
    elif intent == "safety":
        response["text"] = generate_safety_response(entities)
        response["suggestions"] = [
            "Tell me about CBD interactions",
            "Is hemp legal in NC?",
            "Can I drive after taking CBD?"
        ]
    
    elif intent == "browse":
        response["text"] = "I'd be happy to help you explore our products! What are you most interested in?"
        response["suggestions"] = [
            "Products for relaxation",
            "Daytime options",
            "Best sellers",
            "New to hemp - where do I start?"
        ]
    
    else:
        response["text"] = "I'm here to help you find the right hemp products. What brings you here today?"
        response["suggestions"] = [
            "I'm new to CBD",
            "Looking for something specific",
            "Just browsing"
        ]
    
    return response

def generate_product_response(products: List[Dict], entities: Dict) -> str:
    """Generate natural language response for product recommendations"""
    
    # Get condition or effect being addressed
    conditions = entities.get("conditions", [])
    condition_text = conditions[0] if conditions else "your needs"
    
    response = f"I found {len(products)} products that might help with {condition_text}:\n\n"
    
    for i, product in enumerate(products[:3], 1):
        response += f"**{i}. {product['name']}**\n"
        
        # Add cannabinoid info
        if product.get('cbd_mg'):
            response += f"   • CBD: {product['cbd_mg']}mg\n"
        if product.get('cbg_mg'):
            response += f"   • CBG: {product['cbg_mg']}mg\n"
        if product.get('cbn_mg'):
            response += f"   • CBN: {product['cbn_mg']}mg\n"
        
        # Add effects
        if product.get('effects'):
            effects_str = ", ".join(product['effects'][:3])
            response += f"   • Effects: {effects_str}\n"
        
        response += f"   • Price: ${product['price']}\n\n"
    
    response += "\nWould you like to know more about any of these options?"
    
    return response

def generate_educational_response(entities: Dict) -> str:
    """Generate educational response"""
    
    cannabinoids = entities.get("cannabinoids", [])
    
    if "CBD" in cannabinoids:
        return """CBD (Cannabidiol) is a non-intoxicating compound found in hemp plants. 
        It's known for its potential therapeutic benefits including:
        • Anti-inflammatory properties
        • Anxiety reduction
        • Pain management
        • Improved sleep quality
        
        CBD won't make you feel 'high' and is legal in North Carolina when derived from hemp with less than 0.3% THC."""
    
    elif "CBG" in cannabinoids:
        return """CBG (Cannabigerol) is often called the 'mother cannabinoid' because other cannabinoids derive from it. 
        Unlike CBD which can be sedating, CBG may actually:
        • Increase focus and alertness
        • Provide anti-bacterial benefits
        • Support digestive health
        • Reduce inflammation
        
        It's perfect for daytime use when you need to stay sharp."""
    
    else:
        return """Hemp contains over 100 different cannabinoids, each with unique properties. 
        The main ones we work with are:
        • **CBD**: Calming, anti-inflammatory
        • **CBG**: Focus, energy
        • **CBN**: Sleep, relaxation
        • **CBC**: Mood support
        
        Would you like to learn about any specific cannabinoid?"""

def generate_safety_response(entities: Dict) -> str:
    """Generate safety-focused response"""
    
    return """Safety is our top priority. Here's what you should know:

    **Legal Status**: Hemp-derived products with less than 0.3% THC are legal in North Carolina.
    
    **Drug Testing**: Pure CBD shouldn't cause a positive drug test, but full-spectrum products 
    containing trace THC might. Consider broad-spectrum or isolate products if this is a concern.
    
    **Interactions**: CBD can interact with certain medications, particularly blood thinners. 
    Always consult your healthcare provider if you're taking prescription medications.
    
    **Quality**: All our products are third-party lab tested for purity and potency.
    
    Do you have specific safety concerns I can address?"""

# backend/app/models/schemas.py
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
    cbd_mg: Optional[float]
    thc_mg: Optional[float]
    cbg_mg: Optional[float]
    cbn_mg: Optional[float]
    price: float
    effects: List[str]
    match_score: Optional[float]
    product_type: str

class ChatResponse(BaseModel):
    session_id: str
    response: str
    products: List[ProductInfo]
    suggestions: List[str]
    educational_content: Optional[Dict[str, Any]]
```

### Phase 3: Frontend Implementation

#### 3.0 Zen Design System

```typescript
// frontend/src/styles/design-system.ts
/**
 * BudGuide Zen Design System
 * 
 * Philosophy: Create a calming, welcoming digital sanctuary that reduces
 * anxiety and builds trust through thoughtful, minimalist design.
 * 
 * Core Principles:
 * - Reduce visual noise and cognitive load
 * - Use nature-inspired, calming colors
 * - Incorporate generous whitespace for breathing room
 * - Smooth, gentle animations that don't startle
 * - Warm, conversational language
 * - Progressive disclosure to prevent overwhelm
 */

export const zenDesignSystem = {
  // Calming Color Palette - Inspired by nature and wellness
  colors: {
    // Primary - Soft, muted greens (growth, nature, healing)
    primary: {
      50: '#f0f9f4',   // Mint mist
      100: '#e6f4ea',  // Morning dew
      200: '#c3e9d0',  // Sage whisper
      300: '#8ed1a6',  // Soft jade
      400: '#5cb87c',  // Living green
      500: '#3ea055',  // Forest calm
      600: '#2d7a3e',  // Deep forest
      700: '#245530',  // Evening green
      800: '#1a3d22',  // Night forest
      900: '#0f2614',  // Midnight green
    },
    
    // Neutrals - Warm grays (avoiding cold, clinical feeling)
    neutral: {
      50: '#fafaf9',   // Warm white
      100: '#f5f5f4',  // Soft linen
      200: '#e8e8e6',  // Light stone
      300: '#d4d4d1',  // Warm gray
      400: '#a3a39e',  // Sage gray
      500: '#73736e',  // Balanced gray
      600: '#52524c',  // Charcoal
      700: '#3a3a35',  // Dark earth
      800: '#27271f',  // Rich soil
      900: '#1a1a15',  // Deep earth
    },
    
    // Accent - Soft earth tones
    accent: {
      lavender: '#e8e0f5',  // Calming, spiritual
      peach: '#fde7d9',     // Warm, approachable
      sky: '#e0f2fe',       // Open, free
      sand: '#fef3c7',      // Grounding, natural
      rose: '#fce7f3',      // Gentle, caring
    },
    
    // Semantic colors - Softer than typical
    semantic: {
      success: '#86efac',  // Soft green (not harsh)
      warning: '#fde047',  // Gentle yellow
      error: '#fca5a5',    // Soft red (not alarming)
      info: '#93c5fd',     // Calm blue
    }
  },
  
  // Typography - Clear, readable, friendly
  typography: {
    fonts: {
      heading: "'Quicksand', 'Rounded Mplus 1c', sans-serif",  // Soft, rounded
      body: "'Inter', 'Noto Sans', sans-serif",                // Clean, readable
      ui: "'Inter', system-ui, sans-serif",                    // Consistent
    },
    
    sizes: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px - optimal for reading
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,  // Maximum weight - avoid heavy/bold
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.6,    // Optimized for readability
      relaxed: 1.75,
      loose: 2,
    }
  },
  
  // Spacing - Based on 8px grid for harmony
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
  },
  
  // Borders - Soft, organic shapes
  borders: {
    radius: {
      none: '0',
      sm: '0.25rem',   // 4px - subtle
      md: '0.5rem',    // 8px - default
      lg: '0.75rem',   // 12px - cards
      xl: '1rem',      // 16px - buttons
      '2xl': '1.5rem', // 24px - modals
      full: '9999px',  // Pills, avatars
    },
    
    width: {
      0: '0',
      1: '1px',
      2: '2px',
    },
    
    style: {
      solid: 'solid',
      dashed: 'dashed',
      none: 'none',
    }
  },
  
  // Shadows - Soft, diffused (no harsh shadows)
  shadows: {
    none: 'none',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
  },
  
  // Animations - Smooth, calming transitions
  animations: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',  // Default - smooth
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    
    keyframes: {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      slideUp: {
        from: { transform: 'translateY(10px)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
      },
      pulse: {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.8 },
      },
      breathe: {
        '0%, 100%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.02)' },
      }
    }
  },
  
  // Layout patterns
  layout: {
    maxWidth: {
      xs: '20rem',    // 320px
      sm: '24rem',    // 384px
      md: '28rem',    // 448px
      lg: '32rem',    // 512px
      xl: '36rem',    // 576px
      '2xl': '42rem', // 672px
      '3xl': '48rem', // 768px
      '4xl': '56rem', // 896px
      '5xl': '64rem', // 1024px
      '6xl': '72rem', // 1152px
      full: '100%',
    },
    
    containerPadding: {
      mobile: '1rem',   // 16px
      tablet: '2rem',   // 32px
      desktop: '3rem',  // 48px
    }
  }
};

// Zen-inspired component styles
export const zenComponents = {
  // Buttons - Soft, inviting, never aggressive
  button: {
    base: `
      font-medium
      transition-all duration-250 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    variants: {
      primary: `
        bg-primary-500 text-white
        hover:bg-primary-600 hover:shadow-md
        focus:ring-primary-400
        active:bg-primary-700
      `,
      secondary: `
        bg-neutral-100 text-neutral-700
        hover:bg-neutral-200 hover:shadow-sm
        focus:ring-neutral-300
        active:bg-neutral-300
      `,
      ghost: `
        bg-transparent text-neutral-600
        hover:bg-neutral-50
        focus:ring-neutral-200
        active:bg-neutral-100
      `,
    },
    sizes: {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-2.5 text-base rounded-xl',
      lg: 'px-6 py-3 text-lg rounded-xl',
    }
  },
  
  // Cards - Floating, soft containers
  card: {
    base: `
      bg-white
      border border-neutral-100
      rounded-2xl
      shadow-sm
      transition-all duration-250
      hover:shadow-md
    `,
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }
  },
  
  // Chat bubbles - Organic, friendly shapes
  chatBubble: {
    user: `
      bg-primary-50
      text-neutral-800
      rounded-2xl rounded-br-sm
      px-4 py-3
      max-w-[80%]
      ml-auto
    `,
    assistant: `
      bg-white
      text-neutral-800
      rounded-2xl rounded-bl-sm
      px-4 py-3
      max-w-[80%]
      border border-neutral-100
      shadow-sm
    `,
  },
  
  // Input fields - Gentle, approachable
  input: {
    base: `
      w-full
      px-4 py-3
      bg-white
      border border-neutral-200
      rounded-xl
      text-neutral-800
      placeholder-neutral-400
      transition-all duration-250
      focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
      hover:border-neutral-300
    `,
  },
  
  // Modals - Soft overlay, breathing room
  modal: {
    overlay: 'bg-black/20 backdrop-blur-sm',
    content: `
      bg-white
      rounded-3xl
      shadow-xl
      p-8
      max-w-lg
      mx-auto
      animate-slideUp
    `,
  }
};

// Zen language guidelines
export const zenLanguage = {
  greetings: [
    "Hi there! I'm here to help you find your path to wellness 🌿",
    "Welcome! Let's explore hemp products together at your pace",
    "Hello! I'm your gentle guide to discovering hemp's benefits",
  ],
  
  encouragements: [
    "Take your time - there's no rush",
    "That's a great question",
    "You're on the right track",
    "Let's explore this together",
  ],
  
  transitions: [
    "When you're ready...",
    "If you'd like to know more...",
    "Feel free to ask anything...",
    "No pressure, but...",
  ],
  
  errors: {
    gentle: "Hmm, let me try that another way",
    supportive: "No worries! Let's figure this out together",
    patient: "Take your time, I'm here when you're ready",
  }
};

// Accessibility with zen approach
export const zenAccessibility = {
  // High contrast but soft
  contrast: {
    AAA: 7.1,  // For small text
    AA: 4.5,   // For large text
  },
  
  // Focus indicators - visible but gentle
  focus: {
    ring: '2px solid',
    offset: '2px',
    color: 'primary-400',
  },
  
  // Motion preferences
  motion: {
    reduceMotion: '@media (prefers-reduced-motion: reduce)',
    safeAnimations: ['opacity', 'color'],  // Only non-motion animations
  },
  
  // Screen reader friendly
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  }
};
```

```css
/* frontend/src/styles/zen-theme.css */

/* Custom zen-inspired CSS utilities */
@layer utilities {
  /* Breathing animations for calm interaction */
  .zen-breathe {
    animation: breathe 4s ease-in-out infinite;
  }
  
  @keyframes breathe {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.02); opacity: 0.95; }
  }
  
  /* Soft glow for focus states */
  .zen-glow {
    box-shadow: 
      0 0 0 3px rgba(62, 160, 85, 0.1),
      0 0 15px rgba(62, 160, 85, 0.1);
  }
  
  /* Gradient backgrounds - subtle and calming */
  .zen-gradient-soft {
    background: linear-gradient(135deg, #f0f9f4 0%, #e6f4ea 100%);
  }
  
  .zen-gradient-dawn {
    background: linear-gradient(135deg, #fef3c7 0%, #e0f2fe 100%);
  }
  
  .zen-gradient-dusk {
    background: linear-gradient(135deg, #e8e0f5 0%, #fce7f3 100%);
  }
  
  /* Organic shapes */
  .zen-blob {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  }
  
  /* Soft scrollbar styling */
  .zen-scroll {
    scrollbar-width: thin;
    scrollbar-color: #c3e9d0 #f0f9f4;
  }
  
  .zen-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .zen-scroll::-webkit-scrollbar-track {
    background: #f0f9f4;
    border-radius: 10px;
  }
  
  .zen-scroll::-webkit-scrollbar-thumb {
    background: #c3e9d0;
    border-radius: 10px;
    border: 2px solid #f0f9f4;
  }
  
  .zen-scroll::-webkit-scrollbar-thumb:hover {
    background: #8ed1a6;
  }
}

/* Zen loading states */
.zen-skeleton {
  background: linear-gradient(
    90deg,
    #f0f9f4 25%,
    #e6f4ea 50%,
    #f0f9f4 75%
  );
  background-size: 200% 100%;
  animation: zen-loading 1.5s ease-in-out infinite;
}

@keyframes zen-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Zen hover states - gentle elevation */
.zen-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.zen-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(62, 160, 85, 0.15);
}

/* Remove harsh outlines, use soft focus */
*:focus {
  outline: none;
}

*:focus-visible {
  outline: 2px solid rgba(62, 160, 85, 0.5);
  outline-offset: 2px;
  border-radius: 4px;
}
```

#### 3.1 Next.js Chat Interface with Zen Design

```typescript
// frontend/src/app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ProductGrid from '@/components/ProductGrid';
import PrivacyToggle from '@/components/PrivacyToggle';
import { useChat } from '@/hooks/useChat';
import { zenDesignSystem } from '@/styles/design-system';

export default function Home() {
  const [privacyLevel, setPrivacyLevel] = useState(1);
  const { messages, products, sendMessage, isLoading } = useChat();

  return (
    <div className="min-h-screen zen-gradient-soft">
      {/* Zen-inspired Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Organic logo shape */}
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center zen-breathe shadow-sm">
                <span className="text-white text-xl">🌿</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-neutral-800" style={{ fontFamily: zenDesignSystem.typography.fonts.heading }}>
                  BudGuide
                </h1>
                <p className="text-sm text-neutral-500">Your gentle guide to wellness</p>
              </div>
            </div>
            <PrivacyToggle level={privacyLevel} onChange={setPrivacyLevel} />
          </div>
        </div>
      </header>

      {/* Main Content with breathing room */}
      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Chat Section with zen styling */}
        <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-10rem)]">
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden zen-hover">
            <ChatInterface
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              privacyLevel={privacyLevel}
            />
          </div>
        </div>

        {/* Products Section with calm presentation */}
        <div className="space-y-6">
          {products.length > 0 ? (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-xl font-medium text-neutral-700 mb-2">
                  Your Personalized Matches
                </h2>
                <p className="text-neutral-500 text-sm">
                  Take your time exploring these options
                </p>
              </div>
              <ProductGrid products={products} />
            </>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-12 text-center">
              <div className="text-neutral-300 mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-3">
                Ready when you are
              </h3>
              <p className="text-neutral-500 leading-relaxed">
                I'm here to help you discover hemp products that match your needs. 
                No rush, no pressure – just a friendly conversation about wellness.
              </p>
              <div className="mt-8 space-y-3">
                <button 
                  onClick={() => sendMessage("I'm new to hemp products")}
                  className="w-full text-left p-4 bg-gradient-to-r from-accent-lavender to-accent-sky rounded-2xl hover:shadow-md transition-all group"
                >
                  <span className="font-medium text-neutral-700">New to hemp? 🌱</span>
                  <span className="text-sm text-neutral-500 block mt-1">
                    Let's start with the basics, nice and easy
                  </span>
                </button>
                <button 
                  onClick={() => sendMessage("I need help with a specific issue")}
                  className="w-full text-left p-4 bg-gradient-to-r from-accent-peach to-accent-sand rounded-2xl hover:shadow-md transition-all group"
                >
                  <span className="font-medium text-neutral-700">Have something specific in mind? 🎯</span>
                  <span className="text-sm text-neutral-500 block mt-1">
                    Tell me what you're looking for
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Zen footer breathing space */}
      <footer className="mt-20 py-10 border-t border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-neutral-400 text-sm">
            Creating a calmer path to wellness • Made with 💚 in North Carolina
          </p>
        </div>
      </footer>
    </div>
  );
}

// frontend/src/components/ChatInterface.tsx
import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types';
import MessageBubble from './MessageBubble';
import SuggestionChips from './SuggestionChips';
import TypingIndicator from './TypingIndicator';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  privacyLevel: number;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  privacyLevel
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  // Get latest suggestions from bot messages
  const latestSuggestions = messages
    .filter(m => m.role === 'assistant' && m.suggestions)
    .slice(-1)[0]?.suggestions || [];

  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col h-full">
      {/* Privacy indicator */}
      <div className="px-4 py-2 bg-green-50 rounded-t-xl border-b">
        <div className="flex items-center text-sm text-green-700">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Privacy Level {privacyLevel}: {
            privacyLevel === 1 ? 'Anonymous Browsing' :
            privacyLevel === 2 ? 'Session Memory' :
            privacyLevel === 3 ? 'Local Storage' :
            'Account Sync'
          }
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Hi! I'm your hemp guide 🌿
            </h3>
            <p className="text-gray-600 mb-4">
              I can help you find the perfect products for your needs.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleSuggestionClick("I'm new to hemp products")}
                className="block w-full text-left px-4 py-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <span className="font-medium">New to hemp?</span>
                <span className="text-sm text-gray-600 block">
                  I'll guide you through the basics
                </span>
              </button>
              <button
                onClick={() => handleSuggestionClick("I need help with sleep")}
                className="block w-full text-left px-4 py-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <span className="font-medium">Specific need?</span>
                <span className="text-sm text-gray-600 block">
                  Tell me what you're looking for
                </span>
              </button>
              <button
                onClick={() => handleSuggestionClick("Just browsing products")}
                className="block w-full text-left px-4 py-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <span className="font-medium">Just browsing?</span>
                <span className="text-sm text-gray-600 block">
                  Explore our product categories
                </span>
              </button>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {latestSuggestions.length > 0 && !isLoading && (
        <div className="px-4 py-2 border-t">
          <SuggestionChips
            suggestions={latestSuggestions}
            onSelect={handleSuggestionClick}
          />
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// frontend/src/hooks/useChat.ts
import { useState, useCallback } from 'react';
import { Message, Product } from '@/types';
import { chatAPI } from '@/services/api';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage({
        text,
        session_id: sessionId
      });

      // Update session ID
      if (!sessionId) {
        setSessionId(response.session_id);
      }

      // Add bot message
      const botMessage: Message = {
        role: 'assistant',
        content: response.response,
        suggestions: response.suggestions,
        educational: response.educational_content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      // Update products if provided
      if (response.products && response.products.length > 0) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return {
    messages,
    products,
    sendMessage,
    isLoading,
    sessionId
  };
}
```

### Phase 4: Testing & Deployment

#### 4.1 Testing Suite

```python
# tests/test_nlp_engine.py
import pytest
from backend.app.ml.nlp_engine import NLPEngine, Intent

@pytest.fixture
def nlp_engine():
    return NLPEngine()

def test_intent_classification(nlp_engine):
    # Test effect search
    result = nlp_engine.process_query("I need something for sleep")
    assert result["intent"] == Intent.SEARCH_EFFECT.value
    
    # Test education
    result = nlp_engine.process_query("What is CBD?")
    assert result["intent"] == Intent.EDUCATION.value
    
    # Test safety
    result = nlp_engine.process_query("Is this safe with medications?")
    assert result["intent"] == Intent.SAFETY.value

def test_entity_extraction(nlp_engine):
    result = nlp_engine.process_query("I need CBD for nighttime anxiety relief")
    entities = result["entities"]
    
    assert "CBD" in entities["cannabinoids"]
    assert "night" in entities["time_of_day"]
    assert "anxiety" in entities["conditions"]

def test_requirement_mapping(nlp_engine):
    result = nlp_engine.process_query("Something for pain but not sedating")
    requirements = result["requirements"]
    
    assert "anti-inflammatory" in requirements["should_have"]
    assert "sedating" in requirements["must_not_have"]

# tests/test_product_matcher.py
import pytest
from unittest.mock import Mock, AsyncMock
from backend.app.ml.product_matcher import ProductMatcher

@pytest.mark.asyncio
async def test_product_matching():
    # Mock database session
    mock_db = Mock()
    matcher = ProductMatcher(mock_db)
    
    # Mock query result
    query_result = {
        "embedding": [0.1] * 384,
        "keywords": ["sleep", "relaxing"],
        "requirements": {
            "should_have": ["sedating", "relaxing"],
            "must_not_have": ["THC"],
            "preferred_cannabinoids": ["CBN", "CBD"]
        }
    }
    
    # Mock products
    mock_products = [
        {
            "id": "123",
            "name": "Sleep Tincture",
            "cbd_mg": 30,
            "cbn_mg": 10,
            "thc_mg": 0,
            "effects": ["sedating", "relaxing"],
            "similarity": 0.95
        }
    ]
    
    matcher._hybrid_search = AsyncMock(return_value=mock_products)
    
    # Test matching
    results = await matcher.find_matches(query_result, limit=5)
    
    assert len(results) > 0
    assert results[0]["match_score"] > 100  # High score for good match
```

#### 4.2 Deployment Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_DB: budguide
      POSTGRES_USER: budguide
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://budguide:${DB_PASSWORD}@postgres:5432/budguide
      REDIS_URL: redis://redis:6379
      SECRET_KEY: ${SECRET_KEY}
    depends_on:
      - postgres
      - redis
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8000
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next

volumes:
  postgres_data:

# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm

# Copy application
COPY . .

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application
COPY . .

# Build application
RUN npm run build

# Run application
CMD ["npm", "run", "dev"]
```

#### 4.3 Production Deployment

```bash
# deploy.sh
#!/bin/bash

# Environment check
if [ "$1" != "production" ] && [ "$1" != "staging" ]; then
    echo "Usage: ./deploy.sh [production|staging]"
    exit 1
fi

ENV=$1
echo "Deploying to $ENV..."

# Load environment variables
source .env.$ENV

# Database migrations
echo "Running database migrations..."
psql $DATABASE_URL < migrations/001_initial_schema.sql

# Build and push Docker images
echo "Building Docker images..."
docker-compose -f docker-compose.$ENV.yml build

# Deploy to cloud (example for AWS ECS)
if [ "$ENV" == "production" ]; then
    aws ecs update-service \
        --cluster budguide-cluster \
        --service budguide-backend \
        --force-new-deployment
    
    aws ecs update-service \
        --cluster budguide-cluster \
        --service budguide-frontend \
        --force-new-deployment
fi

echo "Deployment complete!"

# Production environment variables (.env.production)
DATABASE_URL=postgresql://user:pass@rds.amazonaws.com/budguide
REDIS_URL=redis://elasticache.amazonaws.com:6379
SECRET_KEY=your-production-secret-key
ALLOWED_ORIGINS=https://budguide.com,https://www.budguide.com
SENTRY_DSN=your-sentry-dsn
```

## Monitoring & Analytics

```python
# backend/app/services/analytics.py
from typing import Dict, Any
import json
from datetime import datetime
from sqlalchemy.orm import Session

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
    
    async def track_event(
        self,
        event_type: str,
        session_id: str,
        properties: Dict[str, Any]
    ):
        """Track analytics event"""
        
        # Store in database
        event = {
            "event_type": event_type,
            "session_id": session_id,
            "properties": json.dumps(properties),
            "created_at": datetime.utcnow()
        }
        
        # Insert event
        self.db.execute(
            """
            INSERT INTO analytics_events 
            (event_type, session_id, properties, created_at)
            VALUES (:event_type, :session_id, :properties, :created_at)
            """,
            event
        )
        self.db.commit()
        
        # Send to external analytics (Mixpanel, Amplitude, etc.)
        if settings.MIXPANEL_TOKEN:
            await self._send_to_mixpanel(event_type, properties)
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get key metrics for dashboard"""
        
        metrics = {}
        
        # Conversion rate
        result = self.db.execute("""
            SELECT 
                COUNT(DISTINCT session_id) as total_sessions,
                COUNT(DISTINCT CASE WHEN conversion = true THEN session_id END) as converted_sessions
            FROM conversations
            WHERE started_at >= NOW() - INTERVAL '30 days'
        """).first()
        
        metrics["conversion_rate"] = (
            result.converted_sessions / result.total_sessions * 100 
            if result.total_sessions > 0 else 0
        )
        
        # Average session duration
        result = self.db.execute("""
            SELECT AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration
            FROM conversations
            WHERE ended_at IS NOT NULL
            AND started_at >= NOW() - INTERVAL '30 days'
        """).first()
        
        metrics["avg_session_duration"] = result.avg_duration or 0
        
        # Product recommendation acceptance
        result = self.db.execute("""
            SELECT 
                COUNT(*) as total_recommendations,
                COUNT(CASE WHEN properties->>'clicked' = 'true' THEN 1 END) as clicked
            FROM analytics_events
            WHERE event_type = 'product_recommended'
            AND created_at >= NOW() - INTERVAL '30 days'
        """).first()
        
        metrics["recommendation_acceptance"] = (
            result.clicked / result.total_recommendations * 100
            if result.total_recommendations > 0 else 0
        )
        
        return metrics
```

## Data Collection Scripts

```python
# scripts/scrape_products.py
import asyncio
import httpx
from bs4 import BeautifulSoup
import json
from datetime import datetime

async def scrape_hemp_generation():
    """Scrape product data from Hemp Generation"""
    
    products = []
    base_url = "https://hempgeneration.com"
    
    async with httpx.AsyncClient() as client:
        # Get main products page
        response = await client.get(f"{base_url}/products/")
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find product links
        product_links = soup.find_all('a', class_='product-link')
        
        for link in product_links:
            product_url = base_url + link.get('href')
            product_data = await scrape_product_details(client, product_url)
            products.append(product_data)
            
            # Rate limiting
            await asyncio.sleep(1)
    
    # Save to JSON
    with open('data/hemp_generation_products.json', 'w') as f:
        json.dump(products, f, indent=2)
    
    return products

async def scrape_product_details(client, url):
    """Scrape individual product details"""
    
    response = await client.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    product = {
        "url": url,
        "name": soup.find('h1', class_='product-title').text.strip(),
        "price": extract_price(soup.find('span', class_='price')),
        "description": soup.find('div', class_='description').text.strip(),
        "scraped_at": datetime.utcnow().isoformat()
    }
    
    # Extract cannabinoid content
    specs = soup.find('div', class_='specifications')
    if specs:
        product.update(extract_cannabinoids(specs))
    
    # Extract effects
    effects_section = soup.find('div', class_='effects')
    if effects_section:
        product['effects'] = [
            tag.text.strip() 
            for tag in effects_section.find_all('span', class_='effect-tag')
        ]
    
    return product

def extract_price(price_element):
    """Extract price as float"""
    if not price_element:
        return None
    price_text = price_element.text.strip()
    return float(price_text.replace('$', '').replace(',', ''))

def extract_cannabinoids(specs_element):
    """Extract cannabinoid percentages"""
    cannabinoids = {}
    
    # Look for patterns like "CBD: 25mg" or "THCA: 32.33%"
    text = specs_element.text
    
    patterns = {
        'cbd_mg': r'CBD:?\s*([\d.]+)\s*mg',
        'thc_mg': r'THC:?\s*([\d.]+)\s*mg',
        'cbg_mg': r'CBG:?\s*([\d.]+)\s*mg',
        'cbn_mg': r'CBN:?\s*([\d.]+)\s*mg',
        'thca_percentage': r'THCA:?\s*([\d.]+)%'
    }
    
    import re
    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            cannabinoids[key] = float(match.group(1))
    
    return cannabinoids

if __name__ == "__main__":
    asyncio.run(scrape_hemp_generation())
```

## Success Metrics Dashboard

```python
# backend/app/api/v1/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime, timedelta

from app.db.database import get_db
from app.services.analytics import AnalyticsService

router = APIRouter()

@router.get("/metrics")
async def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Get dashboard metrics"""
    
    analytics = AnalyticsService(db)
    metrics = await analytics.get_metrics()
    
    # Add real-time metrics
    realtime = await get_realtime_metrics(db)
    metrics.update(realtime)
    
    return metrics

async def get_realtime_metrics(db: Session) -> Dict[str, Any]:
    """Get real-time metrics"""
    
    # Active sessions (last 5 minutes)
    result = db.execute("""
        SELECT COUNT(DISTINCT session_id) as active_sessions
        FROM analytics_events
        WHERE created_at >= NOW() - INTERVAL '5 minutes'
    """).first()
    
    # Today's stats
    today_result = db.execute("""
        SELECT 
            COUNT(DISTINCT session_id) as sessions_today,
            COUNT(DISTINCT CASE WHEN conversion = true THEN session_id END) as conversions_today
        FROM conversations
        WHERE DATE(started_at) = CURRENT_DATE
    """).first()
    
    return {
        "active_sessions": result.active_sessions,
        "sessions_today": today_result.sessions_today,
        "conversions_today": today_result.conversions_today,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/funnel")
async def get_conversion_funnel(db: Session = Depends(get_db)):
    """Get conversion funnel data"""
    
    funnel = db.execute("""
        WITH funnel_stages AS (
            SELECT 
                session_id,
                MAX(CASE WHEN event_type = 'session_start' THEN 1 ELSE 0 END) as started,
                MAX(CASE WHEN event_type = 'message_sent' THEN 1 ELSE 0 END) as engaged,
                MAX(CASE WHEN event_type = 'product_viewed' THEN 1 ELSE 0 END) as viewed_product,
                MAX(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END) as added_to_cart,
                MAX(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) as purchased
            FROM analytics_events
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY session_id
        )
        SELECT 
            SUM(started) as started,
            SUM(engaged) as engaged,
            SUM(viewed_product) as viewed_product,
            SUM(added_to_cart) as added_to_cart,
            SUM(purchased) as purchased
        FROM funnel_stages
    """).first()
    
    return {
        "stages": [
            {"name": "Started Session", "count": funnel.started},
            {"name": "Sent Message", "count": funnel.engaged},
            {"name": "Viewed Product", "count": funnel.viewed_product},
            {"name": "Added to Cart", "count": funnel.added_to_cart},
            {"name": "Purchased", "count": funnel.purchased}
        ]
    }
```

## Claude Code Implementation Notes

This document provides a complete technical specification for implementing the BudGuide digital budtender MVP. Key implementation priorities:

1. **Start with Phase 1** - Get basic chat and product matching working
2. **Implement Zen Design System** - Create a calming, welcoming experience that reduces anxiety
3. **Focus on NLP accuracy** - The conversation quality determines success
4. **Implement privacy-first** - Build trust through transparent data handling
5. **Test with real products** - Use actual Hemp Generation catalog data
6. **Monitor everything** - Track metrics from day one for rapid iteration

### Critical Design Philosophy
The Zen Design System is not optional - it's core to reducing "store fear" and making users feel welcome. Every design decision should ask: "Does this make the user feel calmer and more comfortable?" Use:
- Soft, nature-inspired colors (sage greens, warm earth tones)
- Generous whitespace and breathing room
- Smooth, gentle animations (never jarring)
- Warm, encouraging language ("Take your time", "No pressure")
- Progressive disclosure to prevent overwhelm
- Organic, rounded shapes (no sharp corners)

The modular architecture allows for incremental development and testing. Each component can be built and validated independently before integration.

Remember to:
- Use environment variables for all sensitive configuration
- Implement comprehensive error handling
- Add logging at all critical points
- Write tests alongside feature development
- Document API endpoints with OpenAPI/Swagger
- Set up CI/CD pipeline early
- Configure monitoring and alerting
- Plan for horizontal scaling from the start
- **Always prioritize user comfort and calmness in every interaction**

This implementation can be completed by a solo founder in 12-16 weeks, with the first functional prototype ready in 4 weeks for user testing.