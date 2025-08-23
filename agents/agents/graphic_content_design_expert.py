from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class GraphicContentDesignExpert(Agent):
    name: str = "Graphic/Content Design Expert"
    capabilities: List[str] = None
    cost_weight: float = 0.8

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['brand', 'visual', 'content']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['brand', 'content']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['brand', 'visual']):
                score += 0.15
        if any(c in task.constraints for c in []):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Define visual direction', 'Create key assets'],
            "deliverables": ['Style tiles', 'Asset pack']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Brand assets prepared",
            "next_steps": ['Apply across surfaces']
        }
