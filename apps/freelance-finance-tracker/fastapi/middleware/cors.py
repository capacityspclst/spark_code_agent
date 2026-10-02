"""Stub CORSMiddleware for FastAPI stub.
It accepts any arguments but does nothing.
"""
class CORSMiddleware:
    def __init__(self, app, **options):
        # In the real FastAPI, this is a middleware class.
        # For the stub, we ignore options.
        self.app = app
        self.options = options
