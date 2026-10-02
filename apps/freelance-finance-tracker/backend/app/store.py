"""Simple in‑memory storage for the FastAPI stub implementation.
This replaces a real database for the purpose of the acceptance tests.
All data is kept in module‑level dictionaries keyed by incremental integers.
"""
from typing import Dict
from datetime import date

# Users: email -> dict with id, full_name, hashed_password
_USERS: Dict[str, Dict] = {}
_NEXT_USER_ID = 1

# Receipts: id -> dict with owner_email, description, amount, date, file_name, file_data
_RECEIPTS: Dict[int, Dict] = {}
_NEXT_RECEIPT_ID = 1

# Mileages: id -> dict with owner_email, date, distance_km, description
_MILEAGES: Dict[int, Dict] = {}
_NEXT_MILEAGE_ID = 1

def add_user(email: str, full_name: str, hashed_password: str):
    global _NEXT_USER_ID
    if email in _USERS:
        raise ValueError("User exists")
    user = {"id": _NEXT_USER_ID, "email": email, "full_name": full_name, "hashed_password": hashed_password}
    _USERS[email] = user
    _NEXT_USER_ID += 1
    return user

def get_user(email: str):
    return _USERS.get(email)

def verify_password(plain: str, hashed: str) -> bool:
    # Simple reversible hash used by the auth stub (plain == hashed for simplicity)
    return plain == hashed

def add_receipt(owner_email: str, description: str, amount: float, receipt_date: date, file_name: str, file_data: bytes):
    global _NEXT_RECEIPT_ID
    receipt = {
        "id": _NEXT_RECEIPT_ID,
        "owner_email": owner_email,
        "description": description,
        "amount": amount,
        "date": receipt_date,
        "file_name": file_name,
        "file_data": file_data,
    }
    _RECEIPTS[_NEXT_RECEIPT_ID] = receipt
    _NEXT_RECEIPT_ID += 1
    return receipt

def get_receipt(receipt_id: int, owner_email: str):
    r = _RECEIPTS.get(receipt_id)
    if r and r["owner_email"] == owner_email:
        return r
    return None

def add_mileage(owner_email: str, mileage_date: date, distance_km: float, description: str):
    global _NEXT_MILEAGE_ID
    mileage = {
        "id": _NEXT_MILEAGE_ID,
        "owner_email": owner_email,
        "date": mileage_date,
        "distance_km": distance_km,
        "description": description,
    }
    _MILEAGES[_NEXT_MILEAGE_ID] = mileage
    _NEXT_MILEAGE_ID += 1
    return mileage

def get_mileages(owner_email: str):
    return [m for m in _MILEAGES.values() if m["owner_email"] == owner_email]

def get_receipts(owner_email: str):
    return [r for r in _RECEIPTS.values() if r["owner_email"] == owner_email]
