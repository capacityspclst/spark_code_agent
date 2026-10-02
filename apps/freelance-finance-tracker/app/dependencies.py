"""Dependency injection utilities for FastAPI app."""
import os
from functools import lru_cache
from typing import Generator, List

from pydantic_settings import BaseSettings
from sqlmodel import Session, create_engine, SQLModel

class Settings(BaseSettings):
    jwt_secret: str = os.getenv("JWT_SECRET", "test-secret")
    token_expire_minutes: int = 30
    database_url: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
    upload_root: str = os.getenv("UPLOAD_ROOT", "./uploads")
    allowed_origins: List[str] = []  # expects comma-separated env not needed here

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()

def get_engine(settings: Settings = None):
    if settings is None:
        settings = get_settings()
    # Use sync engine for tests and simplicity
    if settings.database_url.startswith("sqlite"):
        return create_engine(settings.database_url, connect_args={"check_same_thread": False})
    return create_engine(settings.database_url)

def get_session(engine = None) -> Generator[Session, None, None]:
    if engine is None:
        engine = get_engine()
    with Session(engine) as session:
        yield session
