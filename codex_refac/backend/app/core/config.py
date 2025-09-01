from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "BudGuide"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    
    # Database (safe dev defaults)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")]
    
    # ML Models
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    NLP_MODEL: str = "en_core_web_sm"
    
    # External APIs
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    # Analytics
    MIXPANEL_TOKEN: str = ""
    SENTRY_DSN: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
