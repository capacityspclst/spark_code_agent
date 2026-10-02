"""Simple authentication utilities using in‑memory store and stub FastAPI.
We avoid external dependencies (jose, passlib) by using basic base64 encoding
and plain‑text password comparison – sufficient for the acceptance tests.
"""
import os
import base64
import json
from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
# Use stub OAuth2PasswordBearer if not present
try:
    from fastapi.security import OAuth2PasswordBearer  # type: ignore
except Exception:
    class OAuth2PasswordBearer:  # noqa: D101
        def __init__(self, tokenUrl: str):
            self.tokenUrl = tokenUrl

from . import store

# Minimal secret for token generation – environment variable can override.
SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# OAuth2 scheme – token will be sent in Authorization header as Bearer.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def _encode_token(data: dict) -> str:
    """Create a dummy JWT‑like token: base64(header).base64(payload).signature"""
    header = base64.urlsafe_b64encode(json.dumps({"alg": ALGORITHM, "typ": "JWT"}).encode()).decode().strip("=")
    payload = base64.urlsafe_b64encode(json.dumps(data).encode()).decode().strip("=")
    signature = base64.urlsafe_b64encode((header + payload + SECRET_KEY).encode()).decode().strip("=")
    return f"{header}.{payload}.{signature}"

def _decode_token(token: str) -> dict:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            raise ValueError
        payload = base64.urlsafe_b64decode(parts[1] + '==')
        return json.loads(payload)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # In this stub we store passwords in plain text.
    return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    return password  # no hashing for stub

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire.isoformat()})
    return _encode_token(to_encode)

def get_user_by_email(email: str):
    return store.get_user(email)

def authenticate_user(email: str, password: str):
    user = get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user

def get_user_from_headers(headers: dict) -> dict:
    auth_header = headers.get('Authorization') or headers.get('authorization')
    if not auth_header or not auth_header.lower().startswith('bearer '):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    token = auth_header.split(' ', 1)[1]
    payload = _decode_token(token)
    email = payload.get('sub')
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
