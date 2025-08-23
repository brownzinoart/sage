from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class UxUiExpert(Agent):
    name: str = "UX/UI Expert"
    capabilities: List[str] = None
    cost_weight: float = 1.0

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['ux', 'ui', 'ia']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['ux', 'ui', 'web', 'app']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['flow', 'prototype']):
                score += 0.15
        if any(c in task.constraints for c in []):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Sketch core flows', 'Clickable prototype', 'Usability checklist'],
            "deliverables": ['Prototype', 'UX checklist']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Usable prototype for core task",
            "next_steps": ['Run usability test', 'Iterate UI']
        }
