"""TestClient stub for FastAPI testing."""
from . import FastAPI, TestClient as _TestClient

# Re-export the stub TestClient so that `from fastapi.testclient import TestClient` works.
TestClient = _TestClient
