from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class ProductDesignStrategyExpert(Agent):
    name: str = "Product Design & Strategy Expert"
    capabilities: List[str] = None
    cost_weight: float = 1.0

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['product', 'strategy', 'positioning']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['product', 'strategy']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['position', 'roadmap']):
                score += 0.15
        if any(c in task.constraints for c in ['limited budget']):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Clarify target user & job-to-be-done', 'Define value prop and v1 scope', 'Draft lightweight roadmap'],
            "deliverables": ['Lean PRD', 'Roadmap', 'Positioning brief']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Clear v1 positioning and scope",
            "next_steps": ['Align stakeholders', 'Approve v1 scope']
        }
