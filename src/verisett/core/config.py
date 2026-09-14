"""
Application configuration for Verisett AI Gateway.
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    APP_NAME: str = "Verisett AI Gateway"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Database Configuration
    # Supports PostgreSQL (asyncpg) or SQLite (aiosqlite)
    DATABASE_URL: str = "sqlite+aiosqlite:///./verisett.db"
    DATABASE_ECHO: bool = False

    # Financial / Escrow Configuration
    PLATFORM_FEE_RATE: float = 0.015  # 1.5% take-rate
    PLATFORM_REVENUE_ACCOUNT_ID: str = "00000000-0000-0000-0000-000000000001"
    PLATFORM_REVENUE_ACCOUNT_NAME: str = "Verisett Treasury & Revenue"

    # Contract Defaults
    DEFAULT_TIMEOUT_SECONDS: int = 300
    EXPIRY_WORKER_INTERVAL_SECONDS: int = 5

    # Security
    API_KEY_SALT: str = "verisett_secure_salt_ai_escrow"


settings = Settings()
