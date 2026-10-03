"""Mileage routes: create and list mileage entries."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, database, dependencies

router = APIRouter(prefix="/mileage", tags=["mileage"])

@router.post("", response_model=schemas.MileageOut)
def create_mileage(entry: schemas.MileageCreate, current_user: models.User = Depends(dependencies.get_current_user), db: Session = Depends(database.get_db)):
    mileage = models.MileageEntry(
        user_id=current_user.id,
        date=entry.date,
        start_location=entry.start_location,
        end_location=entry.end_location,
        distance_miles=entry.distance_miles,
        purpose=entry.purpose,
    )
    db.add(mileage)
    db.commit()
    db.refresh(mileage)
    return mileage

@router.get("", response_model=list[schemas.MileageOut])
def list_mileage(current_user: models.User = Depends(dependencies.get_current_user), db: Session = Depends(database.get_db)):
    entries = db.query(models.MileageEntry).filter(models.MileageEntry.user_id == current_user.id).all()
    return entries
