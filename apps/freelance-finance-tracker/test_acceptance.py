#!/usr/bin/env python3
"""
Acceptance tests for the freelance finance tracker backend.

The tests cover:
- User sign‑up and login (JWT token issuance)
- Receipt upload (multipart/form‑data) and retrieval
- Mileage entry creation and retrieval
- Dashboard summary calculations
- CSV and PDF export endpoints

All requests are exercised with FastAPI's TestClient against an in‑memory
SQLite database. Temporary files/directories are cleaned up after the run.
"""

import os
import sys
import io
import csv
import shutil
import tempfile
from typing import Any, Dict, Tuple

# ----------------------------------------------------------------------
# Environment setup before importing the FastAPI app
# ----------------------------------------------------------------------
tmp_dir = tempfile.mkdtemp()
media_root = os.path.join(tmp_dir, "media")
os.makedirs(media_root, exist_ok=True)

# Use a file‑based SQLite DB so that multiple connections share the same DB.
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(tmp_dir, 'test.db')}"
os.environ["JWT_SECRET_KEY"] = "testsecret"
os.environ["MEDIA_ROOT"] = media_root
# Front‑end origin is not relevant for the tests but the app reads it.
os.environ["FRONTEND_ORIGIN"] = "http://localhost:19006"

# ----------------------------------------------------------------------
# Import the FastAPI app (must happen after env vars are set)
# ----------------------------------------------------------------------
try:
    from backend.app.main import app  # type: ignore
except Exception as exc:
    print(f"ERROR: Unable to import FastAPI app: {exc}")
    sys.exit(1)

from fastapi.testclient import TestClient

client = TestClient(app)


# ----------------------------------------------------------------------
# Helper assertion utilities
# ----------------------------------------------------------------------
def assert_status(
    response, expected_range: tuple[int, int], method: str, path: str
) -> None:
    """Assert that response.status_code is within expected_range."""
    low, high = expected_range
    if not (low <= response.status_code < high):
        raise AssertionError(
            f"{method} {path}: expected status {low}-{high-1} "
            f"but got {response.status_code}. Body: {response.text}"
        )


def get_mileage_and_tax_rates(auth_token: str) -> Tuple[float, float]:
    """
    Retrieve mileage and tax rates from the API if an endpoint exists.
    Falls back to default values (0.585 mileage_rate, 0.30 tax_rate) if not found.
    """
    headers = {"Authorization": f"Bearer {auth_token}"}
    # Potential endpoints that might expose the rates.
    for endpoint in ("/rates", "/settings", "/config"):
        resp = client.get(endpoint, headers=headers)
        if resp.status_code == 200:
            try:
                data = resp.json()
                mileage_rate = float(data.get("mileage_rate", 0.585))
                tax_rate = float(data.get("tax_rate", 0.30))
                return mileage_rate, tax_rate
            except Exception:
                continue
    # No dedicated endpoint – use known defaults.
    return 0.585, 0.30


# ----------------------------------------------------------------------
# Individual test steps
# ----------------------------------------------------------------------
def test_signup_and_login() -> str:
    email = "test.user@example.com"
    password = "Testpass123!A"  # 13 characters, meets complexity rules

    # --- Sign‑up -------------------------------------------------------
    resp = client.post("/auth/signup", json={"email": email, "password": password})
    assert_status(resp, (200, 300), "POST", "/auth/signup")
    data = resp.json()
    token = data.get("access_token") or data.get("token")
    if not isinstance(token, str):
        raise AssertionError(
            f"POST /auth/signup: token missing or not a string in response {data}"
        )
    if token.count(".") != 2:
        raise AssertionError(f"POST /auth/signup: token does not look like a JWT: {token}")

    # --- Login ---------------------------------------------------------
    resp = client.post("/auth/login", json={"email": email, "password": password})
    assert_status(resp, (200, 300), "POST", "/auth/login")
    data = resp.json()
    token = data.get("access_token") or data.get("token")
    if not isinstance(token, str):
        raise AssertionError(
            f"POST /auth/login: token missing or not a string in response {data}"
        )
    if token.count(".") != 2:
        raise AssertionError(f"POST /auth/login: token does not look like a JWT: {token}")

    # --- Invalid login -------------------------------------------------
    resp = client.post(
        "/auth/login", json={"email": email, "password": "WrongPass123!"}
    )
    if resp.status_code != 401:
        raise AssertionError(
            f"POST /auth/login (invalid pw): expected 401 but got "
            f"{resp.status_code}. Body: {resp.text}"
        )

    return token


