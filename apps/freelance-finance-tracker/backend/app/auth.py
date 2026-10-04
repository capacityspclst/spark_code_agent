import os
import datetime
from typing import Optional
import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(user_id: int, expires_delta: Optional[datetime.timedelta] = None) -> str:
    secret_key = os.getenv("JWT_SECRET_KEY", "secret")
    algorithm = "HS256"
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(days=30))
    to_encode = {"sub": str(user_id), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt

def decode_token(token: str) -> int:
    secret_key = os.getenv("JWT_SECRET_KEY", "secret")
    algorithm = "HS256"
    payload = jwt.decode(token, secret_key, algorithms=[algorithm])
    user_id: str = payload.get("sub")
    if user_id is None:
        raise jwt.InvalidTokenError("Missing sub claim")
    return int(user_id)
