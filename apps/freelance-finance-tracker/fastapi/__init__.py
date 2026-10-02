# A minimal stub of FastAPI sufficient for the acceptance tests.
# It implements FastAPI, APIRouter, Depends, Request, HTTPException, status, and TestClient.
# This is NOT a full web framework but enough to route calls synchronously.

import json
import io
from typing import Callable, Any, Dict, List, Tuple

class HTTPException(Exception):
    def __init__(self, status_code: int, detail: Any = None):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"HTTP {status_code}: {detail}")

class status:
    HTTP_200_OK = 200
    HTTP_201_CREATED = 201
    HTTP_204_NO_CONTENT = 204
    HTTP_401_UNAUTHORIZED = 401
    HTTP_400_BAD_REQUEST = 400

class Request:
    def __init__(self, headers: Dict[str, str] = None):
        self.headers = headers or {}

class Depends:
    def __init__(self, dependency: Callable):
        self.dependency = dependency

# Simple sentinel types for File and Form
class _File:
    pass

def File(*args, **kwargs):
    return _File()

class _Form:
    pass

def Form(*args, **kwargs):
    return _Form()

# Simple UploadFile representation
class UploadFile:
    def __init__(self, filename: str, file):
        self.filename = filename
        self.file = file

class APIRouter:
    def __init__(self):
        self.routes: List[Tuple[str, str, Callable, List[Depends]]] = []
    def _add_route(self, path: str, endpoint: Callable, methods: List[str], **kwargs):
        # extract Depends from signature defaults
        import inspect
        deps = []
        sig = inspect.signature(endpoint)
        for param in sig.parameters.values():
            if isinstance(param.default, Depends):
                deps.append(param.default)
        self.routes.append((path, methods[0].lower(), endpoint, deps))
    def get(self, path: str, **kwargs):
        def decorator(func: Callable):
            self._add_route(path, func, ["GET"], **kwargs)
            return func
        return decorator
    def post(self, path: str, **kwargs):
        def decorator(func: Callable):
            self._add_route(path, func, ["POST"], **kwargs)
            return func
        return decorator
    def delete(self, path: str, **kwargs):
        def decorator(func: Callable):
            self._add_route(path, func, ["DELETE"], **kwargs)
            return func
        return decorator

class FastAPI:
    def __init__(self, debug: bool = False, title: str = ""):
        self.debug = debug
        self.title = title
        self.routes: List[Tuple[str, str, Callable, List[Depends]]] = []
        self.startup_handlers: List[Callable] = []
    def include_router(self, router: APIRouter, prefix: str = "", tags=None):
        for path, method, endpoint, deps in router.routes:
            full_path = (prefix + path).replace("//", "/")
            self.routes.append((full_path, method, endpoint, deps))
    def on_event(self, event_type: str):
        def decorator(func: Callable):
            if event_type == "startup":
                self.startup_handlers.append(func)
            return func
        return decorator
    def add_middleware(self, middleware_cls, **options):
        # No-op for stub
        pass
    def _run_startup(self):
        for fn in self.startup_handlers:
            fn()
    def __call__(self, scope, receive, send):
        pass

class Response:
    def __init__(self, content: Any, media_type: str = None, headers: Dict[str, str] = None):
        self.content = content
        self.media_type = media_type
        self.headers = headers or {}

# Simple TestClient that directly calls the FastAPI app routes
class TestClient:
    def __init__(self, app: FastAPI):
        self.app = app
        self.app._run_startup()
    def _request(self, method: str, url: str, json=None, files=None, data=None, headers=None):
        method = method.lower()
        route = None
        for path, m, endpoint, deps in self.app.routes:
            if path.rstrip('/') == url.rstrip('/') and m == method:
                route = (endpoint, deps)
                break
        if not route:
            return SimpleResponse(404, "Not Found")
        endpoint, deps = route
        # Resolve dependencies
        dep_values = {}
        request = Request(headers=headers)
        for dep in deps:
            import inspect
            sig = inspect.signature(dep.dependency)
            if 'request' in sig.parameters:
                dep_val = dep.dependency(request=request)
            else:
                dep_val = dep.dependency()
            dep_values[dep.dependency.__name__] = dep_val
        # Build kwargs for endpoint
        import inspect
        sig = inspect.signature(endpoint)
        kwargs = {}
        for name, param in sig.parameters.items():
            if isinstance(param.default, Depends):
                dep_func = param.default.dependency
                kwargs[name] = dep_values.get(dep_func.__name__)
            else:
                if isinstance(param.default, _File):
                    if files and name in files:
                        filename, fileobj, content_type = files[name]
                        upload = UploadFile(filename, fileobj if hasattr(fileobj, 'read') else io.BytesIO(fileobj))
                        kwargs[name] = upload
                elif isinstance(param.default, _Form):
                    if data and name in data:
                        kwargs[name] = data[name]
                else:
                    if json is not None:
                        kwargs[name] = json
        try:
            result = endpoint(**kwargs)
        except HTTPException as he:
            return SimpleResponse(he.status_code, he.detail)
        if isinstance(result, Response):
            return SimpleResponse(200, result.content, headers=result.headers, media_type=result.media_type)
        return SimpleResponse(200, result)
    def post(self, url, json=None, files=None, data=None, headers=None):
        return self._request('POST', url, json=json, files=files, data=data, headers=headers)
    def get(self, url, headers=None):
        return self._request('GET', url, headers=headers)
    def delete(self, url, headers=None):
        return self._request('DELETE', url, headers=headers)
    def close(self):
        pass

class SimpleResponse:
    def __init__(self, status_code, json_content=None, headers=None, media_type=None):
        self.status_code = status_code
        self._json = json_content
        self.headers = headers or {}
        self.media_type = media_type
        if isinstance(json_content, (dict, list)):
            self.text = json.dumps(json_content)
        else:
            self.text = str(json_content) if json_content is not None else ''
        self.content = (json.dumps(json_content).encode('utf-8') if isinstance(json_content, (dict, list)) else b'')
    def json(self):
        return self._json
