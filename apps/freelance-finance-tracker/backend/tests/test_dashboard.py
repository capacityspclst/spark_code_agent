"""Integration tests for dashboard summary endpoint."""
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

def register_and_login(client, email, pwd):
    resp = client.post("/auth/register", json={"email": email, "password": pwd})
    assert resp.status_code == 201
    resp = client.post("/auth/login", json={"email": email, "password": pwd})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_dashboard_summary(client):
    headers = register_and_login(client, "dash@test.com", "Pwd12345")
    # create receipt
    png = b"\x89PNG\r\n\x1a\n"
    file_path = "rcp.png"
    with open(file_path, "wb") as f:
        f.write(png)
    with open(file_path, "rb") as f:
        files = {"file": ("rcp.png", f, "image/png")}
        data = {"amount": "100", "date": datetime.date.today().isoformat(), "vendor": "V", "category": "C"}
        resp = client.post("/receipts", data=data, files=files, headers=headers)
    os.remove(file_path)
    assert resp.status_code == 200
    # mileage
    mileage = {
        "date": datetime.date.today().isoformat(),
        "start_location": "A",
        "end_location": "B",
        "distance_miles": 10,
        "purpose": "test",
    }
    resp = client.post("/mileage", json=mileage, headers=headers)
    assert resp.status_code == 200
    # summary
    resp = client.get("/dashboard/summary", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_expenses"] == 100.0
    expected = 10 * 0.58
    assert abs(data["total_mileage_deduction"] - expected) < 0.01
