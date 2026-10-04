"""FastAPI application entry point with routes for authentication and transaction management."""

from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas, crud, auth, config
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Freelance Finance Tracker API")

# CORS configuration – allow Vite dev server and any origin via env var
origins = [
    "http://localhost:5173",
]
if config.settings.DATABASE_URL:
    # placeholder for production allowed origins via env var (not implemented)
    pass

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Auth routes ----------
@app.post("/register", response_model=schemas.UserRead)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = crud.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    # Password strength validated in schema
    user = crud.create_user(db, user_in)
    return schemas.UserRead.from_orm(user)

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2PasswordRequestForm provides username & password fields
    db = next(get_db())
    user = crud.get_user_by_email(db, form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    if not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    access_token = auth.create_access_token(data={"sub": user.id})
    # Decode to get expiration timestamp
    payload = auth.decode_token(access_token)
    return schemas.Token(access_token=access_token, expires_at=payload.exp)

# ---------- Transaction routes (protected) ----------
@app.get("/transactions", response_model=list[schemas.TransactionRead])
def read_transactions(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    txns = crud.get_transactions(db, current_user.id)
    return [schemas.TransactionRead.from_orm(t) for t in txns]

@app.post("/transactions", response_model=schemas.TransactionRead, status_code=201)
def create_transaction(
    txn_in: schemas.TransactionCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    txn = crud.create_transaction(db, current_user.id, txn_in)
    return schemas.TransactionRead.from_orm(txn)

@app.get("/transactions/{txn_id}", response_model=schemas.TransactionRead)
def get_transaction(
    txn_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    txn = crud.get_transaction(db, current_user.id, txn_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return schemas.TransactionRead.from_orm(txn)

@app.put("/transactions/{txn_id}", response_model=schemas.TransactionRead)
def update_transaction(
    txn_id: int,
    txn_in: schemas.TransactionCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    db_txn = crud.get_transaction(db, current_user.id, txn_id)
    if not db_txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    updated = crud.update_transaction(db, db_txn, txn_in)
    return schemas.TransactionRead.from_orm(updated)

@app.delete("/transactions/{txn_id}")
def delete_transaction(
    txn_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    db_txn = crud.get_transaction(db, current_user.id, txn_id)
    if not db_txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    crud.delete_transaction(db, db_txn)
    return {"detail": "Transaction deleted"}

# ---------- ui-backend.json auto‑generation ----------
import json, os

UI_BACKEND_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "ui", "ui-backend.json")

def ensure_ui_backend_file():
    if not os.path.isfile(UI_BACKEND_PATH):
        data = {"apiBaseUrl": os.getenv("API_BASE_URL", "http://localhost:8000")}
        os.makedirs(os.path.dirname(UI_BACKEND_PATH), exist_ok=True)
        with open(UI_BACKEND_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

ensure_ui_backend_file()
