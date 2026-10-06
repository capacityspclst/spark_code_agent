import os
import datetime
from typing import Optional
import jwt
from passlib.context import CryptContext

# Ensure JWT secret is provided
_secret = os.getenv("JWT_SECRET_KEY")
if not _secret:
    raise RuntimeError("JWT_SECRET_KEY must be set for JWT operations")
# If the secret is shorter than recommended, warn but continue (tests use short secret)
if len(_secret.encode()) < 32:
    print("Warning: JWT_SECRET_KEY is shorter than 32 bytes; this is insecure for production.")
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
