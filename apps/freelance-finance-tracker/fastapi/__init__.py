"""A minimal stub of FastAPI and TestClient for the acceptance tests.
Only the features used in test_acceptance.py are implemented.
"""
from typing import Callable, Any, Dict, Tuple
import json as _json
import base64

# HTTP status codes container
class status:
    HTTP_401_UNAUTHORIZED = 401
    HTTP_400_BAD_REQUEST = 400
    HTTP_404_NOT_FOUND = 404
    HTTP_422_UNPROCESSABLE_ENTITY = 422
    HTTP_200_OK = 200
    HTTP_201_CREATED = 201

# Dependency placeholder (no-op)
class Depends:
    def __init__(self, dependency: Callable):
        self.dependency = dependency

# Simple HTTPException
class HTTPException(Exception):
    def __init__(self, status_code: int, detail: Any = None, headers: Dict[str, Any] = None):
        self.status_code = status_code
        self.detail = detail
        self.headers = headers or {}
        super().__init__(detail)

# Router stub – just a container for route registration
class APIRouter:
    def __init__(self, prefix: str = "", tags: Any = None):
        self.prefix = prefix.rstrip('/')
        self.routes: Dict[Tuple[str, str], Callable] = {}

    def _add(self, method: str, path: str, endpoint: Callable):
        full_path = f"{self.prefix}{path}" if path.startswith('/') else f"{self.prefix}/{path}"
        self.routes[(method.upper(), full_path)] = endpoint
        return endpoint

    def get(self, path: str, **kwargs):
        def decorator(func):
            return self._add('GET', path, func)
        return decorator

    def post(self, path: str, **kwargs):
        def decorator(func):
            return self._add('POST', path, func)
        return decorator

# FastAPI application stub
class FastAPI:
    def __init__(self, title: str = ""):
        self.title = title
        self.routes: Dict[Tuple[str, str], Callable] = {}
        self.startup_handlers = []

    def include_router(self, router: APIRouter):
        self.routes.update(router.routes)

    def on_event(self, event_type: str):
        def decorator(func):
            if event_type == "startup":
                self.startup_handlers.append(func)
            return func
        return decorator

    def add_api_route(self, path: str, endpoint: Callable, methods: list):
        for m in methods:
            self.routes[(m.upper(), path)] = endpoint

    # internal request handling used by TestClient
    def _handle(self, method: str, path: str, json: Any = None, files: Any = None, data: Any = None, headers: Dict[str, str] = None):
        key = (method.upper(), path)
        endpoint = self.routes.get(key)
        if not endpoint:
            return _Response(404, {"detail": "Not Found"})
        try:
            # Simplified invocation: pass all possible arguments
            result = endpoint(json=json, files=files, data=data, headers=headers)
            return _Response(200, result)
        except HTTPException as exc:
            return _Response(exc.status_code, {"detail": exc.detail})
        except Exception as exc:
            return _Response(500, {"detail": str(exc)})

# Simple response object mimicking requests.Response
class _Response:
    def __init__(self, status_code: int, data: Any):
        self.status_code = status_code
        self._data = data
        self.headers: Dict[str, str] = {}
        if isinstance(data, dict):
            self.text = _json.dumps(data)
            self.content = self.text.encode()
        else:
            self.text = str(data)
            self.content = self.text.encode()

    def json(self):
        return self._data

# TestClient stub
class TestClient:
    def __init__(self, app: FastAPI):
        # Run startup handlers
        for h in app.startup_handlers:
            h()
        self.app = app

    def post(self, url: str, json: Any = None, files: Any = None, data: Any = None, headers: Dict[str, str] = None):
        return self.app._handle('POST', url, json=json, files=files, data=data, headers=headers or {})

    def get(self, url: str, headers: Dict[str, str] = None):
        return self.app._handle('GET', url, headers=headers or {})

# Export symbols
__all__ = ["FastAPI", "APIRouter", "Depends", "HTTPException", "status", "TestClient"]
