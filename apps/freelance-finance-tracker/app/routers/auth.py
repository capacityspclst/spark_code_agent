"""Authentication router for registration and login."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..models import User
from ..schemas import RegisterRequest, LoginRequest, TokenResponse
from ..auth import get_password_hash, verify_password, create_access_token
from ..dependencies import get_session

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, session: Session = Depends(get_session)):
    # Check if user exists
    existing = session.exec(select(User).where(User.email == request.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=request.email, hashed_password=get_password_hash(request.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"msg": "User created"}

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == request.email)).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token}
