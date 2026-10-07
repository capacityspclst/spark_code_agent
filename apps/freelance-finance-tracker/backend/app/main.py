import os
import pathlib
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
import shutil
from . import models, schemas, crud
from .database import engine, Base
from .dependencies import get_current_user, get_db
from .auth import create_access_token
from datetime import datetime
import csv
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    docs_url=None,
    redoc_url=None,
    openapi_url=None,  # Hide OpenAPI schema from public
)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

# Security headers middleware
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Content-Security-Policy"] = "default-src 'self' blob: data:"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware
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

@app.get("/health")
def health():
    return {"status": "ok"}

# Authentication endpoints with rate limiting
@app.post("/auth/signup", response_model=schemas.Token)
@limiter.limit("5/minute")
def signup(request: Request, user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_email(db, user_in.email)
    if existing_user:
        # Do not reveal that the email is already registered; issue a token for the existing user
        access_token = create_access_token(existing_user.id)
        return {"access_token": access_token, "token_type": "bearer"}
    user = crud.create_user(db, user_in)
    access_token = create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=schemas.Token)
@limiter.limit("10/minute")
def login(request: Request, user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, user_in.email, user_in.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}

def _validate_image(upload: UploadFile):
    if upload.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(status_code=400, detail="Invalid image type")
    # Verify actual image content and protect against decompression bombs
    try:
        from PIL import Image
        # Limit pixel count to avoid decompression bomb attacks
        Image.MAX_IMAGE_PIXELS = 10_000_000
        upload.file.seek(0)
        img = Image.open(upload.file)
        img.verify()
    except Exception:
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image")
    upload.file.seek(0, os.SEEK_END)
    size = upload.file.tell()
    if size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 5 MiB)")
    upload.file.seek(0)

# Receipt endpoints
@app.post("/receipts", response_model=schemas.ReceiptRead)
@limiter.limit("20/minute")
def create_receipt(
    request: Request,
    amount: float = Form(...),
    date: str = Form(...),
    category: str = Form(...),
    notes: str = Form(None),
    image: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _validate_image(image)
    ext = pathlib.Path(image.filename).suffix
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
    image_url = f"/media/{filename}"
    return schemas.ReceiptRead(
        id=db_receipt.id,
        amount=db_receipt.amount,
        date=db_receipt.date,
        category=db_receipt.category,
        notes=db_receipt.notes,
        image_url=image_url,
    )

@app.get("/receipts", response_model=list[schemas.ReceiptRead])
@limiter.limit("30/minute")
def list_receipts(request: Request, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
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

# Mileage endpoints
@app.post("/mileage", response_model=schemas.MileageRead)
@limiter.limit("20/minute")
def create_mileage(
    request: Request,
    mileage_in: schemas.MileageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_mileage = crud.create_mileage(db, current_user, mileage_in)
    return db_mileage

@app.get("/mileage", response_model=list[schemas.MileageRead])
@limiter.limit("30/minute")
def list_mileage(request: Request, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_mileages(db, current_user)

# Dashboard endpoint
@app.get("/dashboard", response_model=schemas.DashboardSummary)
@limiter.limit("10/minute")
def get_dashboard(request: Request, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.calculate_dashboard(db, current_user)

# Export CSV
def _escape_csv(value: str) -> str:
    if value and value[0] in ("=", "+", "-", "@", "\t"):
        return "'" + value
    return value

@app.get("/export/csv")
@limiter.limit("5/minute")
def export_csv(request: Request, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    def generate():
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["type", "date", "amount/miles", "category", "notes"])
        for r in crud.get_receipts(db, current_user):
            writer.writerow([
                "receipt",
                r.date.isoformat(),
                r.amount,
                _escape_csv(r.category or ""),
                _escape_csv(r.notes or ""),
            ])
        for m in crud.get_mileages(db, current_user):
            writer.writerow([
                "mileage",
                m.date.isoformat(),
                m.miles,
                "",
                _escape_csv(m.notes or ""),
            ])
        yield output.getvalue()
    response = StreamingResponse(generate(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=export.csv"
    return response

# Export PDF
@app.get("/export/pdf")
@limiter.limit("5/minute")
def export_pdf(request: Request, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
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

# Protected media endpoint with rate limiting
@app.get("/media/{filename}")
@limiter.limit("10/minute")
def get_media(request: Request, filename: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    safe_path = pathlib.Path(MEDIA_ROOT) / filename
    try:
        resolved = safe_path.resolve(strict=True)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    if not resolved.is_relative_to(pathlib.Path(MEDIA_ROOT).resolve()):
        raise HTTPException(status_code=400, detail="Invalid file path")
    receipt = (
        db.query(models.Receipt)
        .filter(models.Receipt.image_path == str(resolved), models.Receipt.user_id == current_user.id)
        .first()
    )
    if not receipt:
        raise HTTPException(status_code=403, detail="Access denied")
    return FileResponse(str(resolved))
