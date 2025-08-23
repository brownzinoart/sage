from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class DevelopmentExpert(Agent):
    name: str = "Development Expert"
    capabilities: List[str] = None
    cost_weight: float = 1.1

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['backend', 'frontend', 'fullstack']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['backend', 'frontend']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['implement', 'build']):
                score += 0.15
        if any(c in task.constraints for c in ['limited budget']):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Audit repo', 'Define tech spikes', 'Implement minimal v1'],
            "deliverables": ['PRs', 'Release notes']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Minimal v1 implemented",
            "next_steps": ['Code review', 'Hardening']
        }
