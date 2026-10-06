"""Authentication utilities: password hashing and JWT handling.
Provides functions to hash passwords, verify them, create JWT access tokens, and decode them.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

import jwt
from passlib.context import CryptContext

from config import SECRET_KEY, ALGORITHM, get_access_token_expires

# Password hashing context using pbkdf2_sha256 (secure and avoids bcrypt backend issues).
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Return a pbkdf2_sha256 hash of the given password."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its pbkdf2_sha256 hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token.

    Args:
        data: Dictionary containing data to encode (e.g., {'sub': '1'}).
        expires_delta: Optional custom expiry delta. If not provided,
            use the default expiry from configuration.
    Returns:
        A signed JWT string.
    """
    to_encode = data.copy()
    if expires_delta is None:
        expires_delta = get_access_token_expires()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and verify a JWT access token.

    Raises:
        jwt.exceptions.InvalidTokenError: If token is invalid or expired.
    Returns:
        The payload dictionary.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.exceptions.InvalidTokenError as exc:
        # Re‑raise to let callers handle authentication errors uniformly.
        raise exc
