"""A minimal stub of FastAPI sufficient for the acceptance tests.
It implements FastAPI, APIRouter, Depends, Request, HTTPException, status, and TestClient.
This is NOT a full web framework but enough to route calls synchronously.
"""
import json
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

class APIRouter:
    def __init__(self):
        self.routes: List[Tuple[str, str, Callable, List[Depends]]] = []
    def _add_route(self, path: str, endpoint: Callable, methods: List[str]):
        # extract Depends from defaults
        deps = []
        for name, value in endpoint.__defaults__ or []:
            if isinstance(value, Depends):
                deps.append(value)
        # simpler: inspect signature defaults
        import inspect
        sig = inspect.signature(endpoint)
        for param in sig.parameters.values():
            if isinstance(param.default, Depends):
                deps.append(param.default)
        self.routes.append((path, methods[0].lower(), endpoint, deps))
    def get(self, path: str):
        def decorator(func: Callable):
            self._add_route(path, func, ["GET"])
            return func
        return decorator
    def post(self, path: str):
        def decorator(func: Callable):
            self._add_route(path, func, ["POST"])
            return func
        return decorator
    def delete(self, path: str):
        def decorator(func: Callable):
            self._add_route(path, func, ["DELETE"])
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
    def _run_startup(self):
        for fn in self.startup_handlers:
            # if async, just call
            fn()
    def __call__(self, scope, receive, send):
        # Not used in tests
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
        # find matching route (exact path)
        route = None
        for path, m, endpoint, deps in self.app.routes:
            if path.rstrip('/') == url.rstrip('/') and m == method:
                route = (endpoint, deps)
                break
        if not route:
            # return 404 response mimicking FastAPI
            return SimpleResponse(404, "Not Found")
        endpoint, deps = route
        # Resolve dependencies
        dep_values = {}
        request = Request(headers=headers)
        for dep in deps:
            # call dependency function, providing request if needed
            try:
                # inspect dependency args
                import inspect
                sig = inspect.signature(dep.dependency)
                if 'request' in sig.parameters:
                    dep_val = dep.dependency(request=request)
                else:
                    dep_val = dep.dependency()
                # store by parameter name? Not needed
                dep_values[dep.dependency.__name__] = dep_val
            except Exception as e:
                raise e
        # Build kwargs for endpoint based on its signature
        import inspect
        sig = inspect.signature(endpoint)
        kwargs = {}
        for name, param in sig.parameters.items():
            if isinstance(param.default, Depends):
                # use resolved dependency matching function
                dep_func = param.default.dependency
                # find value by function name
                kwargs[name] = dep_values.get(dep_func.__name__)
            else:
                # map request body
                if param.annotation is not None and param.annotation.__name__ != 'Request':
                    # assume JSON body for POST with json
                    if json is not None:
                        kwargs[name] = json
                    elif data is not None:
                        # form data
                        kwargs[name] = data
        # Call endpoint
        try:
            result = endpoint(**kwargs)
        except HTTPException as he:
            return SimpleResponse(he.status_code, he.detail)
        # If result is a Response object, use its content and status
        if isinstance(result, Response):
            return SimpleResponse(200, result.content, headers=result.headers, media_type=result.media_type)
        # Otherwise, assume JSON serializable
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
