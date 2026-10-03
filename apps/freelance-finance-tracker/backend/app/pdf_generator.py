"""Generate a simple PDF export using reportlab.
The PDF includes a title and a table of the dashboard summary.
"""
from io import BytesIO
from reportlab.lib.pagesizes import LETTER
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from . import schemas

def generate_pdf(summary: schemas.DashboardSummary) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=LETTER)
    styles = getSampleStyleSheet()
    elements = []
    elements.append(Paragraph("Freelance Finance Tracker – Summary", styles["Title"]))
    elements.append(Spacer(1, 12))
    data = [
        ["Total Income", f"${summary.total_income:,.2f}"],
        ["Total Expenses", f"${summary.total_expenses:,.2f}"],
        ["Mileage Deduction", f"${summary.total_mileage_deduction:,.2f}"],
    ]
    t = Table(data, hAlign="LEFT")
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ]
        )
    )
    elements.append(t)
    elements.append(Spacer(1, 24))
    # Monthly breakdown
    elements.append(Paragraph("Per‑Month Breakdown", styles["Heading2"]))
    month_data = [["Month", "Income", "Expenses"]]
    for m in summary.per_month:
        month_data.append([m.month, f"${m.income:,.2f}", f"${m.expenses:,.2f}"])
    month_table = Table(month_data, hAlign="LEFT")
    month_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]
        )
    )
    elements.append(month_table)
    doc.build(elements)
    buffer.seek(0)
    return buffer
