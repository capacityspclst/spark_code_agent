import os
import sys
import unittest
import tempfile
from pathlib import Path

import jwt
from fastapi.testclient import TestClient

# -------------------- Environment configuration --------------------
# Set deterministic secret and algorithm before the app is imported
os.environ["SECRET_KEY"] = "testsecret"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"

# Use a temporary SQLite database file for isolation
_tmp_dir = tempfile.TemporaryDirectory()
db_path = Path(_tmp_dir.name) / "test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

# -------------------- Import the FastAPI application --------------------
from main import app  # The FastAPI instance must be named `app`

# ----------------------------------------------------------------------
class TestFinanceTracker(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Create a test client, register a user, and obtain a JWT token."""
        cls.client = TestClient(app)

        # ---- Register a user with a strong password ----
        register_payload = {
            "email": "test.user@example.com",
            "password": "Testpass123!"
        }
        resp = cls.client.post("/auth/register", json=register_payload)
        if resp.status_code not in (200, 201):
            raise AssertionError(
                f"User registration failed: POST /auth/register, "
                f"status {resp.status_code}, body {resp.text}"
            )

        # ---- Log in to obtain an access token ----
        login_payload = {
            "email": "test.user@example.com",
            "password": "Testpass123!"
        }
        resp = cls.client.post("/auth/login", json=login_payload)
        if resp.status_code != 200:
            raise AssertionError(
                f"User login failed: POST /auth/login, "
                f"status {resp.status_code}, body {resp.text}"
            )
        data = resp.json()
        if "access_token" not in data:
            raise AssertionError(f"Login response missing access_token: body {resp.text}")
        cls.token = data["access_token"]

    # ------------------------------------------------------------------
    def test_register_weak_password(self):
        """A password that fails complexity requirements must be rejected."""
        payload = {"email": "weak.user@example.com", "password": "short"}
        resp = self.client.post("/auth/register", json=payload)
        self.assertIn(
            resp.status_code,
            (400, 422),
            msg=(
                f"Weak password should be rejected: POST /auth/register with "
                f"{payload}, got {resp.status_code}, body {resp.text}"
            ),
        )

    # ------------------------------------------------------------------
    def test_upload_csv_without_token(self):
        """Uploading a CSV without a JWT token must be unauthorized."""
        files = {"file": ("test.csv", b"date,amount\n2023-01-01,100", "text/csv")}
        resp = self.client.post("/transactions/upload-csv", files=files)
        self.assertEqual(
            resp.status_code,
            401,
            msg=(
                f"CSV upload without token should be unauthorized: POST "
                f"/transactions/upload-csv, got {resp.status_code}, body {resp.text}"
            ),
        )

    # ------------------------------------------------------------------
    def test_upload_receipt_without_token(self):
        """Uploading a receipt without a JWT token must be unauthorized."""
        files = {"file": ("receipt.jpg", b"dummydata", "image/jpeg")}
        resp = self.client.post("/transactions/upload-receipt", files=files)
        self.assertEqual(
            resp.status_code,
            401,
            msg=(
                f"Receipt upload without token should be unauthorized: POST "
                f"/transactions/upload-receipt, got {resp.status_code}, body {resp.text}"
            ),
        )

    # ------------------------------------------------------------------
    def test_upload_csv_with_token(self):
        """A valid token must allow CSV upload and return the expected response."""
        files = {"file": ("test.csv", b"date,amount\n2023-01-01,100", "text/csv")}
        headers = {"Authorization": f"Bearer {self.token}"}
        resp = self.client.post("/transactions/upload-csv", files=files, headers=headers)
        self.assertEqual(
            resp.status_code,
            200,
            msg=(
                f"CSV upload with valid token failed: POST /transactions/upload-csv, "
                f"got {resp.status_code}, body {resp.text}"
            ),
        )
        json_body = resp.json()
        self.assertEqual(
            json_body.get("detail"),
            "CSV uploaded successfully",
            msg=f"Unexpected CSV upload response JSON: {json_body}",
        )

    # ------------------------------------------------------------------
    def test_upload_receipt_with_token(self):
        """A valid token must allow receipt upload and return the expected response."""
        files = {"file": ("receipt.jpg", b"dummydata", "image/jpeg")}
        headers = {"Authorization": f"Bearer {self.token}"}
        resp = self.client.post("/transactions/upload-receipt", files=files, headers=headers)
        self.assertEqual(
            resp.status_code,
            200,
            msg=(
                f"Receipt upload with valid token failed: POST "
                f"/transactions/upload-receipt, got {resp.status_code}, body {resp.text}"
            ),
        )
        json_body = resp.json()
        self.assertEqual(
            json_body.get("detail"),
            "Receipt uploaded successfully",
            msg=f"Unexpected receipt upload response JSON: {json_body}",
        )

    # ------------------------------------------------------------------
    def test_upload_csv_invalid_token(self):
        """An invalid JWT token must result in unauthorized access."""
        invalid_token = self.token + "invalid"
        files = {"file": ("test.csv", b"date,amount\n2023-01-01,100", "text/csv")}
        headers = {"Authorization": f"Bearer {invalid_token}"}
        resp = self.client.post("/transactions/upload-csv", files=files, headers=headers)
        self.assertEqual(
            resp.status_code,
            401,
            msg=(
                f"CSV upload with invalid token should be unauthorized: POST "
                f"/transactions/upload-csv, got {resp.status_code}, body {resp.text}"
            ),
        )

    # ------------------------------------------------------------------
    def test_token_structure(self):
        """The JWT token must contain a string 'sub' claim convertible to int."""
        try:
            payload = jwt.decode(
                self.token,
                os.getenv("SECRET_KEY"),
                algorithms=[os.getenv("ALGORITHM", "HS256")],
            )
        except Exception as e:
            self.fail(f"Failed to decode JWT token: {e}")

        sub = payload.get("sub")
        self.assertIsInstance(
            sub,
            str,
            msg=f"Token 'sub' claim is not a string: {payload}",
        )
        try:
            _ = int(sub)
        except Exception:
            self.fail(f"Token 'sub' claim is not convertible to int: {sub}")

# ----------------------------------------------------------------------
if __name__ == "__main__":
    runner = unittest.main(exit=False)
    if runner.result.wasSuccessful():
        print("All acceptance tests passed")
        sys.exit(0)
    else:
        print("One or more acceptance tests failed")
        sys.exit(1)
