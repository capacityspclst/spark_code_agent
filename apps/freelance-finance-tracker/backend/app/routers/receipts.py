"""Receipt routes: upload, list, retrieve, delete."""
import os
import shutil
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from .. import models, schemas, database, dependencies, config

router = APIRouter(prefix="/receipts", tags=["receipts"])

@router.post("", response_model=schemas.ReceiptOut)
async def upload_receipt(
    file: UploadFile = File(...),
    amount: float = Form(...),
    date: str = Form(...),
    vendor: str = Form(...),
    category: str = Form(...),
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db),
):
    # Ensure upload directory exists
    os.makedirs(config.settings.UPLOAD_DIR, exist_ok=True)
    # Simple filename safe handling
    filename = f"{int(datetime.utcnow().timestamp())}_{file.filename}"
    file_path = os.path.join(config.settings.UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    receipt = models.Receipt(
        user_id=current_user.id,
        filename=filename,
        amount=amount,
        date=datetime.strptime(date, "%Y-%m-%d").date(),
        vendor=vendor,
        category=category,
    )
    db.add(receipt)
    db.commit()
    db.refresh(receipt)
    return receipt

@router.get("", response_model=list[schemas.ReceiptOut])
def list_receipts(current_user: models.User = Depends(dependencies.get_current_user), db: Session = Depends(database.get_db)):
    receipts = db.query(models.Receipt).filter(models.Receipt.user_id == current_user.id).all()
    return receipts

@router.get("/{receipt_id}", response_model=schemas.ReceiptOut)
def get_receipt(receipt_id: int, current_user: models.User = Depends(dependencies.get_current_user), db: Session = Depends(database.get_db)):
    receipt = db.query(models.Receipt).filter(models.Receipt.id == receipt_id, models.Receipt.user_id == current_user.id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return receipt

@router.delete("/{receipt_id}")
def delete_receipt(receipt_id: int, current_user: models.User = Depends(dependencies.get_current_user), db: Session = Depends(database.get_db)):
    receipt = db.query(models.Receipt).filter(models.Receipt.id == receipt_id, models.Receipt.user_id == current_user.id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    # Delete file if exists
    file_path = os.path.join(config.settings.UPLOAD_DIR, receipt.filename)
    if os.path.isfile(file_path):
        os.remove(file_path)
    db.delete(receipt)
    db.commit()
    return {"detail": "Deleted"}
