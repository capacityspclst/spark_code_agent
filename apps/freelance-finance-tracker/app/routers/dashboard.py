"""Router providing dashboard summary endpoint."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func

from ..auth import get_current_user
from ..dependencies import get_session
from ..models import Receipt, Mileage
from ..schemas import DashboardSummary

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Total receipts and amount
    receipt_stmt = select(func.count(Receipt.id), func.coalesce(func.sum(Receipt.amount), 0))\
        .where(Receipt.user_id == current_user.id)
    receipt_count, total_amount = session.exec(receipt_stmt).one()
    # Total mileage
    mileage_stmt = select(func.coalesce(func.sum(Mileage.distance_km), 0))\
        .where(Mileage.user_id == current_user.id)
    total_mileage = session.exec(mileage_stmt).one()
    # Estimated reimbursement using configurable rate (default 0.5 per km)
    reimbursement_rate = 0.5
    estimated = float(total_mileage) * reimbursement_rate
    return DashboardSummary(
        total_receipts=receipt_count,
        total_amount=float(total_amount),
        total_mileage_km=float(total_mileage),
        estimated_reimbursement=estimated,
    )
