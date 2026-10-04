"""Application configuration using pydantic BaseSettings.
Environment variables can be loaded from a .env file.
"""
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="sqlite:///./test.db", env="DATABASE_URL")
    JWT_SECRET: str = Field(default="supersecret", env="JWT_SECRET")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    MILEAGE_RATE: float = Field(default=0.58, env="MILEAGE_RATE")
    UPLOAD_DIR: str = Field(default="uploads", env="UPLOAD_DIR")
    # Default to localhost for security; can be comma‑separated list of origins.
    CORS_ORIGINS: str = Field(default="http://localhost", env="CORS_ORIGINS")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
