from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from app.api.v1 import products, chat, health, sage

# Initialize ML models on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 BudGuide backend starting up...")
    
    # Initialize NLP engine (optional for demo)
    try:
        from app.ml.nlp_engine import NLPEngine
        app.state.nlp_engine = NLPEngine()
        print("✅ NLP Engine initialized")
    except Exception as e:
        print(f"⚠️  NLP Engine not available (missing dependencies): {e}")
        app.state.nlp_engine = None
    
    yield
    
    # Shutdown
    print("👋 BudGuide backend shutting down...")

app = FastAPI(
    title="BudGuide API",
    description="Digital Budtender for Hemp/CBD Product Discovery",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily allow all origins for debugging
    allow_credentials=False,  # Must be False when using allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic health check endpoint
@app.get("/")
async def root():
    return {
        "message": "🌿 BudGuide Digital Budtender API",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z"
    }

# Include routers
app.include_router(health.router, prefix="/api/v1/health", tags=["health"])
app.include_router(products.router, prefix="/api/v1/products", tags=["products"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(sage.router, prefix="/api/v1/sage", tags=["sage"])

if __name__ == "__main__":
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=5001,
        reload=True
    )