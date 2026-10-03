"""Dashboard route: summary aggregation."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from collections import defaultdict

from .. import models, schemas, database, dependencies, config

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=schemas.DashboardSummary)
def get_summary(current_user: models.User = Depends(dependencies.get_current_user), db: Session = Depends(database.get_db)):
    # Receipts
    receipts = db.query(models.Receipt).filter(models.Receipt.user_id == current_user.id).all()
    total_expenses = sum(r.amount for r in receipts)
    # Assuming no income entries; set to 0
    total_income = 0.0
    # Mileage entries
    mileage_entries = db.query(models.MileageEntry).filter(models.MileageEntry.user_id == current_user.id).all()
    total_miles = sum(m.distance_miles for m in mileage_entries)
    total_mileage_deduction = total_miles * config.settings.MILEAGE_RATE
    # Per month breakdown
    per_month_dict = defaultdict(lambda: {"income": 0.0, "expenses": 0.0})
    for r in receipts:
        month_key = r.date.strftime("%Y-%m")
        per_month_dict[month_key]["expenses"] += r.amount
    # No income records, skip
    per_month = []
    for month, vals in sorted(per_month_dict.items()):
        per_month.append(schemas.MonthlySummary(month=month, income=vals["income"], expenses=vals["expenses"]))
    return schemas.DashboardSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        total_mileage_deduction=total_mileage_deduction,
        per_month=per_month,
    )
