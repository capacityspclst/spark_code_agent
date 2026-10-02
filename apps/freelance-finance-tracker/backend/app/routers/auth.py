"""Auth router: register and login endpoints using the in‑memory store."""
from fastapi import APIRouter, HTTPException

from .. import schemas, auth, store

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.Token)
def register(json: dict = None):
    # Extract user data from JSON payload
    payload = json or {}
    email = payload.get("email")
    password = payload.get("password")
    full_name = payload.get("full_name")
    if not email or not password or not full_name:
        raise HTTPException(status_code=400, detail="Missing fields")
    if store.get_user(email):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = auth.get_password_hash(password)
    db_user = store.add_user(email, full_name, hashed)
    access_token = auth.create_access_token(data={"sub": db_user["email"]})
    return schemas.Token(access_token=access_token)

@router.post("/login", response_model=schemas.Token)
def login(json: dict = None):
    payload = json or {}
    email = payload.get("email")
    password = payload.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Missing credentials")
    user = auth.authenticate_user(email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = auth.create_access_token(data={"sub": user["email"]})
    return schemas.Token(access_token=access_token)
