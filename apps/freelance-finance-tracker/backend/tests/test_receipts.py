"""Integration tests for receipt routes."""
import os, sys, datetime, base64
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

def register_user(client, email, pwd):
    resp = client.post("/auth/register", json={"email": email, "password": pwd})
    assert resp.status_code == 201
    resp = client.post("/auth/login", json={"email": email, "password": pwd})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_receipt_crud(client):
    headers = register_user(client, "rcp@test.com", "Pwd12345")
    png = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7n4ScAAAAASUVORK5CYII="
    )
    file_path = "receipt_test.png"
    with open(file_path, "wb") as f:
        f.write(png)
    with open(file_path, "rb") as f:
        files = {"file": ("receipt_test.png", f, "image/png")}
        data = {"amount": "10.0", "date": datetime.date.today().isoformat(), "vendor": "V", "category": "C"}
        resp = client.post("/receipts", data=data, files=files, headers=headers)
    os.remove(file_path)
    assert resp.status_code == 200
    receipt_id = resp.json()["id"]
    resp = client.get("/receipts", headers=headers)
    assert resp.status_code == 200
    assert any(r["id"] == receipt_id for r in resp.json())
    resp = client.get(f"/receipts/{receipt_id}", headers=headers)
    assert resp.status_code == 200
    resp = client.delete(f"/receipts/{receipt_id}", headers=headers)
    assert resp.status_code == 200
    resp = client.get("/receipts", headers=headers)
    assert resp.status_code == 200
    assert all(r["id"] != receipt_id for r in resp.json())
