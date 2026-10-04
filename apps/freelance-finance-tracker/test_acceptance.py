#!/usr/bin/env python3
"""
Acceptance tests for the freelance finance tracker backend.

Runs a FastAPI TestClient against the in‑memory (file‑backed) SQLite DB,
exercises registration (with confirm password), login (JWT with numeric exp),
and all protected transaction CRUD endpoints.

All assertion failures include the request description, the received status
code and the response body, and cause the script to exit with a non‑zero
status.
"""

import os
import sys
import time
from datetime import datetime
from typing import Any, List, Union

# --------------------------------------------------------------------------- #
# Configuration – set before importing the FastAPI app.
# --------------------------------------------------------------------------- #
# Use a temporary SQLite file so the same DB is shared across connections.
TEST_DB_PATH = "./test_acceptance.db"
os.environ.setdefault("DATABASE_URL", f"sqlite:///{TEST_DB_PATH}")

# JWT settings – deterministic for testing.
os.environ.setdefault("JWT_SECRET_KEY", "test_secret_key")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "60")  # 1 hour

# --------------------------------------------------------------------------- #
# Imports – after env vars are set.
# --------------------------------------------------------------------------- #
from fastapi.testclient import TestClient
from jose import jwt  # type: ignore

# Import the FastAPI app. The project layout is `backend/app/main.py`.
from backend.app.main import app  # noqa: E402

# --------------------------------------------------------------------------- #
# Helper utilities
# --------------------------------------------------------------------------- #
def auth_headers(token: str) -> dict:
    """Return Authorization header for the given JWT."""
    return {"Authorization": f"Bearer {token}"}


def assert_status(
    req_desc: str,
    resp,
    expected: Union[int, List[int]],
) -> None:
    """Assert that the response status code matches expectation."""
    if isinstance(expected, (list, tuple, set)):
        ok = resp.status_code in expected
        exp_str = "/".join(str(e) for e in expected)
    else:
        ok = resp.status_code == expected
        exp_str = str(expected)
    if not ok:
        raise AssertionError(
            f"{req_desc} - Expected status {exp_str}, got {resp.status_code}. "
            f"Response body: {resp.text}"
        )


def parse_json_response(req_desc: str, resp) -> Any:
    """Return resp.json() or raise a helpful AssertionError."""
    try:
        return resp.json()
    except Exception:
        raise AssertionError(
            f"{req_desc} - Unable to parse JSON. Response body: {resp.text}"
        )


def extract_transactions(resp_json: Any, req_desc: str) -> List[dict]:
    """Return the list of transactions from a GET /transactions response."""
    if isinstance(resp_json, list):
        return resp_json
    if isinstance(resp_json, dict) and "transactions" in resp_json:
        return resp_json["transactions"]
    raise AssertionError(
        f"{req_desc} - Unexpected response shape (expected list or {{\"transactions\": [...]}}). "
        f"Got: {resp_json}"
    )


