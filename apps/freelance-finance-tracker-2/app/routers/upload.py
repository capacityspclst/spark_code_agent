import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from .. import models, auth
from ..limit import limiter

router = APIRouter()

# Directory to store uploaded files
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploaded_files")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Define max upload size (e.g., 5 MB)
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # bytes

# Limit uploads per user to mitigate abuse
@router.post("/uploads", status_code=200)
@limiter.limit("10/minute")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db),
):
    # Generate secure filename
    ext = os.path.splitext(file.filename)[1]
    secure_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, secure_name)

    total_bytes = 0
    # Save file to disk in chunks to avoid loading entire file into memory
    try:
        with open(file_path, "wb") as buffer:
            while True:
                chunk = await file.read(1024 * 1024)  # 1 MB per chunk
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > MAX_UPLOAD_SIZE:
                    # Remove partially written file
                    buffer.close()
                    os.remove(file_path)
                    raise HTTPException(status_code=413, detail="File too large")
                buffer.write(chunk)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {exc}")

    # Record in DB
    upload_record = models.Upload(
        original_filename=file.filename,
        stored_path=secure_name,
        owner_id=current_user.id,
    )
    db.add(upload_record)
    db.commit()
    db.refresh(upload_record)
    return {"id": upload_record.id, "filename": upload_record.original_filename}

def _get_upload_or_404(file_id: int, user_id: int, db: Session) -> models.Upload:
    upload = db.query(models.Upload).filter(models.Upload.id == file_id).first()
    if not upload:
        raise HTTPException(status_code=404, detail="File not found")
    if upload.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this file")
    return upload

@router.get("/uploads/{file_id}")
def download_file(
    file_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db),
):
    upload = _get_upload_or_404(file_id, current_user.id, db)
    file_path = os.path.join(UPLOAD_DIR, upload.stored_path)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Stored file missing")
    return FileResponse(path=file_path, filename=upload.original_filename)

@router.delete("/uploads/{file_id}")
def delete_file(
    file_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db),
):
    upload = _get_upload_or_404(file_id, current_user.id, db)
    file_path = os.path.join(UPLOAD_DIR, upload.stored_path)
    # Remove file from storage
    try:
        if os.path.isfile(file_path):
            os.remove(file_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {exc}")
    # Delete DB record
    db.delete(upload)
    db.commit()
    return {"detail": "File deleted"}
