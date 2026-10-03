"""Pydantic schemas for request/response models."""
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ReceiptBase(BaseModel):
    amount: float
    date: date
    vendor: str
    category: str

class ReceiptCreate(ReceiptBase):
    pass

class ReceiptOut(ReceiptBase):
    id: int
    filename: str
    created_at: datetime

    class Config:
        orm_mode = True

class MileageBase(BaseModel):
    date: date
    start_location: str
    end_location: str
    distance_miles: float
    purpose: Optional[str] = None

class MileageCreate(MileageBase):
    pass

class MileageOut(MileageBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class MonthlySummary(BaseModel):
    month: str  # YYYY-MM
    income: float
    expenses: float

class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    total_mileage_deduction: float
    per_month: List[MonthlySummary]

    class Config:
        orm_mode = True
