"""Router for exporting dashboard data as CSV or PDF."""
from fastapi import APIRouter, Depends, Response
from sqlmodel import Session, select

from ..auth import get_current_user
from ..dependencies import get_session
from ..schemas import DashboardSummary
from ..utils.csv import generate_csv_bytes
from ..utils.pdf import generate_pdf_bytes
from ..models import User

router = APIRouter()

def get_summary_data(current_user, session: Session):
    # Reuse logic similar to dashboard router without func
    from ..models import Receipt, Mileage
    # Receipts
    receipts = session.exec(select(Receipt).where(Receipt.user_id == current_user.id)).all()
    total_receipts = len(receipts)
    total_amount = sum(r.amount for r in receipts) if receipts else 0.0
    # Mileage
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

@router.get("/csv", response_class=Response)
def export_csv(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    summary = get_summary_data(current_user, session)
    csv_bytes = generate_csv_bytes(summary)
    return Response(content=csv_bytes, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=summary.csv"})

@router.get("/pdf", response_class=Response)
def export_pdf(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    summary = get_summary_data(current_user, session)
    pdf_bytes = generate_pdf_bytes(summary)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=summary.pdf"})
