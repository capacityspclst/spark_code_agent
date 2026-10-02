"""Pydantic schemas for request and response bodies."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ReceiptCreate(BaseModel):
    amount: float
    date: Optional[datetime] = None

class ReceiptResponse(BaseModel):
    id: int
    filename: str
    amount: float
    uploaded_at: datetime

class MileageCreate(BaseModel):
    date: datetime
    distance_km: float
    description: Optional[str] = None

class MileageResponse(BaseModel):
    id: int
    date: datetime
    distance_km: float
    description: Optional[str] = None

class DashboardSummary(BaseModel):
    total_receipts: int
    total_amount: float
    total_mileage_km: float
    estimated_reimbursement: float
