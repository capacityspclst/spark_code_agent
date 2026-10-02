"""SQLModel models for the freelance finance tracker."""
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False)
    hashed_password: str = Field(nullable=False)

class Receipt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", nullable=False)
    filename: str = Field(nullable=False)
    amount: float = Field(nullable=False)
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class Mileage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", nullable=False)
    date: datetime = Field(nullable=False)
    distance_km: float = Field(nullable=False)
    description: Optional[str] = None
