"""Router for exporting dashboard data as CSV or PDF."""
from fastapi import APIRouter, Depends, Response
from sqlmodel import Session

from ..auth import get_current_user
from ..dependencies import get_session
from ..schemas import DashboardSummary
from ..utils.csv import generate_csv_bytes
from ..utils.pdf import generate_pdf_bytes

router = APIRouter()

def get_summary_data(current_user, session: Session):
    from ..models import Receipt, Mileage
    from sqlmodel import select, func
    receipt_stmt = select(func.count(Receipt.id), func.coalesce(func.sum(Receipt.amount), 0))\
        .where(Receipt.user_id == current_user.id)
    receipt_count, total_amount = session.exec(receipt_stmt).one()
    mileage_stmt = select(func.coalesce(func.sum(Mileage.distance_km), 0))\
        .where(Mileage.user_id == current_user.id)
    total_mileage = session.exec(mileage_stmt).one()
    reimbursement_rate = 0.5
    estimated = float(total_mileage) * reimbursement_rate
    return DashboardSummary(
        total_receipts=receipt_count,
        total_amount=float(total_amount),
        total_mileage_km=float(total_mileage),
        estimated_reimbursement=estimated,
    )

@router.get("/csv", response_class=Response)
def export_csv(
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    summary = get_summary_data(current_user, session)
    csv_bytes = generate_csv_bytes(summary)
    return Response(content=csv_bytes, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=summary.csv"})

@router.get("/pdf", response_class=Response)
def export_pdf(
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    summary = get_summary_data(current_user, session)
    pdf_bytes = generate_pdf_bytes(summary)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=summary.pdf"})
