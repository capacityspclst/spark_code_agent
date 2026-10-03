"""Generate CSV data for receipts and mileage entries.
Returns a BytesIO containing the CSV.
"""
import csv
from io import BytesIO
from . import schemas

def generate_csv(summary: schemas.DashboardSummary) -> BytesIO:
    output = BytesIO()
    writer = csv.writer(output)
    # Write header for summary
    writer.writerow(["total_income", "total_expenses", "total_mileage_deduction"])
    writer.writerow([
        f"{summary.total_income:.2f}",
        f"{summary.total_expenses:.2f}",
        f"{summary.total_mileage_deduction:.2f}",
    ])
    # Write per-month breakdown
    writer.writerow([])
    writer.writerow(["month", "income", "expenses"])
    for m in summary.per_month:
        writer.writerow([m.month, f"{m.income:.2f}", f"{m.expenses:.2f}"])
    output.seek(0)
    return output
