"""Integration tests for export routes (PDF and CSV)."""
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

def test_export_pdf_and_csv(client):
    headers = register_and_get_headers(client, "exp@test.com", "Pwd12345")
    # add a receipt to have data
    png = b"\x89PNG\r\n\x1a\n"
    file_path = "exp.png"
    with open(file_path, "wb") as f:
        f.write(png)
    with open(file_path, "rb") as f:
        files = {"file": ("exp.png", f, "image/png")}
        data = {"amount": "50", "date": datetime.date.today().isoformat(), "vendor": "V", "category": "C"}
        client.post("/receipts", data=data, files=files, headers=headers)
    os.remove(file_path)
    # PDF
    resp = client.get("/export/pdf", headers=headers)
    assert resp.status_code == 200
    assert "application/pdf" in resp.headers.get("content-type","")
    # CSV
    resp = client.get("/export/csv", headers=headers)
    assert resp.status_code == 200
    assert "text/csv" in resp.headers.get("content-type","")
    assert resp.content, "CSV body empty"
