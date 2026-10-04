"""FastAPI application entry point with routes for authentication and transaction management."""

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas, crud, auth
from .database import get_db

app = FastAPI(title="Freelance Finance Tracker API")

# CORS configuration – allow Vite dev server
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
def health() -> dict:
    return {"status": "ok"}

def validate_password_strength(pwd: str) -> None:
    if len(pwd) < 12:
        raise HTTPException(status_code=400, detail="Password must be at least 12 characters.")
    if not any(c.islower() for c in pwd):
        raise HTTPException(status_code=400, detail="Password must include a lower‑case letter.")
    if not any(c.isupper() for c in pwd):
        raise HTTPException(status_code=400, detail="Password must include an upper‑case letter.")
    if not any(c.isdigit() for c in pwd):
        raise HTTPException(status_code=400, detail="Password must include a digit.")
    if not any(not c.isalnum() for c in pwd):
        raise HTTPException(status_code=400, detail="Password must include a symbol.")

# ---------- Auth routes ----------
@app.post("/register", response_model=schemas.UserRead)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Password confirmation check
    if user_in.password != user_in.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
    # Password strength validation
    validate_password_strength(user_in.password)
    # Check if email already exists
    existing = crud.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    user = crud.create_user(db, user_in)
    return schemas.UserRead.from_orm(user)

@app.post("/login", response_model=schemas.Token)
async def login(request: Request):
    # Support both JSON and form data
    try:
        data = await request.json()
        username = data.get("email") or data.get("username")
        password = data.get("password")
    except Exception:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    db = next(get_db())
    user = crud.get_user_by_email(db, username)
    if not user or not auth.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    access_token = auth.create_access_token(data={"sub": user.id})
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
