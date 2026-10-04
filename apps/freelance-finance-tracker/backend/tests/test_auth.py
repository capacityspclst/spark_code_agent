"""Tests for authentication endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db(tmp_path, monkeypatch):
    # Use a temporary SQLite DB for each test
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    # Recreate tables
    from backend.app import database, models
    # dispose existing engine if any
    try:
        database.engine.dispose()
    except Exception:
        pass
    # recreate engine with new URL
    database.engine = database.create_engine(database.settings.DATABASE_URL, connect_args={"check_same_thread": False})
    models.Base.metadata.create_all(bind=database.engine)
    yield

def test_register_success():
    resp = client.post(
        "/register",
        json={"email": "user@example.com", "password": "StrongPass123!", "confirm_password": "StrongPass123!"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "user@example.com"
    assert "id" in data

def test_register_password_mismatch():
    resp = client.post(
        "/register",
        json={"email": "user2@example.com", "password": "StrongPass123!", "confirm_password": "WrongPass123!"},
    )
    assert resp.status_code == 422  # validation error from Pydantic

def test_register_weak_password():
    resp = client.post(
        "/register",
        json={"email": "weak@example.com", "password": "short", "confirm_password": "short"},
    )
    assert resp.status_code == 422

def test_login_and_protected_endpoint():
    # Register first
    client.post(
        "/register",
        json={"email": "login@example.com", "password": "StrongPass123!", "confirm_password": "StrongPass123!"},
    )
    # Login
    resp = client.post(
        "/login",
        data={"username": "login@example.com", "password": "StrongPass123!"},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    # Access protected route
    resp2 = client.get("/transactions", headers={"Authorization": f"Bearer {token}"})
    assert resp2.status_code == 200
    assert resp2.json() == []
