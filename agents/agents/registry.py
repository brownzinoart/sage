from typing import Dict, Type, List
from .base import Agent

_REGISTRY: Dict[str, Type[Agent]] = {}

def register(cls: Type[Agent]):
    """Class decorator to auto-register an Agent implementation."""
    _REGISTRY[cls.__name__] = cls
    return cls

def all_agents() -> List[Type[Agent]]:
    return list(_REGISTRY.values())

def get_agent_class(name: str) -> Type[Agent]:
    return _REGISTRY[name]
