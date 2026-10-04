"""Pydantic schemas for request and response bodies."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator
from pydantic import ConfigDict

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str

    @validator("password")
    def password_strength(cls, v: str) -> str:
        # Enforce at least 12 chars, upper, lower, digit, symbol
        if len(v) < 12:
            raise ValueError("Password must be at least 12 characters.")
        if not any(c.islower() for c in v):
            raise ValueError("Password must include a lower‑case letter.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must include an upper‑case letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must include a digit.")
        if not any(not c.isalnum() for c in v):
            raise ValueError("Password must include a symbol.")
        return v

    @validator("confirm_password")
    def passwords_match(cls, v: str, values):
        pw = values.get("password")
        if pw is not None and v != pw:
            raise ValueError("Passwords do not match.")
        return v

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
    type: str = Field(..., description="Income or Expense")

class TransactionRead(BaseModel):
    id: int
    user_id: int
    amount: float
    description: Optional[str]
    date: datetime
    created_at: datetime
    type: str

    model_config = ConfigDict(from_attributes=True)
