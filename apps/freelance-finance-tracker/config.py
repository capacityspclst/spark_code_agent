"""Configuration module reads environment variables with defaults.
It provides values used across the application such as the secret key,
algorithm, token expiry, and database URL.
"""
import os
from datetime import timedelta

# Secret key for JWT signing – should be strong in production.
SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")

# JWT algorithm.
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")

# Token expiry in minutes.
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Database URL – defaults to a local SQLite file.
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")

def get_access_token_expires() -> timedelta:
    """Return a timedelta representing token expiry duration."""
    return timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
