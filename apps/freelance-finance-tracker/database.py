"""Database setup using SQLAlchemy.
Provides engine, session factory, Base class, and a FastAPI dependency
that yields a session and ensures it's closed after each request.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import DATABASE_URL

# Detect SQLite to set appropriate connect args.
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

Base = declarative_base()

def get_db():
    """FastAPI dependency that provides a SQLAlchemy session.
    It yields a session and makes sure to close it after the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
