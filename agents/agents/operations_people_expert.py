from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class OperationsPeopleExpert(Agent):
    name: str = "Operations & People Expert"
    capabilities: List[str] = None
    cost_weight: float = 0.7

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['ops', 'people', 'hr']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['ops', 'people']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['hiring', 'process']):
                score += 0.15
        if any(c in task.constraints for c in []):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Map key processes', 'Define hiring loop'],
            "deliverables": ['Ops SOP', 'Hiring rubric']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Ops basics documented",
            "next_steps": ['Pilot SOP', 'First hire brief']
        }
