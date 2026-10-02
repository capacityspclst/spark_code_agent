"""Receipt router handling upload and retrieval (basic)."""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from datetime import datetime

from .. import schemas, models, auth, database

router = APIRouter(prefix="/receipts", tags=["receipts"])

@router.post("/", response_model=schemas.ReceiptOut, status_code=201)
async def upload_receipt(
    description: str = Form(None),
    amount: float = Form(...),
    date: str = Form(...),
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    # Validate file type (simple check)
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type; only images allowed")
    try:
        parsed_date = datetime.fromisoformat(date).date()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format")
    file_bytes = await file.read()
    receipt = models.Receipt(
        owner_id=current_user.id,
        description=description,
        amount=amount,
        date=parsed_date,
        file_name=file.filename,
        file_data=file_bytes,
    )
    db.add(receipt)
    db.commit()
    db.refresh(receipt)
    return schemas.ReceiptOut.from_orm(receipt)

@router.get("/{receipt_id}", response_model=schemas.ReceiptOut)
def get_receipt(receipt_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    receipt = db.query(models.Receipt).filter(models.Receipt.id == receipt_id, models.Receipt.owner_id == current_user.id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return schemas.ReceiptOut.from_orm(receipt)
