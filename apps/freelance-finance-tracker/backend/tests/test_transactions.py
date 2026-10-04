"""Integration tests for transaction CRUD endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    from backend.app import database, models
    try:
        database.engine.dispose()
    except Exception:
        pass
    database.engine = database.create_engine(database.settings.DATABASE_URL, connect_args={"check_same_thread": False})
    models.Base.metadata.create_all(bind=database.engine)
    yield

def register_and_login(email: str, password: str) -> str:
    client.post(
        "/register",
        json={"email": email, "password": password, "confirm_password": password},
    )
    resp = client.post(
        "/login",
        data={"username": email, "password": password},
    )
    assert resp.status_code == 200
    return resp.json()["access_token"]

def test_transaction_crud_flow():
    token = register_and_login("txnuser@example.com", "StrongPass123!")
    headers = {"Authorization": f"Bearer {token}"}

    # Create transaction
    txn_data = {
        "amount": 100.5,
        "description": "Test txn",
        "date": "2023-01-01T00:00:00",
    }
    resp = client.post("/transactions", json=txn_data, headers=headers)
    assert resp.status_code in (200, 201)
    created = resp.json()
    txn_id = created["id"]

    # Read list
    resp = client.get("/transactions", headers=headers)
    assert resp.status_code == 200
    lst = resp.json()
    assert any(t["id"] == txn_id for t in lst)

    # Update
    upd = {"amount": 200.0, "description": "Updated", "date": "2023-02-02T00:00:00"}
    resp = client.put(f"/transactions/{txn_id}", json=upd, headers=headers)
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["amount"] == 200.0
    assert updated["description"] == "Updated"

    # Delete
    resp = client.delete(f"/transactions/{txn_id}", headers=headers)
    assert resp.status_code in (200, 204)
    # Ensure gone
    resp = client.get("/transactions", headers=headers)
    assert resp.status_code == 200
    assert not any(t["id"] == txn_id for t in resp.json())
