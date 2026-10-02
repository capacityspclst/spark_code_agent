"""Dashboard router providing summary data for the authenticated user."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import schemas, models, auth, database

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=schemas.DashboardSummary)
def get_summary(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # Total receipts count and sum of amounts
    receipt_stats = db.query(func.count(models.Receipt.id), func.coalesce(func.sum(models.Receipt.amount), 0.0)).filter(models.Receipt.owner_id == current_user.id).one()
    total_receipts = receipt_stats[0]
    total_amount = float(receipt_stats[1])
    # Total mileage sum
    mileage_sum = db.query(func.coalesce(func.sum(models.Mileage.distance_km), 0.0)).filter(models.Mileage.owner_id == current_user.id).scalar()
    total_mileage_km = float(mileage_sum)
    return schemas.DashboardSummary(
        total_receipts=total_receipts,
        total_mileage_km=total_mileage_km,
        total_amount=total_amount,
    )
