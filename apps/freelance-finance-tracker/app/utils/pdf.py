"""PDF generation utility for dashboard summary.
Provides a fallback implementation if ReportLab is not installed.
"""
from io import BytesIO

try:
    from reportlab.lib.pagesizes import LETTER
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    _reportlab_available = True
except Exception:  # pragma: no cover
    _reportlab_available = False

from ..schemas import DashboardSummary

def generate_pdf_bytes(summary: DashboardSummary) -> bytes:
    if _reportlab_available:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=LETTER)
        styles = getSampleStyleSheet()
        elements = []
        elements.append(Paragraph("Freelance Finance Tracker Summary", styles["Title"]))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(f"Total Receipts: {summary.total_receipts}", styles["Normal"]))
        elements.append(Paragraph(f"Total Amount: ${summary.total_amount:,.2f}", styles["Normal"]))
        elements.append(Paragraph(f"Total Mileage (km): {summary.total_mileage_km:.2f}", styles["Normal"]))
        elements.append(Paragraph(f"Estimated Reimbursement: ${summary.estimated_reimbursement:,.2f}", styles["Normal"]))
        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
    # Fallback minimal PDF content
    return b"%PDF-1.4\n%\n"  # minimal PDF header
