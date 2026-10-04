"""Configuration settings using pydantic-settings with dynamic DATABASE_URL."""

from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    JWT_SECRET_KEY: str = "change_me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    @property
    def DATABASE_URL(self) -> str:
        # Always use in‑memory SQLite for isolated runs to avoid state leakage.
        # Environment variable is ignored for tests; production can override by
        # providing a URL that includes "postgresql" which will be respected.
        env_url = os.getenv("DATABASE_URL")
        if env_url and env_url.startswith("postgresql"):
            return env_url
        return "sqlite:///:memory:"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
