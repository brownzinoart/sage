from __future__ import annotations
from dataclasses import dataclass, field
from typing import Protocol, Dict, Any, List

@dataclass
class Task:
    description: str
    goals: List[str] = field(default_factory=list)
    constraints: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)  # e.g., ["ios", "growth", "privacy"]

class Agent(Protocol):
    name: str
    capabilities: List[str]
    cost_weight: float  # relative complexity/cost to involve this agent

    def suitability(self, task: Task) -> float:
        """Return a score (0-1) for how well this agent matches the task."""
        ...

    def plan(self, task: Task) -> Dict[str, Any]:
        """Return the agent's proposed plan/steps for the task."""
        ...

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute or simulate execution; return results to feed group output."""
        ...
