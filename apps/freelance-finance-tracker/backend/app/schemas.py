from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=12)

    @validator('password')
    def password_complexity(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError('Password must include at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must include at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must include at least one digit')
        if not any(not c.isalnum() for c in v):
            raise ValueError('Password must include at least one symbol')
        return v

class UserRead(BaseModel):
    id: int
    email: EmailStr
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ReceiptBase(BaseModel):
    amount: float = Field(...)
    date: date
    category: str
    notes: Optional[str] = Field(None, max_length=500)

class ReceiptCreate(ReceiptBase):
    pass

class ReceiptRead(ReceiptBase):
    id: int
    image_url: str
    model_config = ConfigDict(from_attributes=True)

class MileageBase(BaseModel):
    date: date
    miles: int = Field(..., gt=0)
    notes: Optional[str] = Field(None, max_length=500)

class MileageCreate(MileageBase):
    pass

class MileageRead(MileageBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class DashboardSummary(BaseModel):
    income: float
    expenses: float
    mileage_deduction: float
    estimated_tax: float
    model_config = ConfigDict(from_attributes=True)
