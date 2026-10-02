"""Router for mileage CRUD operations."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..auth import get_current_user
from ..dependencies import get_session
from ..models import Mileage, User
from ..schemas import MileageCreate, MileageResponse

router = APIRouter()

@router.post("/", response_model=MileageResponse, status_code=status.HTTP_201_CREATED)
def create_mileage(
    payload: MileageCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    mileage = Mileage(
        user_id=current_user.id,
        date=payload.date,
        distance_km=payload.distance_km,
        description=payload.description,
    )
    session.add(mileage)
    session.commit()
    session.refresh(mileage)
    return mileage

@router.get("/", response_model=list[MileageResponse])
def list_mileage(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    records = session.exec(select(Mileage).where(Mileage.user_id == current_user.id)).all()
    return records

@router.delete("/{mileage_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mileage(
    mileage_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    record = session.get(Mileage, mileage_id)
    if not record or record.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Mileage not found")
    session.delete(record)
    session.commit()
    return None
