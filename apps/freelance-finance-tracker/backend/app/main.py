import os
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
import shutil
from . import models, schemas, crud
from .database import engine, Base, SessionLocal
from .dependencies import get_current_user, get_db
from .auth import create_access_token
from datetime import datetime
from typing import List
import csv
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:19006").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MEDIA_ROOT = os.getenv("MEDIA_ROOT", "./media")
os.makedirs(MEDIA_ROOT, exist_ok=True)

@app.post("/auth/signup", response_model=schemas.Token)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.create_user(db, user_in)
    access_token = create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=schemas.Token)
def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, email, password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/receipts", response_model=schemas.ReceiptRead)
def create_receipt(
    amount: float = Form(...),
    date: str = Form(...),
    category: str = Form(...),
    notes: str = Form(None),
    image: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Save image
    ext = os.path.splitext(image.filename)[1]
    filename = f"receipt_{datetime.utcnow().timestamp()}{ext}"
    file_path = os.path.join(MEDIA_ROOT, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    receipt_in = schemas.ReceiptCreate(
        amount=amount,
        date=datetime.fromisoformat(date).date(),
        category=category,
        notes=notes,
    )
    db_receipt = crud.create_receipt(db, current_user, receipt_in, file_path)
    # Build image URL (for simplicity, serve via /media/<filename>)
    image_url = f"/media/{filename}"
    return schemas.ReceiptRead(
        id=db_receipt.id,
        amount=db_receipt.amount,
        date=db_receipt.date,
        category=db_receipt.category,
        notes=db_receipt.notes,
        image_url=image_url,
    )

@app.get("/receipts", response_model=List[schemas.ReceiptRead])
def list_receipts(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    receipts = crud.get_receipts(db, current_user)
    result = []
    for r in receipts:
        filename = os.path.basename(r.image_path)
        image_url = f"/media/{filename}"
        result.append(
            schemas.ReceiptRead(
                id=r.id,
                amount=r.amount,
                date=r.date,
                category=r.category,
                notes=r.notes,
                image_url=image_url,
            )
        )
    return result

@app.post("/mileage", response_model=schemas.MileageRead)
def create_mileage(
    mileage_in: schemas.MileageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_mileage = crud.create_mileage(db, current_user, mileage_in)
    return db_mileage

@app.get("/mileage", response_model=List[schemas.MileageRead])
def list_mileage(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_mileages(db, current_user)

@app.get("/dashboard", response_model=schemas.DashboardSummary)
def get_dashboard(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.calculate_dashboard(db, current_user)

@app.get("/export/csv")
def export_csv(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    def generate():
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["type", "date", "amount/miles", "category", "notes"])
        for r in crud.get_receipts(db, current_user):
            writer.writerow(["receipt", r.date.isoformat(), r.amount, r.category, r.notes or ""])
        for m in crud.get_mileages(db, current_user):
            writer.writerow(["mileage", m.date.isoformat(), m.miles, "", m.notes or ""])
        yield output.getvalue()
    response = StreamingResponse(generate(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=export.csv"
    return response

@app.get("/export/pdf")
def export_pdf(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 40
    p.setFont("Helvetica-Bold", 16)
    p.drawString(40, y, "FinanceMate Export Report")
    y -= 30
    p.setFont("Helvetica", 12)
    p.drawString(40, y, f"Generated: {datetime.utcnow().isoformat()} UTC")
    y -= 30
    p.drawString(40, y, "Receipts:")
    y -= 20
    for r in crud.get_receipts(db, current_user):
        line = f"{r.date.isoformat()} - ${r.amount:.2f} - {r.category}"
        p.drawString(60, y, line)
        y -= 15
        if y < 50:
            p.showPage()
            y = height - 40
    p.drawString(40, y, "Mileage:")
    y -= 20
    for m in crud.get_mileages(db, current_user):
        line = f"{m.date.isoformat()} - {m.miles} miles"
        p.drawString(60, y, line)
        y -= 15
        if y < 50:
            p.showPage()
            y = height - 40
    p.showPage()
    p.save()
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=export.pdf"})

# Serve media files
@app.get("/media/{filename}")
def get_media(filename: str):
    file_path = os.path.join(MEDIA_ROOT, filename)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
