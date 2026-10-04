"""Database session handling for FastAPI app."""

from sqlalchemy import create_engine as _create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

def create_engine(url: str, **kwargs):
    """Helper to create a new SQLAlchemy engine. Used by tests to override DB URL."""
    return _create_engine(url, **kwargs)

# Default engine for the application
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
