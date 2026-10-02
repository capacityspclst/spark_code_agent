"""A minimal stub of sqlmodel for testing purposes.
Provides SQLModel base, Field placeholder, Session with in‑memory storage,
select builder, and create_engine dummy.
"""
from typing import Any, List, Type, Dict

# Simple Field placeholder
class Field:
    def __init__(self, *args, **kwargs):
        pass

# Base class for models
class SQLModel:
    # metadata placeholder for compatibility
    class _Meta:
        def create_all(self, engine):
            # No operation needed for stub
            pass
    metadata = _Meta()
    def __init_subclass__(cls, **kwargs):
        # accept table=True etc.
        return super().__init_subclass__()
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

# In‑memory "engine" placeholder
def create_engine(url: str, **kwargs):
    return {'url': url}

# Simple condition tuple representation
class Condition:
    def __init__(self, column_name: str, op: str, value: Any):
        self.column_name = column_name
        self.op = op
        self.value = value
    def evaluate(self, obj):
        actual = getattr(obj, self.column_name, None)
        if self.op == '==':
            return actual == self.value
        return False

# Column descriptor used on model classes
class Column:
    def __init__(self, name: str):
        self.name = name
    def __get__(self, instance, owner):
        # Access on class returns Column itself
        return self
    def __eq__(self, other):
        return Condition(self.name, '==', other)

# Helper to turn annotated fields into Columns (simplified)
def _setup_columns(cls):
    for name, typ in getattr(cls, '__annotations__', {}).items():
        # ignore private attributes
        if not name.startswith('_'):
            setattr(cls, name, Column(name))
    return cls

# Select builder
class QueryBuilder:
    def __init__(self, model: Type[SQLModel]):
        self.model = model
        self._condition = None
    def where(self, condition):
        self._condition = condition
        return self
    def exec(self, session):
        # delegate to session query
        return session._query(self.model, self._condition)

def select(model: Type[SQLModel]):
    return QueryBuilder(model)

# Simple result wrapper
class Result:
    def __init__(self, items: List[Any]):
        self._items = items
    def first(self):
        return self._items[0] if self._items else None
    def all(self):
        return list(self._items)
    def one(self):
        if not self._items:
            raise Exception('No results')
        if len(self._items) > 1:
            raise Exception('Multiple results')
        return self._items[0]

# Session implementation with in‑memory storage
class Session:
    _global_store: Dict[Type[SQLModel], List[SQLModel]] = {}
    _id_counters: Dict[Type[SQLModel], int] = {}
    def __init__(self, engine):
        self.engine = engine
    def add(self, obj: SQLModel):
        model = type(obj)
        if getattr(obj, 'id', None) is None:
            # assign auto‑increment id
            cnt = self._id_counters.get(model, 0) + 1
            self._id_counters[model] = cnt
            setattr(obj, 'id', cnt)
        # store
        self._global_store.setdefault(model, []).append(obj)
    def commit(self):
        pass
    def refresh(self, obj: SQLModel):
        # No action needed for in‑memory
        pass
    def get(self, model: Type[SQLModel], id_: int):
        for item in self._global_store.get(model, []):
            if getattr(item, 'id', None) == id_:
                return item
        return None
    def exec(self, query_builder: QueryBuilder):
        return query_builder.exec(self)
    def _query(self, model: Type[SQLModel], condition: Any):
        items = self._global_store.get(model, [])
        if condition is None:
            return Result(items)
        # condition may be a Condition instance
        filtered = []
        for obj in items:
            if isinstance(condition, Condition) and condition.evaluate(obj):
                filtered.append(obj)
        return Result(filtered)

# Apply Column setup to model classes after they are defined
def _apply_model_setup():
    import sys, inspect
    current_module = sys.modules[__name__]
    for name, obj in inspect.getmembers(current_module):
        if inspect.isclass(obj) and issubclass(obj, SQLModel) and obj is not SQLModel:
            _setup_columns(obj)

_apply_model_setup()
