"""Mileage router for CRUD operations."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import schemas, models, auth, database

router = APIRouter(prefix="/mileage", tags=["mileage"])

@router.post("/", response_model=schemas.MileageOut, status_code=201)
def create_mileage(entry: schemas.MileageCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    mileage = models.Mileage(
        owner_id=current_user.id,
        date=entry.date,
        distance_km=entry.distance_km,
        description=entry.description,
    )
    db.add(mileage)
    db.commit()
    db.refresh(mileage)
    return schemas.MileageOut.from_orm(mileage)

@router.get("/{mileage_id}", response_model=schemas.MileageOut)
def get_mileage(mileage_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    mileage = db.query(models.Mileage).filter(models.Mileage.id == mileage_id, models.Mileage.owner_id == current_user.id).first()
    if not mileage:
        raise HTTPException(status_code=404, detail="Mileage not found")
    return schemas.MileageOut.from_orm(mileage)
