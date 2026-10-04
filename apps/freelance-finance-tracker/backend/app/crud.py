from sqlalchemy.orm import Session
from . import models, schemas
from .auth import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user_in: schemas.UserCreate):
    hashed_pwd = get_password_hash(user_in.password)
    db_user = models.User(email=user_in.email, hashed_password=hashed_pwd)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def create_receipt(db: Session, user: models.User, receipt_in: schemas.ReceiptCreate, image_path: str):
    db_receipt = models.Receipt(
        user_id=user.id,
        amount=receipt_in.amount,
        date=receipt_in.date,
        category=receipt_in.category,
        notes=receipt_in.notes,
        image_path=image_path,
    )
    db.add(db_receipt)
    db.commit()
    db.refresh(db_receipt)
    return db_receipt

def get_receipts(db: Session, user: models.User):
    return db.query(models.Receipt).filter(models.Receipt.user_id == user.id).all()

def create_mileage(db: Session, user: models.User, mileage_in: schemas.MileageCreate):
    db_mileage = models.Mileage(
        user_id=user.id,
        date=mileage_in.date,
        miles=mileage_in.miles,
        notes=mileage_in.notes,
    )
    db.add(db_mileage)
    db.commit()
    db.refresh(db_mileage)
    return db_mileage

def get_mileages(db: Session, user: models.User):
    return db.query(models.Mileage).filter(models.Mileage.user_id == user.id).all()

def calculate_dashboard(db: Session, user: models.User):
    receipts = db.query(models.Receipt).filter(models.Receipt.user_id == user.id).all()
    income = sum(r.amount for r in receipts if r.amount > 0)
    expenses = sum(r.amount for r in receipts if r.amount < 0)
    total_miles = sum(m.miles for m in db.query(models.Mileage).filter(models.Mileage.user_id == user.id).all())
    mileage_deduction = total_miles * 0.585
    taxable = income - expenses - mileage_deduction
    estimated_tax = max(taxable, 0) * 0.30
    return schemas.DashboardSummary(
        income=income,
        expenses=expenses,
        mileage_deduction=mileage_deduction,
        estimated_tax=estimated_tax,
    )
