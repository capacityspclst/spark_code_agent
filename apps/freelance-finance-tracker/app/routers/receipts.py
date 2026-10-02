"""Router for receipt upload and management."""
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlmodel import Session, select

from ..auth import get_current_user
from ..dependencies import get_session
from ..models import Receipt
from ..schemas import ReceiptResponse
from ..utils.storage import StorageService

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ReceiptResponse)
async def upload_receipt(
    file: UploadFile = File(...),
    amount: float = Form(...),
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
    storage: StorageService = Depends(lambda: StorageService()),
):
    try:
        filename = storage.save(file)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to store file")
    receipt = Receipt(user_id=current_user.id, filename=filename, amount=amount)
    session.add(receipt)
    session.commit()
    session.refresh(receipt)
    return receipt

@router.get("/", response_model=list[ReceiptResponse])
def list_receipts(
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    receipts = session.exec(select(Receipt).where(Receipt.user_id == current_user.id)).all()
    return receipts

@router.delete("/{receipt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_receipt(
    receipt_id: int,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
    storage: StorageService = Depends(lambda: StorageService()),
):
    receipt = session.get(Receipt, receipt_id)
    if not receipt or receipt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Receipt not found")
    storage.delete(receipt.filename)
    session.delete(receipt)
    session.commit()
    return None
