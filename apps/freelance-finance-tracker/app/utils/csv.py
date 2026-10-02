"""CSV generation utility for dashboard summary."""
import csv
from io import StringIO, BytesIO
from . import __init__  # noqa: F401
from ..schemas import DashboardSummary

def generate_csv_bytes(summary: DashboardSummary) -> bytes:
    output = StringIO()
    writer = csv.writer(output)
    # Header
    writer.writerow([
        "total_receipts",
        "total_amount",
        "total_mileage_km",
        "estimated_reimbursement",
    ])
    # Data row
    writer.writerow([
        summary.total_receipts,
        f"{summary.total_amount:.2f}",
        f"{summary.total_mileage_km:.2f}",
        f"{summary.estimated_reimbursement:.2f}",
    ])
    return output.getvalue().encode("utf-8")
