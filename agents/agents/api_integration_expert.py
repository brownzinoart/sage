from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class ApiIntegrationExpert(Agent):
    name: str = "API Integration Expert"
    capabilities: List[str] = None
    cost_weight: float = 0.9

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['api', 'integration']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['api', 'integration']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['integrate', 'webhook']):
                score += 0.15
        if any(c in task.constraints for c in []):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Map external APIs', 'Build thin client'],
            "deliverables": ['Integration spec', 'Client module']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Core APIs integrated",
            "next_steps": ['Add retries', 'Observability']
        }
