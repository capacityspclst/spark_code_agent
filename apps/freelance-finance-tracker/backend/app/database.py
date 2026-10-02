"""Placeholder database module used only to satisfy imports.
The current implementation relies on an in‑memory store defined in ``store.py``
and does not need a real SQLAlchemy engine or Base metadata.
We simply export dummy ``engine`` and ``Base`` objects so that other modules
can import them without error.
"""

class _Metadata:
    def create_all(self, bind=None):
        pass

class _Dummy:
    metadata = _Metadata()

# Dummy objects to keep import statements happy.
engine = _Dummy()
Base = _Dummy()

def get_db():
    # The stub TestClient does not use dependency injection, but some routers
    # still expect a callable. Returning a generator that yields ``None`` works.
    def _gen():
        yield None
    return _gen()
