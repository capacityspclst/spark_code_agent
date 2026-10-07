import os
import datetime
from typing import Optional
import jwt
from passlib.context import CryptContext
import secrets

# Ensure JWT secret is provided and of sufficient length. If missing or too short, generate a strong random secret.
_secret = os.getenv("JWT_SECRET_KEY")
if not _secret:
    # Generate a secure random secret (64 hex chars -> 32 bytes)
    _secret = secrets.token_hex(32)
    print("Info: JWT_SECRET_KEY not set, generated a random secret for this session.")
if len(_secret.encode()) < 32:
    # Generate a new strong secret if provided one is too short
    _secret = secrets.token_hex(32)
    print("Warning: Provided JWT_SECRET_KEY was too short; generated a secure secret.")
secret_key = _secret

# Use pbkdf2_sha256 which does not require external bcrypt
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(user_id: int, expires_delta: Optional[datetime.timedelta] = None) -> str:
    algorithm = "HS256"
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(days=30))
    to_encode = {"sub": str(user_id), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt

def decode_token(token: str) -> int:
    algorithm = "HS256"
    payload = jwt.decode(token, secret_key, algorithms=[algorithm])
    user_id: str = payload.get("sub")
    if user_id is None:
        raise jwt.InvalidTokenError("Missing sub claim")
    return int(user_id)