def test_receipt_flow(auth_token: str) -> Dict[str, Any]:
    # Minimal 1x1 PNG (valid image data)
    png_bytes = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\nIDAT\x08\xd7c`\x00\x00"
        b"\x00\x02\x00\x01\xe2!\xbc3\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    files = {
        "image": ("receipt.png", io.BytesIO(png_bytes), "image/png")
    }
    data = {
        "amount": "123.45",
        "date": "2023-06-01",
        "category": "Office Supplies",
        "notes": "Test receipt",
        # "type": "expense"  # optional – default is expense
    }
    headers = {"Authorization": f"Bearer {auth_token}"}
    resp = client.post(
        "/receipts", data=data, files=files, headers=headers
    )
    assert_status(resp, (200, 300), "POST", "/receipts")
    receipt = resp.json()
    if receipt.get("id") is None:
        raise AssertionError(
            f"POST /receipts: missing 'id' in response {receipt}"
        )
    if float(receipt.get("amount", 0)) != 123.45:
        raise AssertionError(
            f"POST /receipts: amount mismatch, expected 123.45 got {receipt.get('amount')}"
        )
    # Ensure the receipt is treated as an expense (default)
    if "type" in receipt and receipt["type"] != "expense":
        raise AssertionError(
            f"POST /receipts: expected type 'expense', got {receipt.get('type')}"
        )

    # --- Retrieve receipts list -----------------------------------------
    resp = client.get("/receipts", headers=headers)
    assert_status(resp, (200, 300), "GET", "/receipts")
    lst = resp.json()
    if not isinstance(lst, list) or not lst:
        raise AssertionError(f"GET /receipts: expected non‑empty list, got {lst}")
    if not any(item.get("id") == receipt["id"] for item in lst):
        raise AssertionError(
            f"GET /receipts: created receipt id {receipt['id']} not found in list {lst}"
        )
    return receipt


def test_mileage_flow(auth_token: str) -> Dict[str, Any]:
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {"date": "2023-06-02", "miles": 150, "notes": "Client meeting"}
    resp = client.post("/mileage", json=payload, headers=headers)
    assert_status(resp, (200, 300), "POST", "/mileage")
    mileage = resp.json()
    if mileage.get("id") is None:
        raise AssertionError(
            f"POST /mileage: missing 'id' in response {mileage}"
        )
    if mileage.get("miles") != 150:
        raise AssertionError(
            f"POST /mileage: miles mismatch, expected 150 got {mileage.get('miles')}"
        )

    # --- Retrieve mileage list ------------------------------------------
    resp = client.get("/mileage", headers=headers)
    assert_status(resp, (200, 300), "GET", "/mileage")
    lst = resp.json()
    if not isinstance(lst, list) or not any(item.get("id") == mileage["id"] for item in lst):
        raise AssertionError(
            f"GET /mileage: created entry not found in list {lst}"
        )
    return mileage


def test_dashboard_and_exports(
    auth_token: str, receipt_amount: float, mileage_miles: int
) -> None:
    headers = {"Authorization": f"Bearer {auth_token}"}

    # Retrieve dynamic rates (mileage and tax) from the API if possible.
    mileage_rate, tax_rate = get_mileage_and_tax_rates(auth_token)

    # --- Dashboard -------------------------------------------------------
    resp = client.get("/dashboard", headers=headers)
    assert_status(resp, (200, 300), "GET", "/dashboard")
    summary = resp.json()

    # Expected calculations (rounded to 2 decimals as backend likely does)
    expected_income = 0.0
    expected_expenses = receipt_amount
    expected_mileage_deduction = round(mileage_miles * mileage_rate, 2)
    taxable_profit = expected_income - expected_expenses - expected_mileage_deduction
    expected_estimated_tax = round(max(0.0, taxable_profit * tax_rate), 2)

    def close(a: float, b: float, eps: float = 0.01) -> bool:
        return abs(a - b) < eps

    if not close(float(summary.get("income", 0)), expected_income):
        raise AssertionError(
            f"Dashboard income mismatch: expected {expected_income}, got {summary.get('income')}"
        )
    if not close(float(summary.get("expenses", 0)), expected_expenses):
        raise AssertionError(
            f"Dashboard expenses mismatch: expected {expected_expenses}, got {summary.get('expenses')}"
        )
    if not close(float(summary.get("mileage_deduction", 0)), expected_mileage_deduction):
        raise AssertionError(
            f"Dashboard mileage_deduction mismatch: expected {expected_mileage_deduction}, got {summary.get('mileage_deduction')}"
        )
    if not close(float(summary.get("estimated_tax", 0)), expected_estimated_tax):
        raise AssertionError(
            f"Dashboard estimated_tax mismatch: expected {expected_estimated_tax}, got {summary.get('estimated_tax')}"
        )

    # --- CSV export ------------------------------------------------------
    resp = client.get("/export/csv", headers=headers)
    assert_status(resp, (200, 300), "GET", "/export/csv")
    ct = resp.headers.get("content-type", "")
    if "text/csv" not in ct:
        raise AssertionError(f"GET /export/csv: unexpected Content-Type {ct}")
    cd = resp.headers.get("content-disposition", "")
    if not ("attachment" in cd or "filename" in cd):
        raise AssertionError(
            f"GET /export/csv: missing or malformed Content-Disposition header: {cd}"
        )
    csv_text = resp.text.strip()
    rows = list(csv.reader(io.StringIO(csv_text)))
    if len(rows) < 2:
        raise AssertionError(f"GET /export/csv: expected at least header + one row, got {len(rows)} rows")
    # Simple sanity: first column of the first data row should contain the receipt amount
    if not any(str(receipt_amount) in cell for cell in rows[1]):
        raise AssertionError(
            f"GET /export/csv: receipt amount {receipt_amount} not found in CSV rows: {rows}"
        )

    # --- PDF export ------------------------------------------------------
    resp = client.get("/export/pdf", headers=headers)
    assert_status(resp, (200, 300), "GET", "/export/pdf")
    ct = resp.headers.get("content-type", "")
    if "application/pdf" not in ct:
        raise AssertionError(f"GET /export/pdf: unexpected Content-Type {ct}")
    cd = resp.headers.get("content-disposition", "")
    if not ("attachment" in cd or "filename" in cd):
        raise AssertionError(
            f"GET /export/pdf: missing or malformed Content-Disposition header: {cd}"
        )
    pdf_bytes = resp.content
    if len(pdf_bytes) < 100:
        raise AssertionError(
            f"GET /export/pdf: PDF payload too short ({len(pdf_bytes)} bytes)"
        )


# ----------------------------------------------------------------------
# Test runner
# ----------------------------------------------------------------------
def main() -> None:
    try:
        token = test_signup_and_login()
        receipt = test_receipt_flow(token)
        mileage = test_mileage_flow(token)
        test_dashboard_and_exports(
            token,
            receipt_amount=float(receipt["amount"]),
            mileage_miles=int(mileage["miles"]),
        )
    except AssertionError as err:
        print(f"FAIL: {err}")
        sys.exit(1)
    except Exception as exc:
        print(f"ERROR during tests: {exc}")
        sys.exit(1)
    finally:
        # Clean up temporary DB & media directory
        try:
            shutil.rmtree(tmp_dir)
        except Exception:
            pass

    print("ALL TESTS PASSED")
    sys.exit(0)


if __name__ == "__main__":
    main()
