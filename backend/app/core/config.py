from pydantic_settings import BaseSettings
from typing import List
import os

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
    OPENAI_API_KEY: str = ""
    
    # Analytics
    MIXPANEL_TOKEN: str = ""
    SENTRY_DSN: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()