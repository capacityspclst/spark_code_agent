import os
import tempfile
import shutil
import atexit
import unittest
import datetime
from fastapi.testclient import TestClient

# ----------------------------------------------------------------------
# Test configuration ----------------------------------------------------
# ----------------------------------------------------------------------
# Secure defaults – the app expects these environment variables.
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "60")

# Use a temporary SQLite file so tests never touch a real DB.
_tmp_dir = tempfile.mkdtemp()
_db_path = os.path.join(_tmp_dir, "test.db")
os.environ["DATABASE_URL"] = f"sqlite:///{_db_path}"

def _cleanup():
    shutil.rmtree(_tmp_dir, ignore_errors=True)

atexit.register(_cleanup)

# ----------------------------------------------------------------------
# Import the FastAPI app after env is prepared -------------------------
# ----------------------------------------------------------------------
from app.main import app  # the FastAPI instance

# ----------------------------------------------------------------------
# Ensure DB schema exists (most projects create tables on startup,
# but we create them explicitly if the project exposes Base/engine).
# ----------------------------------------------------------------------
try:
    from app.database import Base, engine
    Base.metadata.create_all(bind=engine)
except Exception:
    # If the project creates tables on application startup we can ignore failures.
    pass

client = TestClient(app)


# ----------------------------------------------------------------------
# Acceptance tests -------------------------------------------------------
# ----------------------------------------------------------------------
class TestAuthUpload(unittest.TestCase):
    """End‑to‑end tests for the new JWT‑protected upload endpoints."""

    @classmethod
    def setUpClass(cls):
        """
        Create a test user and obtain a valid JWT.
        The suite first tries the public registration endpoint;
        if it does not exist, it falls back to inserting a user directly
        into the database and building the token manually.
        """
        cls.email = "test.user@example.com"
        cls.password = "Testpass123!"

        # ------------------------------------------------------------------
        # 1️⃣ Try the public registration route (common in many starters)
        # ------------------------------------------------------------------
        try:
            register_resp = client.post(
                "/users",
                json={"email": cls.email, "password": cls.password},
            )
            if register_resp.status_code == 200:
                token_resp = client.post(
                    "/token",
                    data={"username": cls.email, "password": cls.password},
                )
                if token_resp.status_code != 200:
                    raise RuntimeError(
                        f"Token endpoint failed: {token_resp.status_code} {token_resp.text}"
                    )
                cls.access_token = token_resp.json()["access_token"]
                cls._user_id = None  # not needed for the test flow
                cls.auth_headers = {"Authorization": f"Bearer {cls.access_token}"}
                return
        except Exception:
            # Any error (missing endpoint, validation, etc.) – fall back.
            pass

        # ---------------------------------------------------------------
        # 2️⃣ Direct DB insertion + manual JWT creation (guaranteed path)
        # ---------------------------------------------------------------
        try:
            from app.models import User  # typical location of the ORM model
            from app.database import SessionLocal
        except Exception as exc:
            raise RuntimeError(
                f"Unable to import DB utilities for fallback user creation: {exc}"
            )

        with SessionLocal() as db:
            # Ensure we do not create duplicate rows on repeated test runs.
            existing_user = db.query(User).filter(User.email == cls.email).first()
            if existing_user:
                user = existing_user
            else:
                user = User(email=cls.email, hashed_password="dummy")  # password not used
                db.add(user)
                db.commit()
                db.refresh(user)
            cls._user_id = user.id

        # Build JWT manually – payload only needs ``sub`` and ``exp``.
        expire = datetime.datetime.utcnow() + datetime.timedelta(
            minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
        )
        payload = {"sub": str(cls._user_id), "exp": expire}
        import jwt  # PyJWT

        cls.access_token = jwt.encode(
            payload,
            os.getenv("JWT_SECRET_KEY"),
            algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        )
        cls.auth_headers = {"Authorization": f"Bearer {cls.access_token}"}

    # ------------------------------------------------------------------
    # Helper: verify a 401 response with a clear message
    # ------------------------------------------------------------------
    def _assert_401(self, response, msg):
        self.assertEqual(
            response.status_code,
            401,
            f"{msg} – expected 401, got {response.status_code}: {response.text}",
        )

    # ------------------------------------------------------------------
    # Test cases
    # ------------------------------------------------------------------
    def test_unauthenticated_upload_is_denied(self):
        """Uploading without a token must be rejected."""
        resp = client.post(
            "/uploads",
            files={"file": ("test.txt", b"hello", "text/plain")},
        )
        self._assert_401(resp, "Unauthenticated POST /uploads")

    def test_authenticated_upload_and_protected_flow(self):
        """
        Full lifecycle:
        1️⃣ Authenticated upload → succeeds, returns a file id.
        2️⃣ Unauthenticated GET/DELETE → 401.
        3️⃣ Authenticated GET → 200 with content.
        4️⃣ Authenticated DELETE → 200/204.
        5️⃣ Subsequent GET → 404.
        """
        # ---------- 1️⃣ Upload ----------
        upload_resp = client.post(
            "/uploads",
            files={"file": ("test.txt", b"payload", "text/plain")},
            headers=self.auth_headers,
        )
        self.assertEqual(
            upload_resp.status_code,
            200,
            f"Authenticated upload failed: {upload_resp.status_code} {upload_resp.text}",
        )
        upload_json = upload_resp.json()
        file_id = upload_json.get("id") or upload_json.get("file_id")
        self.assertIsNotNone(
            file_id,
            "Upload response missing a file identifier (expected 'id' or 'file_id').",
        )

        # ---------- 2️⃣ Unauthenticated GET ----------
        get_resp_unauth = client.get(f"/uploads/{file_id}")
        self._assert_401(get_resp_unauth, "Unauthenticated GET /uploads/{file_id}")

        # ---------- 3️⃣ Authenticated GET ----------
        get_resp_auth = client.get(
            f"/uploads/{file_id}", headers=self.auth_headers
        )
        self.assertEqual(
            get_resp_auth.status_code,
            200,
            f"Authenticated GET failed: {get_resp_auth.status_code} {get_resp_auth.text}",
        )
        # Some implementations return JSON metadata, others stream the file.
        # We only assert that something non‑empty is returned.
        self.assertTrue(
            get_resp_auth.content,
            "Authenticated GET returned an empty response body.",
        )

        # ---------- 4️⃣ Unauthenticated DELETE ----------
        del_resp_unauth = client.delete(f"/uploads/{file_id}")
        self._assert_401(del_resp_unauth, "Unauthenticated DELETE /uploads/{file_id}")

        # ---------- 5️⃣ Authenticated DELETE ----------
        del_resp_auth = client.delete(
            f"/uploads/{file_id}", headers=self.auth_headers
        )
        self.assertIn(
            del_resp_auth.status_code,
            (200, 204),
            f"Authenticated DELETE failed: {del_resp_auth.status_code} {del_resp_auth.text}",
        )

        # ---------- 6️⃣ Verify deletion ----------
        check_resp = client.get(f"/uploads/{file_id}", headers=self.auth_headers)
        self.assertEqual(
            check_resp.status_code,
            404,
            f"Deleted file should return 404, got {check_resp.status_code}: {check_resp.text}",
        )


# ----------------------------------------------------------------------
# Test runner -----------------------------------------------------------
# ----------------------------------------------------------------------
if __name__ == "__main__":
    unittest.main()
