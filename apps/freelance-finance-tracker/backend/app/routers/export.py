"""Export router for CSV and PDF generation using the in‑memory store."""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from io import BytesIO
import csv

from .. import store, auth

router = APIRouter(prefix="/export", tags=["export"])

def generate_csv(user_email: str) -> BytesIO:
    output = BytesIO()
    writer = csv.writer(output)
    writer.writerow(["type", "date", "description", "amount", "distance_km"])
    # Receipts
    for r in store.get_receipts(user_email):
        writer.writerow([
            "receipt",
            r["date"].isoformat() if hasattr(r["date"], "isoformat") else str(r["date"]),
            r.get("description") or "",
            f"{r['amount']:.2f}",
            "",
        ])
    # Mileages
    for m in store.get_mileages(user_email):
        writer.writerow([
            "mileage",
            m["date"].isoformat() if hasattr(m["date"], "isoformat") else str(m["date"]),
            m.get("description") or "",
            "",
            f"{m['distance_km']:.2f}",
        ])
    output.seek(0)
    return output

def generate_pdf_placeholder() -> BytesIO:
    # Minimal static PDF content (valid PDF header/footer)
    pdf_bytes = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF"
    return BytesIO(pdf_bytes)

@router.get("/csv", response_class=StreamingResponse)
def export_csv(headers: dict = None):
    user = auth.get_user_from_headers(headers or {})
    csv_io = generate_csv(user["email"])
    return StreamingResponse(csv_io, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=fintrack.csv"})

@router.get("/pdf", response_class=StreamingResponse)
def export_pdf(headers: dict = None):
    # For stub we ignore user data
    pdf_io = generate_pdf_placeholder()
    return StreamingResponse(pdf_io, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=fintrack.pdf"})
