"""Simple model classes for the fintrack app. Used with the in‑memory store.
Only the fields accessed by the routers are defined.
"""
from dataclasses import dataclass
from datetime import date
from typing import Optional

@dataclass
class User:
    id: int
    email: str
    full_name: str
    hashed_password: str

@dataclass
class Receipt:
    id: int
    owner_id: int
    description: Optional[str]
    amount: float
    date: date
    file_name: str
    file_data: bytes

@dataclass
class Mileage:
    id: int
    owner_id: int
    date: date
    distance_km: float
    description: Optional[str]
