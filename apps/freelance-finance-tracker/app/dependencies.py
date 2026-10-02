"""Dependency injection utilities for FastAPI app."""
import os
from functools import lru_cache
from typing import List

from pydantic import BaseSettings
# fallback: if pydantic_settings not available, we use pydantic BaseSettings
# Already imported from pydantic directly.

from sqlmodel import Session, create_engine

class Settings(BaseSettings):
    jwt_secret: str = os.getenv("JWT_SECRET", "test-secret")
    token_expire_minutes: int = 30
    database_url: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
    upload_root: str = os.getenv("UPLOAD_ROOT", "./uploads")
    # CORS origins; default empty list
    allowed_origins: List[str] = []

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()

def get_engine(settings: Settings = None):
    if settings is None:
        settings = get_settings()
    if settings.database_url.startswith("sqlite"):
        return create_engine(settings.database_url, connect_args={"check_same_thread": False})
    return create_engine(settings.database_url)

def get_session(engine = None) -> Session:
    if engine is None:
        engine = get_engine()
    # Direct Session instance (no context manager)
    return Session(engine)
