"""SQLAlchemy ORM models."""
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    vendor = Column(String, nullable=False)
    category = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MileageEntry(Base):
    __tablename__ = "mileage_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    start_location = Column(String, nullable=False)
    end_location = Column(String, nullable=False)
    distance_miles = Column(Float, nullable=False)
    purpose = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
