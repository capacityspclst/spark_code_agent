from fastapi import APIRouter, Depends, HTTPException, status, Form, Request
from fastapi import Body
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .. import models, auth
from ..auth import get_password_hash
from ..limit import limiter

router = APIRouter()

# Limit token requests to mitigate brute-force attempts
@router.post("/token")
@limiter.limit("5/minute")
def login_for_access_token(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(auth.get_db),
):
    user = db.query(models.User).filter(models.User.email == username).first()
    if not user or not auth.verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

# Pydantic model for registration payload
class UserCreate(BaseModel):
    email: str
    password: str

# Registration endpoint (accepts JSON body)
@router.post("/users")
def register_user(
    user: UserCreate = Body(...),
    db: Session = Depends(auth.get_db),
):
    # Check if user exists
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
    hashed = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email}
