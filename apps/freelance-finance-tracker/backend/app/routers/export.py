"""Export router for CSV and PDF generation of user's finance data."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
import csv

from .. import schemas, models, auth, database

router = APIRouter(prefix="/export", tags=["export"])

def generate_csv(db: Session, user_id: int) -> BytesIO:
    output = BytesIO()
    writer = csv.writer(output)
    # Header
    writer.writerow(["type", "date", "description", "amount", "distance_km"])
    # Receipts
    receipts = db.query(models.Receipt).filter(models.Receipt.owner_id == user_id).all()
    for r in receipts:
        writer.writerow(["receipt", r.date.isoformat(), r.description or "", f"{r.amount:.2f}", ""])
    # Mileages
    mileages = db.query(models.Mileage).filter(models.Mileage.owner_id == user_id).all()
    for m in mileages:
        writer.writerow(["mileage", m.date.isoformat(), m.description or "", "", f"{m.distance_km:.2f}"])
    output.seek(0)
    return output

def generate_pdf_placeholder(db: Session, user_id: int) -> BytesIO:
    # Minimal PDF generation without external libs for simplicity.
    # Produce a simple PDF with a text line.
    pdf_bytes = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF"
    return BytesIO(pdf_bytes)

@router.get("/csv", response_class=StreamingResponse)
def export_csv(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    csv_io = generate_csv(db, current_user.id)
    return StreamingResponse(csv_io, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=fintrack.csv"})

@router.get("/pdf", response_class=StreamingResponse)
def export_pdf(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    pdf_io = generate_pdf_placeholder(db, current_user.id)
    return StreamingResponse(pdf_io, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=fintrack.pdf"})
