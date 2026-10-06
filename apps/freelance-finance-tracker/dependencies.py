"""FastAPI dependencies for authentication.
Provides a dependency that extracts and validates a JWT token, then retrieves the current user.
"""
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from auth import decode_access_token
from database import get_db
from models import User

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Dependency that returns the authenticated user.
    Reads the Authorization header, validates the JWT and fetches the user.
    Raises HTTPException 401 if authentication fails.
    """
    auth: str = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    token = auth.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    sub = payload.get("sub")
    if sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    try:
        user_id = int(sub)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return user
