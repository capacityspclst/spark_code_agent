"""Router providing dashboard summary endpoint."""
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..auth import get_current_user
from ..dependencies import get_session
from ..models import Receipt, Mileage, User
from ..schemas import DashboardSummary

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Compute totals manually
    receipts = session.exec(select(Receipt).where(Receipt.user_id == current_user.id)).all()
    total_receipts = len(receipts)
    total_amount = sum(r.amount for r in receipts) if receipts else 0.0
    mileages = session.exec(select(Mileage).where(Mileage.user_id == current_user.id)).all()
    total_mileage = sum(m.distance_km for m in mileages) if mileages else 0.0
    reimbursement_rate = 0.5
    estimated = total_mileage * reimbursement_rate
    return DashboardSummary(
        total_receipts=total_receipts,
        total_amount=total_amount,
        total_mileage_km=total_mileage,
        estimated_reimbursement=estimated,
    )
