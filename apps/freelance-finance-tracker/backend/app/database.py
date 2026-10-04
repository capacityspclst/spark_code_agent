"""Database session handling for FastAPI app with a lazily initialized engine based on dynamic DATABASE_URL."""

from sqlalchemy import create_engine as _create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

Base = declarative_base()

_engine = None  # type: ignore

def get_engine():
    """Create (or retrieve) a singleton SQLAlchemy engine using the current DATABASE_URL.
    The engine is created on first call, after the environment variable may have been set.
    """
    global _engine
    if _engine is None:
        url = settings.DATABASE_URL
        connect_args = {"check_same_thread": False} if "sqlite" in url else {}
        _engine = _create_engine(url, connect_args=connect_args)
        # Ensure tables exist
        Base.metadata.create_all(bind=_engine)
    return _engine

def get_db():
    """FastAPI dependency that provides a DB session using the lazy engine."""
    engine = get_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
