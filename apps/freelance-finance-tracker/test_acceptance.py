#!/usr/bin/env python3
"""
Acceptance tests for the Freelance Finance Tracker FastAPI backend.

The script sets up a temporary environment (SQLite DB, upload directory),
imports the FastAPI application, and runs a series of requests using
TestClient.  Any assertion failure prints a clear message with request
method, path, status code and response body, and exits with a non‑zero
code.  On success a short pass message is printed.
"""
import os
import sys
import tempfile
import shutil
import base64
import datetime
from fastapi.testclient import TestClient


def _assert_status(response, expected_status: int, method: str, path: str):
    """Assert that a response has the expected status code."""
    assert (
        response.status_code == expected_status
    ), f"{method} {path} returned {response.status_code}, body: {response.text}"


def main() -> None:
    # ----------------------------------------------------------------------
    # 1. Temporary environment (DB + upload dir)
    # ----------------------------------------------------------------------
    base_temp = tempfile.mkdtemp(prefix="freelance_tracker_test_")
    upload_dir = os.path.join(base_temp, "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    db_path = os.path.join(base_temp, "test.db")
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
    os.environ["JWT_SECRET"] = "testsecret"
    os.environ["JWT_ALGORITHM"] = "HS256"
    os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"
    os.environ["MILEAGE_RATE"] = "0.5"
    os.environ["UPLOAD_DIR"] = upload_dir
    os.environ["CORS_ORIGINS"] = ""  # No CORS needed for tests

    # Make the backend package importable
    backend_path = os.path.abspath(os.path.join(os.getcwd(), "backend"))
    sys.path.append(backend_path)

    try:
        # ------------------------------------------------------------------
        # 2. Import the FastAPI app after environment is prepared
        # ------------------------------------------------------------------
        from app.main import app  # noqa: E402
        from app.database import Base, engine  # noqa: E402

        # Ensure all tables exist (SQLAlchemy will use the SQLite file above)
        Base.metadata.create_all(bind=engine)

        client = TestClient(app)

        # ------------------------------------------------------------------
        # 3. Begin acceptance tests
        # ------------------------------------------------------------------
        # 3.1 Register a new user
        email = "test.user@example.com"
        password = "Testpass123!"
        resp = client.post(
            "/auth/register", json={"email": email, "password": password}
        )
        _assert_status(resp, 201, "POST", "/auth/register")

        # 3.2 Login to obtain JWT
        resp = client.post(
            "/auth/login", json={"email": email, "password": password}
        )
        _assert_status(resp, 200, "POST", "/auth/login")
        login_data = resp.json()
        assert (
            "access_token" in login_data
        ), f"POST /auth/login missing access_token, body: {resp.text}"
        token = login_data["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 3.3 Verify protected endpoint rejects unauthenticated request
        resp = client.get("/receipts")
        _assert_status(resp, 401, "GET", "/receipts")

        # 3.4 Ensure receipts list is initially empty
        resp = client.get("/receipts", headers=auth_headers)
        _assert_status(resp, 200, "GET", "/receipts")
        assert resp.json() == [], f"GET /receipts expected empty list, got {resp.json()}"

        # ------------------------------------------------------------------
        # 4. Upload a receipt (multipart/form-data with image)
        # ------------------------------------------------------------------
        png_base64 = (
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8"
            "/x8AAwMCAO7n4ScAAAAASUVORK5CYII="
        )
        png_bytes = base64.b64decode(png_base64)
        receipt_file_path = os.path.join(base_temp, "receipt.png")
        with open(receipt_file_path, "wb") as f:
            f.write(png_bytes)

        receipt_amount = 123.45
        receipt_date = datetime.date.today().isoformat()
        receipt_vendor = "Test Vendor"
        receipt_category = "Office Supplies"

        with open(receipt_file_path, "rb") as file_obj:
            files = {"file": ("receipt.png", file_obj, "image/png")}
            data = {
                "amount": str(receipt_amount),
                "date": receipt_date,
                "vendor": receipt_vendor,
                "category": receipt_category,
            }
            resp = client.post(
                "/receipts", data=data, files=files, headers=auth_headers
            )
        _assert_status(resp, 200, "POST", "/receipts")
        receipt_json = resp.json()
        receipt_id = receipt_json.get("id") or receipt_json.get("receipt_id")
        assert receipt_id is not None, f"POST /receipts missing receipt id, body: {resp.text}"

        # Verify receipt appears in list
        resp = client.get("/receipts", headers=auth_headers)
        _assert_status(resp, 200, "GET", "/receipts")
        receipts = resp.json()
        assert isinstance(receipts, list) and len(receipts) == 1, (
            f"GET /receipts expected 1 item, got {receipts}"
        )
        assert any(r.get("id") == receipt_id for r in receipts), (
            f"Receipt id {receipt_id} not found in GET /receipts response"
        )

        # Get single receipt
        resp = client.get(f"/receipts/{receipt_id}", headers=auth_headers)
        _assert_status(resp, 200, "GET", f"/receipts/{receipt_id}")
        single = resp.json()
        assert single.get("id") == receipt_id, (
            f"GET /receipts/{receipt_id} returned mismatched id, body: {resp.text}"
        )

        # Delete receipt
        resp = client.delete(f"/receipts/{receipt_id}", headers=auth_headers)
        _assert_status(resp, 200, "DELETE", f"/receipts/{receipt_id}")

        # Verify list is empty again
        resp = client.get("/receipts", headers=auth_headers)
        _assert_status(resp, 200, "GET", "/receipts")
        assert resp.json() == [], f"GET /receipts after delete expected empty list, got {resp.json()}"

        # ------------------------------------------------------------------
        # 5. Create mileage entries
        # ------------------------------------------------------------------
        mileage_entry_1 = {
            "date": receipt_date,
            "start_location": "Home",
            "end_location": "Client Office",
            "distance_miles": 10.0,
            "purpose": "Client Meeting",
        }
        resp = client.post("/mileage", json=mileage_entry_1, headers=auth_headers)
        _assert_status(resp, 200, "POST", "/mileage")
        mileage_json_1 = resp.json()
        mileage_id_1 = mileage_json_1.get("id") or mileage_json_1.get("mileage_id")
        assert mileage_id_1 is not None, f"POST /mileage missing id, body: {resp.text}"

        # Verify mileage list
        resp = client.get("/mileage", headers=auth_headers)
        _assert_status(resp, 200, "GET", "/mileage")
        mileage_list = resp.json()
        assert isinstance(mileage_list, list) and len(mileage_list) == 1, (
            f"GET /mileage expected 1 entry, got {mileage_list}"
        )
        assert any(m.get("id") == mileage_id_1 for m in mileage_list), (
            f"Mileage id {mileage_id_1} not found in GET /mileage response"
        )

        # ------------------------------------------------------------------
        # 6. Add additional data for dashboard summary
        # ------------------------------------------------------------------
        # Second receipt (will stay for the summary)
        receipt2_amount = 200.00
        receipt2_date = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
        receipt2_vendor = "Another Vendor"
        receipt2_category = "Travel"
        receipt2_path = os.path.join(base_temp, "receipt2.png")
        with open(receipt2_path, "wb") as f:
            f.write(png_bytes)

        with open(receipt2_path, "rb") as file_obj:
            files = {"file": ("receipt2.png", file_obj, "image/png")}
            data = {
                "amount": str(receipt2_amount),
                "date": receipt2_date,
                "vendor": receipt2_vendor,
                "category": receipt2_category,
            }
            resp = client.post(
                "/receipts", data=data, files=files, headers=auth_headers
            )
        _assert_status(resp, 200, "POST", "/receipts")
        receipt2_id = resp.json().get("id") or resp.json().get("receipt_id")
        assert receipt2_id is not None, f"Second receipt POST missing id, body: {resp.text}"

        # Second mileage entry
        mileage_entry_2 = {
            "date": receipt2_date,
            "start_location": "Office",
            "end_location": "Airport",
            "distance_miles": 20.0,
            "purpose": "Conference Travel",
        }
        resp = client.post("/mileage", json=mileage_entry_2, headers=auth_headers)
        _assert_status(resp, 200, "POST", "/mileage")
        mileage_id_2 = resp.json().get("id") or resp.json().get("mileage_id")
        assert mileage_id_2 is not None, f"Second mileage POST missing id, body: {resp.text}"

        # ------------------------------------------------------------------
        # 7. Dashboard summary
        # ------------------------------------------------------------------
        resp = client.get("/dashboard/summary", headers=auth_headers)
        _assert_status(resp, 200, "GET", "/dashboard/summary")
        summary = resp.json()

        # Expected totals
        expected_total_expenses = receipt2_amount  # only the second receipt remains
        mileage_rate = float(os.getenv("MILEAGE_RATE", "0"))
        expected_mileage_deduction = (
            mileage_entry_1["distance_miles"] + mileage_entry_2["distance_miles"]
        ) * mileage_rate

        # Allow a tolerance of 0.01 for floating point rounding
        assert abs(
            summary.get("total_expenses", 0) - expected_total_expenses
        ) < 0.01, (
            f"Dashboard summary total_expenses mismatch: expected {expected_total_expenses}, "
            f"got {summary.get('total_expenses')}"
        )
        assert abs(
            summary.get("total_mileage_deduction", 0) - expected_mileage_deduction
        ) < 0.01, (
            f"Dashboard summary mileage deduction mismatch: expected {expected_mileage_deduction}, "
            f"got {summary.get('total_mileage_deduction')}"
        )
        assert "per_month" in summary, (
            f"Dashboard summary missing per_month field, body: {summary}"
        )

        # ------------------------------------------------------------------
        # 8. Export PDF
        # ------------------------------------------------------------------
        resp = client.get("/export/pdf", headers=auth_headers)
        _assert_status(resp, 200, "GET", "/export/pdf")
        pdf_ct = resp.headers.get("content-type", "")
        assert "application/pdf" in pdf_ct, f"/export/pdf content-type not PDF, got {pdf_ct}"
        assert len(resp.content) > 0, "/export/pdf returned empty body"

        # ------------------------------------------------------------------
        # 9. Export CSV
        # ------------------------------------------------------------------
        resp = client.get("/export/csv", headers=auth_headers)
        _assert_status(resp, 200, "GET", "/export/csv")
        csv_ct = resp.headers.get("content-type", "")
        assert "text/csv" in csv_ct, f"/export/csv content-type not CSV, got {csv_ct}"
        csv_text = resp.content.decode("utf-8")
        assert "\n" in csv_text, "/export/csv response does not contain newline"
        # Simple sanity checks for presence of data
        assert (
            str(receipt2_amount) in csv_text or str(receipt_amount) in csv_text
        ), "/export/csv missing receipt amounts"
        assert (
            str(mileage_entry_2["distance_miles"]) in csv_text
            or str(mileage_entry_1["distance_miles"]) in csv_text
        ), "/export/csv missing mileage distances"

        # ------------------------------------------------------------------
        # 10. All tests passed
        # ------------------------------------------------------------------
        print("PASS: All acceptance tests passed")

    except AssertionError as e:
        print(f"FAIL: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: Unexpected exception: {e}")
        sys.exit(1)
    finally:
        # Clean up temporary files and directories
        shutil.rmtree(base_temp, ignore_errors=True)


if __name__ == "__main__":
    main()
