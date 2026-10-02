#!/usr/bin/env python3
"""
Acceptance tests for the freelance finance tracker FastAPI backend.

These tests cover the main happy‑path workflow:
1. Register a new user.
2. Log in to obtain a JWT.
3. Upload a receipt image.
4. Create a mileage entry.
5. Retrieve the dashboard summary.
6. Export data as CSV and PDF.
7. Verify authentication enforcement.

The tests run entirely in‑process using FastAPI's TestClient and a temporary
SQLite database & upload folder, without any network calls.
"""

import os
import io
import unittest
import tempfile
import shutil
from pathlib import Path

# ----------------------------------------------------------------------
# Configure safe defaults for the application via environment variables
# ----------------------------------------------------------------------
os.environ.setdefault("JWT_SECRET", "test-secret")
# Use a file‑based SQLite DB so that multiple connections work reliably.
TEST_DB_PATH = Path(tempfile.gettempdir()) / "test_acceptance.db"
os.environ.setdefault("DATABASE_URL", f"sqlite:///{TEST_DB_PATH}")
os.environ.setdefault("UPLOAD_ROOT", tempfile.mkdtemp(prefix="uploads_"))
os.environ.setdefault("ALLOWED_ORIGINS", "")  # No CORS in CI

# ----------------------------------------------------------------------
# Import the application after the environment is prepared
# ----------------------------------------------------------------------
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from app.main import app  # The FastAPI instance
from app import dependencies  # get_engine, get_session, Settings (if needed)

# ----------------------------------------------------------------------
# Dependency overrides for a clean test environment
# ----------------------------------------------------------------------
engine = create_engine(os.getenv("DATABASE_URL"), connect_args={"check_same_thread": False})

# Create all tables before any request is processed
SQLModel.metadata.create_all(engine)


def override_get_engine():
    """Return the test engine instead of the production one."""
    return engine


async def override_get_session():
    """Yield a sync Session wrapped in an async generator (FastAPI accepts this)."""
    with Session(engine) as session:
        yield session


# Apply overrides
app.dependency_overrides[dependencies.get_engine] = override_get_engine
app.dependency_overrides[dependencies.get_session] = override_get_session

