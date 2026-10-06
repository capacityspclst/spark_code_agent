"""API routers for authentication and transaction uploads.
All upload routes are protected by JWT authentication.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import re

from auth import get_password_hash, verify_password, create_access_token
from dependencies import get_current_user
from database import get_db
from models import User
from schemas import UserCreate, UserRead, Token

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/register", response_model=UserRead, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user after validating password strength."""
    password = user_in.password
    if len(password) < 12:
        raise HTTPException(status_code=400, detail="Password must be at least 12 characters long")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain an uppercase letter")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain a lowercase letter")
    if not re.search(r"[0-9]", password):
        raise HTTPException(status_code=400, detail="Password must contain a digit")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password must contain a special character")

    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = get_password_hash(password)
    user = User(email=user_in.email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserRead.from_orm(user)

@auth_router.post("/login", response_model=Token)
def login(user_in: UserCreate, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT access token."""
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token({"sub": str(user.id)})
    return Token(access_token=access_token)

# Transaction router
transaction_router = APIRouter(prefix="/transactions", tags=["transactions"])

@transaction_router.post("/upload-csv")
def upload_csv(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Accept a CSV file upload; authentication required."""
    return {"detail": "CSV uploaded successfully"}

@transaction_router.post("/upload-receipt")
def upload_receipt(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Accept an image receipt upload; authentication required."""
    return {"detail": "Receipt uploaded successfully"}
