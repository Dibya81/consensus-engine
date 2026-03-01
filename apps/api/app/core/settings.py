from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Consensus Engine API"
    APP_VERSION: str = "0.1.0"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost"
    
    # DB (Supabase/Postgres connection string, fallback to sqlite locally)
    DATABASE_URL: str = "sqlite+aiosqlite:///consensus.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Firebase
    FIREBASE_CREDENTIALS: str = "" # Base64 encoded JSON service account key
    FIREBASE_PROJECT_ID: str = ""
    
    # External AWS APIs (Aurora Chat Storage)
    EXTERNAL_AURORA_API_URL: str = "https://mock-aurora.internal/api"
    EXTERNAL_AURORA_API_KEY: str = "mock-aurora-key"
    
    # AWS Bedrock Core Setup
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
