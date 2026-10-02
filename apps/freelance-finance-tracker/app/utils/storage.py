"""Simple storage service for saving uploaded files locally."""
import uuid
from pathlib import Path
from fastapi import UploadFile
from ..dependencies import get_settings

class StorageService:
    def __init__(self, root: str = None):
        self.root = Path(root or get_settings().upload_root)
        self.root.mkdir(parents=True, exist_ok=True)

    def save(self, file: UploadFile) -> str:
        ext = Path(file.filename).suffix
        filename = f"{uuid.uuid4().hex}{ext}"
        dest_path = self.root / filename
        with dest_path.open('wb') as out_file:
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
