"""Export routes: PDF and CSV generation."""
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from .. import models, database, dependencies
from ..pdf_generator import generate_pdf
from ..csv_generator import generate_csv
import datetime

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/pdf")
def export_pdf(current_user: models.User = Depends(dependencies.get_current_user), db: Session = Depends(database.get_db)):
    from ..routers.dashboard import get_summary
    summary = get_summary(current_user=current_user, db=db)
    pdf_bytes = generate_pdf(summary)
    filename = f"summary_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
    return StreamingResponse(
        pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

@router.get("/csv")
def export_csv(current_user: models.User = Depends(dependencies.get_current_user), db: Session = Depends(database.get_db)):
    from ..routers.dashboard import get_summary
    summary = get_summary(current_user=current_user, db=db)
    csv_bytes = generate_csv(summary)
    filename = f"summary_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
