"""Configuration settings using pydantic-settings."""

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./test.db"
    JWT_SECRET_KEY: str = "change_me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # default 1 hour

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
