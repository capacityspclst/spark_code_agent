"""CRUD helper functions for users and transactions."""

from sqlalchemy.orm import Session
from . import models, schemas
from .auth import get_password_hash
from typing import List, Optional

# User CRUD

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    # Assume password validation already done in endpoint
    hashed = get_password_hash(user_in.password)
    db_user = models.User(email=user_in.email, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Transaction CRUD

def get_transactions(db: Session, user_id: int) -> List[models.Transaction]:
    return db.query(models.Transaction).filter(models.Transaction.user_id == user_id).all()

def get_transaction(db: Session, user_id: int, txn_id: int) -> Optional[models.Transaction]:
    return (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == user_id, models.Transaction.id == txn_id)
        .first()
    )

def create_transaction(db: Session, user_id: int, txn_in: schemas.TransactionCreate) -> models.Transaction:
    db_txn = models.Transaction(
        user_id=user_id,
        amount=txn_in.amount,
        description=txn_in.description,
        date=txn_in.date,
        type=txn_in.type or "Income",
    )
    db.add(db_txn)
    db.commit()
    db.refresh(db_txn)
    return db_txn

def update_transaction(db: Session, db_txn: models.Transaction, txn_in: schemas.TransactionCreate) -> models.Transaction:
    db_txn.amount = txn_in.amount
    db_txn.description = txn_in.description
    db_txn.date = txn_in.date
    if txn_in.type:
        db_txn.type = txn_in.type
    db.commit()
    db.refresh(db_txn)
    return db_txn

def delete_transaction(db: Session, db_txn: models.Transaction) -> None:
    db.delete(db_txn)
    db.commit()
