"""Integration tests for mileage routes."""
import os, sys, datetime
from fastapi.testclient import TestClient

backend_path = os.path.abspath(os.path.join(os.getcwd(), "backend"))
sys.path.append(backend_path)

from app.main import app
from app.database import Base, engine

import pytest

@pytest.fixture(scope="module", autouse=True)
def setup_db(tmp_path_factory):
    db_file = tmp_path_factory.mktemp("db") / "test.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{db_file}"
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def client():
    return TestClient(app)

def register_and_get_headers(client, email, pwd):
    resp = client.post("/auth/register", json={"email": email, "password": pwd})
    assert resp.status_code == 201
    resp = client.post("/auth/login", json={"email": email, "password": pwd})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_mileage_crud(client):
    headers = register_and_get_headers(client, "mile@test.com", "Pwd12345")
    entry = {
        "date": datetime.date.today().isoformat(),
        "start_location": "A",
        "end_location": "B",
        "distance_miles": 15.5,
        "purpose": "Test",
    }
    resp = client.post("/mileage", json=entry, headers=headers)
    assert resp.status_code == 200
    mid = resp.json()["id"]
    # list
    resp = client.get("/mileage", headers=headers)
    assert resp.status_code == 200
    assert any(m["id"] == mid for m in resp.json())
