"""Simple storage service for saving uploaded files locally."""
import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from ..dependencies import get_settings

class StorageService:
    def __init__(self, root: str = None):
        self.root = Path(root or get_settings().upload_root)
        self.root.mkdir(parents=True, exist_ok=True)

    def save(self, file: UploadFile) -> str:
        # Generate a unique filename preserving extension
        ext = Path(file.filename).suffix
        filename = f"{uuid.uuid4().hex}{ext}"
        dest_path = self.root / filename
        # Write file contents safely
        with dest_path.open('wb') as out_file:
            # Note: read in chunks to avoid large memory use
            while True:
                chunk = file.file.read(1024 * 1024)
                if not chunk:
                    break
                out_file.write(chunk)
        return filename

    def delete(self, filename: str) -> None:
        try:
            (self.root / filename).unlink()
        except FileNotFoundError:
            pass
