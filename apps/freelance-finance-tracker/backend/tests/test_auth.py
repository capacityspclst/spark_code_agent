"""Basic auth tests for registration and login."""
import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend is on path
backend_path = os.path.abspath(os.path.join(os.getcwd(), "backend"))
sys.path.append(backend_path)

from app.main import app
from app.database import Base, engine

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables after tests
    Base.metadata.drop_all(bind=engine)

def test_register_and_login():
    client = TestClient(app)
    email = "unit@test.com"
    pwd = "Password123"
    # Register
    resp = client.post("/auth/register", json={"email": email, "password": pwd})
    assert resp.status_code == 201
    # Login
    resp = client.post("/auth/login", json={"email": email, "password": pwd})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
