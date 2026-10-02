"""SQLAlchemy models for the finance tracker."""
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    receipts = relationship("Receipt", back_populates="owner", cascade="all, delete-orphan")
    mileages = relationship("Mileage", back_populates="owner", cascade="all, delete-orphan")

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    file_name = Column(String, nullable=False)
    file_data = Column(LargeBinary, nullable=False)
    owner = relationship("User", back_populates="receipts")

class Mileage(Base):
    __tablename__ = "mileages"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    distance_km = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    owner = relationship("User", back_populates="mileages")
