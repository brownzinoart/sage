from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class ProjectManagementExpert(Agent):
    name: str = "Project Management Expert"
    capabilities: List[str] = None
    cost_weight: float = 0.6

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['pm', 'delivery', 'roadmap']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['pm', 'delivery']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['timeline', 'risk', 'scope']):
                score += 0.15
        if any(c in task.constraints for c in []):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Delivery plan', 'Risk register'],
            "deliverables": ['Timeline', 'RACI']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Delivery plan baselined",
            "next_steps": ['Weekly standups', 'Risk monitoring']
        }
