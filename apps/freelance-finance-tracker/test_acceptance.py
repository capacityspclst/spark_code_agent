#!/usr/bin/env python3
"""
Acceptance tests for the freelance finance tracker application.

These tests exercise the FastAPI backend end‑to‑end:
* User registration and JWT authentication
* Protected routes (receipt upload, mileage entry, dashboard summary)
* Export of data as CSV and PDF
* Validation and error handling

The script uses only the Python standard library and FastAPI's TestClient.
It exits with a non‑zero status code if any test fails and prints a short
summary at the end.
"""

import os
import sys
import time
import json
import unittest
import csv
from io import BytesIO

# ----------------------------------------------------------------------
# Test configuration – use a temporary SQLite DB and a static secret key.
# The backend should read these environment variables on import.
# ----------------------------------------------------------------------
os.environ["DATABASE_URL"] = "sqlite:///./test_acceptance.db"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["ALGORITHM"] = "HS256"
# Optional: token expiry (minutes). Use a short period – not critical here.
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "60")

# ----------------------------------------------------------------------
# Import the FastAPI application after the environment is set up.
# ----------------------------------------------------------------------
try:
    from backend.app.main import app  # Adjust import path if necessary
except Exception as exc:
    sys.stderr.write(f"Failed to import FastAPI app: {exc}\n")
    sys.exit(1)

from fastapi.testclient import TestClient

# ----------------------------------------------------------------------
# Helper utilities
# ----------------------------------------------------------------------
def auth_header(token: str) -> dict:
    """Return the Authorization header dictionary for a JWT token."""
    return {"Authorization": f"Bearer {token}"}


