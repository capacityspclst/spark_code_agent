from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=12)

class UserRead(BaseModel):
    id: int
    email: EmailStr
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ReceiptBase(BaseModel):
    # Allow both positive (income) and negative (expense) amounts
    amount: float = Field(...)
    date: date
    category: str
    notes: Optional[str] = None

class ReceiptCreate(ReceiptBase):
    pass

class ReceiptRead(ReceiptBase):
    id: int
    image_url: str
    class Config:
        orm_mode = True

class MileageBase(BaseModel):
    date: date
    miles: int = Field(..., gt=0)
    notes: Optional[str] = None

class MileageCreate(MileageBase):
    pass

class MileageRead(MileageBase):
    id: int
    class Config:
        orm_mode = True

class DashboardSummary(BaseModel):
    income: float
    expenses: float
    mileage_deduction: float
    estimated_tax: float
