from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class AndroidAppExpert(Agent):
    name: str = "Android App Expert"
    capabilities: List[str] = None
    cost_weight: float = 1.0

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['android', 'mobile', 'app-ship']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['android', 'mobile']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['app', 'ship', 'play']):
                score += 0.15
        if any(c in task.constraints for c in ['privacy']):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Prep Play internal testing', 'Embed privacy-safe analytics'],
            "deliverables": ['Play internal build', 'Analytics config']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Play testing build prepared",
            "next_steps": ['Beta feedback', 'Crash fixes']
        }
