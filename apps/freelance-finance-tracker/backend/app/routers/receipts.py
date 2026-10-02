"""Receipt router handling upload and retrieval (stub implementation)."""
from fastapi import APIRouter, HTTPException

from .. import schemas, store, auth

router = APIRouter(prefix="/receipts", tags=["receipts"])

@router.post("/", response_model=schemas.ReceiptOut, status_code=201)
def upload_receipt(json: dict = None, files: dict = None, data: dict = None):
    # Extract fields from form-data (data) or json payload.
    payload = data or json or {}
    description = payload.get("description")
    amount = float(payload.get("amount", 0))
    date_str = payload.get("date")
    # Simple date parsing, ignore errors for stub.
    from datetime import datetime
    try:
        receipt_date = datetime.fromisoformat(date_str).date() if date_str else datetime.utcnow().date()
    except Exception:
        receipt_date = datetime.utcnow().date()
    # File handling: get first file name if provided.
    file_info = files.get('file') if files else None
    file_name = file_info[0] if file_info else "receipt.jpg"
    file_bytes = b""
    # Store receipt using in‑memory store.
    receipt = store.add_receipt(
        owner_email=auth.get_current_user().email if hasattr(auth, 'get_current_user') else "",
        description=description,
        amount=amount,
        receipt_date=receipt_date,
        file_name=file_name,
        file_data=file_bytes,
    )
    # Convert to Pydantic model
    return schemas.ReceiptOut(
        id=receipt["id"],
        description=receipt["description"],
        amount=receipt["amount"],
        date=receipt["date"],
        file_name=receipt["file_name"],
    )

@router.get("/{receipt_id}", response_model=schemas.ReceiptOut)
def get_receipt(receipt_id: int):
    # For stub, just retrieve from store by id.
    # In real app, would check ownership.
    receipt = store._RECEIPTS.get(receipt_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return schemas.ReceiptOut(
        id=receipt["id"],
        description=receipt["description"],
        amount=receipt["amount"],
        date=receipt["date"],
        file_name=receipt["file_name"],
    )
