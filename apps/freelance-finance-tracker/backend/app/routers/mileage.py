"""Mileage router stub using in‑memory store."""
from fastapi import APIRouter, HTTPException

from .. import schemas, store, auth

router = APIRouter(prefix="/mileage", tags=["mileage"])

@router.post("/", response_model=schemas.MileageOut, status_code=201)
def create_mileage(json: dict = None, data: dict = None, headers: dict = None):
    # Authentication via headers
    user = auth.get_user_from_headers(headers or {})
    payload = data or json or {}
    date_str = payload.get("date")
    distance = float(payload.get("distance_km", 0))
    description = payload.get("description")
    from datetime import datetime
    try:
        entry_date = datetime.fromisoformat(date_str).date() if date_str else datetime.utcnow().date()
    except Exception:
        entry_date = datetime.utcnow().date()
    mileage = store.add_mileage(user["email"], entry_date, distance, description)
    return schemas.MileageOut(id=mileage["id"], date=mileage["date"], distance_km=mileage["distance_km"], description=mileage["description"])

@router.get("/{mileage_id}", response_model=schemas.MileageOut)
def get_mileage(mileage_id: int, headers: dict = None):
    # simple lookup, no ownership check for stub
    mileage = store._MILEAGES.get(mileage_id)
    if not mileage:
        raise HTTPException(status_code=404, detail="Mileage not found")
    return schemas.MileageOut(id=mileage["id"], date=mileage["date"], distance_km=mileage["distance_km"], description=mileage["description"])
