"""Pydantic schemas for request and response bodies.
Only minimal fields needed for the tests are defined.
"""
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

class UserRead(BaseModel):
    id: int
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    sub: Optional[int] = None

# Transaction schemas could be added later if needed.
