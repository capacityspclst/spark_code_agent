"""Pydantic schemas for request and response bodies."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from pydantic import ConfigDict

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: int  # UNIX timestamp

class TokenPayload(BaseModel):
    sub: int  # user id
    exp: int

class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Amount must be positive")
    description: Optional[str] = None
    date: datetime
    type: Optional[str] = Field(default="Income", description="Income or Expense")

class TransactionRead(BaseModel):
    id: int
    user_id: int
    amount: float
    description: Optional[str]
    date: datetime
    created_at: datetime
    type: str

    model_config = ConfigDict(from_attributes=True)
