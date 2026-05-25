from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "StudyWallet API"
    VERSION: str = "1.0.0"

    PRODUCTION: bool = False
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_ECHO: bool = False

    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_ANON_KEY: str
    SUPABASE_STORAGE_BUCKET: str = "study-pdfs"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440
    JWT_REFRESH_EXPIRATION_MINUTES: int = 43200

    MIN_PASSWORD_LENGTH: int = 8

    MAX_UPLOAD_SIZE: int = 20 * 1024 * 1024
    ALLOWED_CONTENT_TYPES: list[str] = ["application/pdf"]

    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    RATE_LIMIT_DEFAULT: str = "100/hour"
    RATE_LIMIT_AUTH: str = "10/minute"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
