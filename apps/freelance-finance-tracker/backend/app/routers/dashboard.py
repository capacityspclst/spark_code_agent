"""Dashboard router providing summary data using the in‑memory store."""
from fastapi import APIRouter

from .. import schemas, store, auth

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=schemas.DashboardSummary)
def get_summary(headers: dict = None):
    # Authenticate user from Authorization header
    user = auth.get_user_from_headers(headers or {})
    # Gather data from the store
    receipts = store.get_receipts(user["email"])
    total_receipts = len(receipts)
    total_amount = sum(r["amount"] for r in receipts)
    mileages = store.get_mileages(user["email"])
    total_mileage_km = sum(m["distance_km"] for m in mileages)
    return schemas.DashboardSummary(
        total_receipts=total_receipts,
        total_mileage_km=total_mileage_km,
        total_amount=total_amount,
    )