# ----------------------------------------------------------------------
# Acceptance test suite
# ----------------------------------------------------------------------
class AcceptanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Create a TestClient that will be reused across all tests."""
        cls.client = TestClient(app)
        # Use a unique email address per test run to avoid collisions.
        cls.email = f"test_user_{int(time.time())}@example.com"
        cls.password = "SuperSecretPassword123!"
        cls.token = None          # JWT token after login
        cls.receipt_id = None     # ID of the uploaded receipt
        cls.mileage_id = None     # ID of the created mileage entry

    @classmethod
    def tearDownClass(cls):
        """Clean up the temporary SQLite database file."""
        db_path = "./test_acceptance.db"
        if os.path.exists(db_path):
            try:
                os.remove(db_path)
            except Exception as exc:
                sys.stderr.write(f"Failed to delete test DB '{db_path}': {exc}\n")

    # ------------------------------------------------------------------
    # 1. Registration
    # ------------------------------------------------------------------
    def test_01_register_user(self):
        payload = {
            "email": self.email,
            "password": self.password,
            "full_name": "Test User"
        }
        response = self.client.post("/auth/register", json=payload)
        self.assertEqual(
            response.status_code, 200,
            f"Registration failed: {response.status_code} {response.text}"
        )
        # Some APIs may return the created user; we just ensure success.

    # ------------------------------------------------------------------
    # 2. Login – obtain JWT token
    # ------------------------------------------------------------------
    def test_02_login_user(self):
        payload = {"email": self.email, "password": self.password}
        response = self.client.post("/auth/login", json=payload)
        self.assertEqual(
            response.status_code, 200,
            f"Login failed: {response.status_code} {response.text}"
        )
        data = response.json()
        self.assertIn("access_token", data, "Login response missing access_token")
        self.__class__.token = data["access_token"]
        # Ensure token looks like a JWT (three dot‑separated parts)
        parts = self.token.split(".")
        self.assertEqual(len(parts), 3, "Access token does not appear to be a JWT")

    # ------------------------------------------------------------------
    # 3. Access protected route without auth – should be 401
    # ------------------------------------------------------------------
    def test_03_dashboard_unauthenticated(self):
        response = self.client.get("/dashboard/summary")
        self.assertEqual(
            response.status_code, 401,
            "Unauthenticated request to /dashboard/summary did not return 401"
        )

    # ------------------------------------------------------------------
    # 4. Upload a receipt image
    # ------------------------------------------------------------------
    def test_04_upload_receipt(self):
        # Simple fake JPEG payload (not a real image, but sufficient for the test)
        fake_image = BytesIO(b"\xff\xd8\xff\xe0" + b"\x00" * 1024)  # JPEG header + padding
        files = {
            "file": ("receipt.jpg", fake_image, "image/jpeg")
        }
        # Some APIs also accept an optional description/amount field; include a dummy one.
        data = {
            "description": "Client lunch",
            "amount": "45.67"
        }
        headers = auth_header(self.token)
        response = self.client.post("/receipts/", headers=headers, files=files, data=data)
        self.assertEqual(
            response.status_code, 201,
            f"Receipt upload failed: {response.status_code} {response.text}"
        )
        resp_json = response.json()
        self.assertIn("id", resp_json, "Receipt upload response missing 'id'")
        self.__class__.receipt_id = resp_json["id"]

    # ------------------------------------------------------------------
    # 5. Create a mileage entry
    # ------------------------------------------------------------------
    def test_05_create_mileage(self):
        payload = {
            "date": "2023-01-15",
            "distance_km": 123.4,
            "description": "Travel to client site"
        }
        headers = auth_header(self.token)
        response = self.client.post("/mileage/", headers=headers, json=payload)
        self.assertEqual(
            response.status_code, 201,
            f"Mileage entry creation failed: {response.status_code} {response.text}"
        )
        resp_json = response.json()
        self.assertIn("id", resp_json, "Mileage response missing 'id'")
        self.__class__.mileage_id = resp_json["id"]

    # ------------------------------------------------------------------
    # 6. Dashboard summary reflects uploaded data
    # ------------------------------------------------------------------
    def test_06_dashboard_summary(self):
        headers = auth_header(self.token)
        response = self.client.get("/dashboard/summary", headers=headers)
        self.assertEqual(
            response.status_code, 200,
            f"Dashboard summary request failed: {response.status_code} {response.text}"
        )
        data = response.json()
        # Expected keys – the exact names may vary; we check for presence.
        for key in ("total_receipts", "total_mileage_km", "total_amount"):
            self.assertIn(key, data, f"Dashboard summary missing expected key '{key}'")
        # Basic sanity checks (must be non‑zero because we added data)
        self.assertGreaterEqual(data["total_receipts"], 1, "Total receipts should be >= 1")
        self.assertGreaterEqual(data["total_mileage_km"], 123.4, "Total mileage should reflect the entry")
        self.assertGreaterEqual(float(data["total_amount"]), 45.67, "Total amount should reflect receipt")

    # ------------------------------------------------------------------
    # 7. Export CSV – verify content type and parsable CSV
    # ------------------------------------------------------------------
    def test_07_export_csv(self):
        headers = auth_header(self.token)
        response = self.client.get("/export/csv", headers=headers)
        self.assertEqual(
            response.status_code, 200,
            f"CSV export failed: {response.status_code} {response.text}"
        )
        content_type = response.headers.get("content-type", "")
        self.assertIn("text/csv", content_type, f"CSV export returned unexpected content type: {content_type}")

        # Parse CSV – ensure at least one data row (header + at least one line)
        csv_text = response.content.decode("utf-8-sig")  # handle possible BOM
        rows = list(csv.reader(csv_text.splitlines()))
        self.assertGreaterEqual(len(rows), 2, "CSV export should contain at least a header and one data row")
        # Optional: check that columns include 'amount' or similar
        header = rows[0]
        self.assertIn("amount", [h.lower() for h in header], "CSV header missing 'amount' column")

    # ------------------------------------------------------------------
    # 8. Export PDF – verify content type and PDF header
    # ------------------------------------------------------------------
    def test_08_export_pdf(self):
        headers = auth_header(self.token)
        response = self.client.get("/export/pdf", headers=headers)
        self.assertEqual(
            response.status_code, 200,
            f"PDF export failed: {response.status_code} {response.text}"
        )
        content_type = response.headers.get("content-type", "")
        self.assertIn("application/pdf", content_type, f"PDF export returned unexpected content type: {content_type}")

        # PDF files start with the magic bytes "%PDF-"
        self.assertTrue(
            response.content.startswith(b"%PDF-"),
            "PDF export does not start with the expected '%PDF-' header"
        )
        # Basic size check – should be more than a minimal header
        self.assertGreater(len(response.content), 1000, "PDF export seems unexpectedly small")

    # ------------------------------------------------------------------
    # 9. Invalid mileage entry – negative distance should be rejected
    # ------------------------------------------------------------------
    def test_09_invalid_mileage_negative_distance(self):
        payload = {
            "date": "2023-02-01",
            "distance_km": -10.0,
            "description": "Invalid mileage"
        }
        headers = auth_header(self.token)
        response = self.client.post("/mileage/", headers=headers, json=payload)
        self.assertNotEqual(
            response.status_code, 201,
            "API accepted a mileage entry with a negative distance"
        )
        # FastAPI validation typically returns 422 for schema errors
        self.assertIn(
            response.status_code, (400, 422),
            f"Unexpected status code for invalid mileage: {response.status_code}"
        )

    # ------------------------------------------------------------------
    # 10. Invalid receipt upload – non‑image file should be rejected
    # ------------------------------------------------------------------
    def test_10_invalid_receipt_file_type(self):
        fake_txt = BytesIO(b"This is not an image")
        files = {
            "file": ("receipt.txt", fake_txt, "text/plain")
        }
        data = {
            "description": "Invalid file test",
            "amount": "0"
        }
        headers = auth_header(self.token)
        response = self.client.post("/receipts/", headers=headers, files=files, data=data)
        # Expect 400 or 422 depending on validation implementation
        self.assertIn(
            response.status_code, (400, 422),
            f"Uploading a non‑image receipt returned unexpected status {response.status_code}"
        )

# ----------------------------------------------------------------------
# Test runner with a concise summary
# ----------------------------------------------------------------------
if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(AcceptanceTests)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    if result.wasSuccessful():
        print("\nALL TESTS PASSED")
        sys.exit(0)
    else:
        print(f"\n{len(result.failures) + len(result.errors)} TEST(S) FAILED")
        sys.exit(1)
