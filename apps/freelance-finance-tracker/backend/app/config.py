"""Configuration settings using pydantic-settings with dynamic DATABASE_URL."""

from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    JWT_SECRET_KEY: str = "change_me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    @property
    def DATABASE_URL(self) -> str:
        # Dynamically read from environment, default to local SQLite file
        return os.getenv("DATABASE_URL", "sqlite:///./test.db")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
