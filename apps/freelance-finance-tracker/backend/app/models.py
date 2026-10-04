from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    receipts = relationship("Receipt", back_populates="owner", cascade="all, delete-orphan")
    mileages = relationship("Mileage", back_populates="owner", cascade="all, delete-orphan")

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    category = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    image_path = Column(String, nullable=False)
    owner = relationship("User", back_populates="receipts")

class Mileage(Base):
    __tablename__ = "mileages"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    miles = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    owner = relationship("User", back_populates="mileages")
