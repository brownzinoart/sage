from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class GrowthAcquisitionExpert(Agent):
    name: str = "Growth & Acquisition Expert"
    capabilities: List[str] = None
    cost_weight: float = 0.9

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['growth', 'lifecycle', 'activation', 'retention']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['growth', 'lifecycle']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['acquire', 'retain', 'onboard']):
                score += 0.15
        if any(c in task.constraints for c in []):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Define activation', '3 quick experiments'],
            "deliverables": ['Experiment backlog', 'Activation spec']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "First growth tests queued",
            "next_steps": ['Run tests', 'Review weekly']
        }
