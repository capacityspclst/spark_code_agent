"""Minimal stub of pydantic for the tests.
Provides BaseModel with .dict() method, EmailStr type alias, Field function and validator decorator.
"""
from typing import Any, Callable, Dict

class BaseModel:
    def __init__(self, **data):
        for k, v in data.items():
            setattr(self, k, v)
    def dict(self) -> Dict[str, Any]:
        # Return a dict of public attributes
        return {k: getattr(self, k) for k in self.__dict__ if not k.startswith('_')}

# Simple EmailStr type – just alias to str for stub purposes
EmailStr = str

def Field(*args, **kwargs):
    # No-op placeholder
    return None

def validator(field_name: str):
    def decorator(func: Callable):
        # In the stub we don't enforce validation; just return the function unchanged
        return func
    return decorator