# --------------------------------------------------------------------------- #
# Acceptance test sequence
# --------------------------------------------------------------------------- #
def main() -> None:
    client = TestClient(app)

    # ------------------------------------------------------------------- #
    # 1. Registration – success
    # ------------------------------------------------------------------- #
    email = "test.user@example.com"
    strong_password = "Testpass123!"
    resp = client.post(
        "/register",
        json={
            "email": email,
            "password": strong_password,
            "confirm_password": strong_password,
        },
    )
    assert_status("POST /register (successful) ", resp, 200)

    # ------------------------------------------------------------------- #
    # 2. Registration – password mismatch
    # ------------------------------------------------------------------- #
    resp = client.post(
        "/register",
        json={
            "email": "mismatch@example.com",
            "password": strong_password,
            "confirm_password": "Different123!",
        },
    )
    assert_status("POST /register (password mismatch) ", resp, 400)

    # ------------------------------------------------------------------- #
    # 3. Registration – weak password
    # ------------------------------------------------------------------- #
    weak_pwd = "short1!"
    resp = client.post(
        "/register",
        json={
            "email": "weak@example.com",
            "password": weak_pwd,
            "confirm_password": weak_pwd,
        },
    )
    assert_status("POST /register (weak password) ", resp, 400)

    # ------------------------------------------------------------------- #
    # 4. Login – obtain JWT
    # ------------------------------------------------------------------- #
    resp = client.post(
        "/login",
        json={"email": email, "password": strong_password},
    )
    assert_status("POST /login (valid credentials) ", resp, 200)
    login_json = parse_json_response("POST /login", resp)
    token = login_json.get("access_token")
    if not token:
        raise AssertionError(
            f"POST /login - Missing 'access_token' in response. Body: {resp.text}"
        )

    # Verify token payload contains numeric 'exp'
    secret = os.getenv("JWT_SECRET_KEY", "")
    algo = os.getenv("JWT_ALGORITHM", "HS256")
    try:
        payload = jwt.decode(token, secret, algorithms=[algo])
    except Exception as exc:
        raise AssertionError(f"JWT decode failed: {exc}")
    exp = payload.get("exp")
    if not isinstance(exp, (int, float)):
        raise AssertionError(
            f"JWT payload 'exp' is not numeric: {exp!r} (type {type(exp)})"
        )
    if exp <= time.time():
        raise AssertionError(
            f"JWT 'exp' claim {exp} is not in the future (now={int(time.time())})"
        )

    # ------------------------------------------------------------------- #
    # 5. Protected endpoint – reject unauthenticated request
    # ------------------------------------------------------------------- #
    resp = client.get("/transactions")
    assert_status("GET /transactions (no auth) ", resp, 401)

    # ------------------------------------------------------------------- #
    # 6. Protected endpoint – initial empty list
    # ------------------------------------------------------------------- #
    resp = client.get("/transactions", headers=auth_headers(token))
    assert_status("GET /transactions (authenticated, empty) ", resp, 200)
    transactions = extract_transactions(parse_json_response("GET /transactions", resp), "GET /transactions")
    assert len(transactions) == 0, f"GET /transactions - Expected 0 items, got {len(transactions)}."

    # ------------------------------------------------------------------- #
    # 7. Create a transaction
    # ------------------------------------------------------------------- #
    txn_payload = {
        "amount": 100.5,
        "description": "Test transaction",
        "date": "2023-09-01",
    }
    resp = client.post(
        "/transactions",
        json=txn_payload,
        headers=auth_headers(token),
    )
    assert_status("POST /transactions (create) ", resp, [200, 201])
    created_txn = parse_json_response("POST /transactions", resp)
    txn_id = created_txn.get("id")
    if not txn_id:
        raise AssertionError(
            f"POST /transactions - Response missing 'id'. Body: {resp.text}"
        )

    # ------------------------------------------------------------------- #
    # 8. Verify transaction appears in list
    # ------------------------------------------------------------------- #
    resp = client.get("/transactions", headers=auth_headers(token))
    assert_status("GET /transactions (after create) ", resp, 200)
    transactions = extract_transactions(parse_json_response("GET /transactions", resp), "GET /transactions")
    assert len(transactions) == 1, f"GET /transactions - Expected 1 item, got {len(transactions)}."
    fetched = transactions[0]
    assert fetched.get("id") == txn_id, "ID mismatch between created and fetched transaction."
    assert fetched.get("amount") == txn_payload["amount"], "Amount mismatch."
    assert fetched.get("description") == txn_payload["description"], "Description mismatch."
    assert fetched.get("date") == txn_payload["date"], "Date mismatch."

    # ------------------------------------------------------------------- #
    # 9. Update the transaction
    # ------------------------------------------------------------------- #
    updated_payload = {
        "amount": 200.0,
        "description": "Updated transaction",
        "date": "2023-09-02",
    }
    resp = client.put(
        f"/transactions/{txn_id}",
        json=updated_payload,
        headers=auth_headers(token),
    )
    assert_status("PUT /transactions/{id} (update) ", resp, 200)

    # Verify update persisted
    resp = client.get(
        f"/transactions/{txn_id}",
        headers=auth_headers(token),
    )
    assert_status("GET /transactions/{id} (after update) ", resp, 200)
    txn = parse_json_response("GET /transactions/{id}", resp)
    assert txn.get("amount") == updated_payload["amount"], "Updated amount not reflected."
    assert txn.get("description") == updated_payload["description"], "Updated description not reflected."
    assert txn.get("date") == updated_payload["date"], "Updated date not reflected."

    # ------------------------------------------------------------------- #
    # 10. Delete the transaction
    # ------------------------------------------------------------------- #
    resp = client.delete(
        f"/transactions/{txn_id}",
        headers=auth_headers(token),
    )
    assert_status("DELETE /transactions/{id} ", resp, [200, 204])

    # Ensure list is empty again
    resp = client.get("/transactions", headers=auth_headers(token))
    assert_status("GET /transactions (after delete) ", resp, 200)
    transactions = extract_transactions(parse_json_response("GET /transactions", resp), "GET /transactions")
    assert len(transactions) == 0, f"GET /transactions - Expected 0 items after delete, got {len(transactions)}."

    # ------------------------------------------------------------------- #
    # Cleanup
    # ------------------------------------------------------------------- #
    try:
        if os.path.exists(TEST_DB_PATH):
            os.remove(TEST_DB_PATH)
    except Exception as exc:
        print(f"Warning: could not delete temporary DB file: {exc}")

    print("PASS: all acceptance tests passed.")
    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except AssertionError as ae:
        print(f"FAIL: {ae}")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: Unexpected exception: {e}")
        sys.exit(1)
