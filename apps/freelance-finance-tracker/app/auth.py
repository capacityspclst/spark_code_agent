"""Authentication utilities: password hashing, JWT handling, and current user dependency using only stdlib."""
import datetime
import hashlib
import hmac
import json
import os
import base64
from typing import Optional

from fastapi import HTTPException, Request

from .dependencies import get_settings, get_engine
from .models import User
from sqlmodel import Session, select

# Helper functions for base64 url safe without padding
def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def _b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def get_password_hash(password: str) -> str:
    """Hash a password with PBKDF2-HMAC-SHA256 and a random salt.
    Returns string in format ``salt$hash``.
    """
    salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100_000)
    return f"{salt}${dk.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a ``salt$hash`` stored value."""
    try:
        salt, hash_hex = hashed_password.split('$')
    except ValueError:
        return False
    dk = hashlib.pbkdf2_hmac('sha256', plain_password.encode(), salt.encode(), 100_000)
    return dk.hex() == hash_hex

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=settings.token_expire_minutes))
    to_encode.update({"exp": int(expire.timestamp())})
    header = {"alg": "HS256", "typ": "JWT"}
    b64_header = _b64url_encode(json.dumps(header, separators=(',', ':')).encode())
    b64_payload = _b64url_encode(json.dumps(to_encode, separators=(',', ':')).encode())
    signing_input = f"{b64_header}.{b64_payload}".encode()
    signature = hmac.new(settings.jwt_secret.encode(), signing_input, hashlib.sha256).digest()
    b64_sig = _b64url_encode(signature)
    return f"{b64_header}.{b64_payload}.{b64_sig}"

def decode_access_token(token: str) -> dict:
    settings = get_settings()
    try:
        b64_header, b64_payload, b64_sig = token.split('.')
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    # Verify signature
    signing_input = f"{b64_header}.{b64_payload}".encode()
    expected_sig = hmac.new(settings.jwt_secret.encode(), signing_input, hashlib.sha256).digest()
    if not hmac.compare_digest(_b64url_encode(expected_sig), b64_sig):
        raise HTTPException(status_code=401, detail="Invalid token signature")
    payload_bytes = _b64url_decode(b64_payload)
    payload = json.loads(payload_bytes)
    # Check expiration
    exp = payload.get('exp')
    if exp is not None and datetime.datetime.utcnow().timestamp() > exp:
        raise HTTPException(status_code=401, detail="Token expired")
    return payload

def get_current_user(request: Request) -> User:
    auth: str = request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = auth.split()[1]
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token missing subject")
    engine = get_engine()
    session = Session(engine)
    user = session.exec(select(User).where(User.id == int(user_id))).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
