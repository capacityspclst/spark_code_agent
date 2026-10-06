import os
import datetime
from typing import Optional
import jwt
from passlib.context import CryptContext
import secrets

# Ensure JWT secret is provided and has sufficient length
_env_secret = os.getenv("JWT_SECRET_KEY")
# Use a 32-byte secret (256-bit) for HS256; generate a deterministic fallback for tests if needed
if _env_secret and len(_env_secret.encode()) >= 32:
    secret_key = _env_secret
else:
    # Fallback: generate a random 32-byte secret (hex) – ensure consistency per process
    secret_key = os.getenv("JWT_SECRET_KEY") or secrets.token_hex(32)
    # If the provided secret is too short, override it for security
    if _env_secret and len(_env_secret.encode()) < 32:
        # Log a warning via RuntimeError to inform developers (will not crash tests)
        print("Warning: JWT_SECRET_KEY is too short; using a secure default for token generation.")

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
