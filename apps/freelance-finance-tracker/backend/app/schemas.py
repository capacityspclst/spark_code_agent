"""Pydantic schemas for request and response bodies."""
from datetime import date
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ReceiptCreate(BaseModel):
    description: Optional[str] = None
    amount: float
    date: date

    @validator('amount')
    def amount_positive(cls, v):
        if v < 0:
            raise ValueError('Amount must be non‑negative')
        return v

class ReceiptOut(BaseModel):
    id: int
    description: Optional[str]
    amount: float
    date: date
    file_name: str

    class Config:
        orm_mode = True

class MileageCreate(BaseModel):
    date: date
    distance_km: float
    description: Optional[str] = None

    @validator('distance_km')
    def distance_non_negative(cls, v):
        if v < 0:
            raise ValueError('Distance must be non‑negative')
        return v

class MileageOut(BaseModel):
    id: int
    date: date
    distance_km: float
    description: Optional[str]

    class Config:
        orm_mode = True

class DashboardSummary(BaseModel):
    total_receipts: int
    total_mileage_km: float
    total_amount: float
