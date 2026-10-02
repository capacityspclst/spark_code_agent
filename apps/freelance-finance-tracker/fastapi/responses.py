"""Stub StreamingResponse for FastAPI tests.
It simply stores the body (bytes) and any provided headers.
"""
from typing import Dict

class StreamingResponse:
    def __init__(self, body, media_type: str = None, headers: Dict[str, str] = None):
        self.body = body
        self.media_type = media_type
        self.headers = headers or {}
