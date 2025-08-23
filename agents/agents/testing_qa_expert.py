from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class TestingQaExpert(Agent):
    name: str = "Testing/QA Expert"
    capabilities: List[str] = None
    cost_weight: float = 0.7

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['qa', 'testing', 'automation']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['qa', 'testing']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['test', 'quality']):
                score += 0.15
        if any(c in task.constraints for c in []):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Define test matrix', 'Add smoke tests'],
            "deliverables": ['Test matrix', 'CI artifacts']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Basic QA automation in place",
            "next_steps": ['Add e2e', 'Track flakiness']
        }
