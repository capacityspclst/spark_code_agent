"""Dependency to get the current authenticated user."""
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from jose import JWTError
from . import auth, models, config, database

def get_current_user(
    token: str = Header(None, alias="Authorization"),
    db: Session = Depends(database.get_db),
):
    # Expect header like "Bearer <token>"
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    scheme, _, param = token.partition(" ")
    if scheme.lower() != "bearer" or not param:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header")
    try:
        payload = auth.decode_access_token(param)
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token payload invalid")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
