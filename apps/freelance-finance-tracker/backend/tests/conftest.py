"""Pytest fixtures for FastAPI backend tests."""

import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set test database URL before importing the app
TEST_DB_URL = "sqlite:///./test.db"
os.environ["DATABASE_URL"] = TEST_DB_URL

# Now import app and database modules
from backend.app.main import app
from backend.app import models, database

# Create a new engine and session for tests
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Recreate tables before each test session
models.Base.metadata.create_all(bind=engine)

# Dependency override for get_db
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[database.get_db] = override_get_db

@pytest.fixture(scope="session")
def client():
    from fastapi.testclient import TestClient
    with TestClient(app) as c:
        yield c
