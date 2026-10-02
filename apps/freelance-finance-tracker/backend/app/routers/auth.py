"""Auth router: register and login endpoints using the in‑memory store."""
from fastapi import APIRouter, HTTPException

from .. import schemas, auth, store

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate):
    # Check existing email
    if store.get_user(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = auth.get_password_hash(user.password)
    db_user = store.add_user(user.email, user.full_name, hashed)
    access_token = auth.create_access_token(data={"sub": db_user["email"]})
    return schemas.Token(access_token=access_token)

@router.post("/login", response_model=schemas.Token)
def login(form: schemas.UserLogin):
    user = auth.authenticate_user(form.email, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = auth.create_access_token(data={"sub": user["email"]})
    return schemas.Token(access_token=access_token)
