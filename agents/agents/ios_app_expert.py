from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class IosAppExpert(Agent):
    name: str = "iOS App Expert"
    capabilities: List[str] = None
    cost_weight: float = 1.0

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['ios', 'mobile', 'app-ship']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['ios', 'mobile']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['app', 'ship', 'testflight']):
                score += 0.15
        if any(c in task.constraints for c in ['privacy']):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Set up CI for TestFlight', 'Embed privacy-safe analytics'],
            "deliverables": ['TestFlight build', 'Analytics config']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "TestFlight build prepared with privacy-safe analytics",
            "next_steps": ['Beta feedback', 'Crash fixes']
        }
