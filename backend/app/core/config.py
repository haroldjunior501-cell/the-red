from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "THE RED Backend API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql+psycopg://thered:thered@localhost:5432/thered_db"
    
    # Security
    JWT_SECRET_KEY: str = "the_red_dev_secret_key_manchester_united_1878"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    INTERNAL_API_KEY: str = "internal-secret-key"
    
    # External APIs
    FOOTBALL_API_KEY: Optional[str] = None
    NEWS_API_KEY: Optional[str] = None
    
    # Environment
    ENVIRONMENT: str = "development"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