# ----------------------------------------------------------------------
# Test case implementation
# ----------------------------------------------------------------------
class TestFreelanceFinanceTracker(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Create a TestClient usable by all test methods."""
        cls.client = TestClient(app)
        cls.test_email = "tester@example.com"
        cls.test_password = "SuperSecret123!"

    @classmethod
    def tearDownClass(cls):
        """Clean up temporary resources."""
        # Close the TestClient (no-op but good practice)
        cls.client.close()
        # Remove temporary upload directory
        upload_root = os.getenv("UPLOAD_ROOT")
        if upload_root and os.path.isdir(upload_root):
            shutil.rmtree(upload_root, ignore_errors=True)
        # Remove the SQLite test database file
        if TEST_DB_PATH.is_file():
            TEST_DB_PATH.unlink(missing_ok=True)

    # ------------------------------------------------------------------
    # Helper utilities
    # ------------------------------------------------------------------
    def _auth_headers(self, token: str) -> dict:
        """Return a dict with the Authorization header for a JWT."""
        return {"Authorization": f"Bearer {token}"}

    # ------------------------------------------------------------------
    # Test steps
    # ------------------------------------------------------------------
    def test_01_register_user(self):
        """Register a new user; expect 200/201."""
        resp = self.client.post(
            "/register",
            json={"email": self.test_email, "password": self.test_password},
        )
        self.assertIn(resp.status_code, (200, 201), msg=f"Unexpected status: {resp.text}")

    def test_02_login_and_get_token(self):
        """Log in with the newly created user and retrieve a JWT."""
        resp = self.client.post(
            "/login",
            json={"email": self.test_email, "password": self.test_password},
        )
        self.assertEqual(resp.status_code, 200, msg=f"Login failed: {resp.text}")
        data = resp.json()
        self.assertIn("access_token", data, msg="Missing access_token in login response")
        self.__class__.jwt_token = data["access_token"]  # Store for later tests

    def test_03_unauthenticated_dashboard(self):
        """Attempt to access the dashboard without a token; expect 401."""
        resp = self.client.get("/dashboard/summary")
        self.assertEqual(resp.status_code, 401, msg="Unauthenticated access should be denied")

    def test_04_upload_receipt(self):
        """Upload a dummy receipt image and verify creation."""
        token = getattr(self.__class__, "jwt_token", None)
        self.assertIsNotNone(token, "JWT token not set from previous test")
        headers = self._auth_headers(token)

        # Minimal PNG header + dummy payload
        dummy_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
        file_obj = io.BytesIO(dummy_png)

        files = {
            "file": ("receipt.png", file_obj, "image/png"),
        }
        # Some implementations also expect an 'amount' field; provide a value.
        data = {"amount": "123.45"}

        resp = self.client.post(
            "/receipts/",
            files=files,
            data=data,
            headers=headers,
        )
        self.assertIn(resp.status_code, (200, 201), msg=f"Receipt upload failed: {resp.text}")
        receipt = resp.json()
        # Store receipt ID for optional later checks
        self.__class__.receipt_id = receipt.get("id")
        # Verify that the amount round‑trips correctly
        self.assertAlmostEqual(float(receipt.get("amount", 0)), 123.45, places=2)

    def test_05_create_mileage_entry(self):
        """Create a mileage entry and verify persistence."""
        token = getattr(self.__class__, "jwt_token", None)
        self.assertIsNotNone(token, "JWT token not set")
        headers = self._auth_headers(token)

        mileage_data = {
            "date": "2023-01-01",
            "distance_km": 100.0,
            "description": "Test business trip",
        }
        resp = self.client.post(
            "/mileage/",
            json=mileage_data,
            headers=headers,
        )
        self.assertIn(resp.status_code, (200, 201), msg=f"Mileage creation failed: {resp.text}")
        mileage = resp.json()
        self.__class__.mileage_id = mileage.get("id")
        self.assertAlmostEqual(float(mileage.get("distance_km", 0)), 100.0, places=2)

    def test_06_dashboard_summary(self):
        """Retrieve the dashboard and ensure totals reflect prior inserts."""
        token = getattr(self.__class__, "jwt_token", None)
        self.assertIsNotNone(token, "JWT token not set")
        headers = self._auth_headers(token)

        resp = self.client.get("/dashboard/summary", headers=headers)
        self.assertEqual(resp.status_code, 200, msg=f"Dashboard request failed: {resp.text}")
        summary = resp.json()

        # Expected keys (implementation may vary, but these are required by the spec)
        required_keys = {
            "total_receipts",
            "total_amount",
            "total_mileage_km",
            "estimated_reimbursement",
        }
        self.assertTrue(required_keys.issubset(summary.keys()), f"Missing keys in summary: {summary}")

        self.assertGreaterEqual(summary["total_receipts"], 1)
        # Total amount should be at least the amount we uploaded
        self.assertGreaterEqual(float(summary["total_amount"]), 123.45)
        # Total mileage should be at least the distance we added
        self.assertGreaterEqual(float(summary["total_mileage_km"]), 100.0)

    def test_07_export_csv(self):
        """Export data as CSV and verify the content."""
        token = getattr(self.__class__, "jwt_token", None)
        self.assertIsNotNone(token, "JWT token not set")
        headers = self._auth_headers(token)

        resp = self.client.get("/export/csv", headers=headers)
        self.assertEqual(resp.status_code, 200, msg=f"CSV export failed: {resp.text}")
        self.assertIn("text/csv", resp.headers.get("content-type", ""), msg="CSV response has wrong content type")

        csv_text = resp.text.strip()
        # Basic sanity checks: header line and at least one data line
        lines = csv_text.splitlines()
        self.assertGreaterEqual(len(lines), 2, msg="CSV should contain header + data line")
        header = lines[0].lower()
        self.assertIn("total_receipts", header)
        self.assertIn("total_amount", header)
        self.assertIn("total_mileage_km", header)

        # Verify that the data line contains the numeric values we expect
        data_line = lines[1]
        self.assertIn(str(int(1)), data_line)  # at least one receipt
        self.assertIn("123.45", data_line)    # amount we uploaded
        self.assertIn("100.0", data_line)    # mileage we added

    def test_08_export_pdf(self):
        """Export data as PDF and ensure it starts with the PDF magic number."""
        token = getattr(self.__class__, "jwt_token", None)
        self.assertIsNotNone(token, "JWT token not set")
        headers = self._auth_headers(token)

        resp = self.client.get("/export/pdf", headers=headers)
        self.assertEqual(resp.status_code, 200, msg=f"PDF export failed: {resp.text}")
        self.assertIn("application/pdf", resp.headers.get("content-type", ""), msg="PDF response has wrong content type")
        pdf_bytes = resp.content
        # PDF files start with the bytes "%PDF"
        self.assertTrue(pdf_bytes.startswith(b"%PDF"), msg="Response does not start with %PDF")

# ----------------------------------------------------------------------
# Run the tests and provide a concise summary
# ----------------------------------------------------------------------
if __name__ == "__main__":
    # unittest.main() will exit with a non‑zero status on failures.
    unittest.main(verbosity=2)
