"""Minimal stub of pydantic for testing.
Provides BaseModel, BaseSettings, EmailStr, and Field placeholders.
"""

class BaseModel:
    def __init__(self, **data):
        for k, v in data.items():
            setattr(self, k, v)
    def dict(self):
        return {k: getattr(self, k) for k in self.__dict__ if not k.startswith('_')}
    def json(self):
        import json
        return json.dumps(self.dict())

class BaseSettings(BaseModel):
    class Config:
        env_file = None
        case_sensitive = False
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Override attributes from environment variables if present
        for field in getattr(self, '__annotations__', {}):
            import os
            env_val = os.getenv(field.upper())
            if env_val is not None:
                setattr(self, field, env_val)

def Field(*args, **kwargs):
    return None

# Simple EmailStr type alias – no validation
EmailStr = str
