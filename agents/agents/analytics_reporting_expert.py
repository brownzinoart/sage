from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class AnalyticsReportingExpert(Agent):
    name: str = "Analytics & Reporting Expert"
    capabilities: List[str] = None
    cost_weight: float = 0.8

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['analytics', 'reporting', 'dashboards']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['analytics', 'reporting']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['metric', 'dashboard', 'activation', 'retention']):
                score += 0.15
        if any(c in task.constraints for c in ['privacy']):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Define activation', 'Wire privacy-safe events', 'Build dashboard'],
            "deliverables": ['Metric spec', 'Dashboard']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Activation defined & wired to dashboard",
            "next_steps": ['Weekly reporting', 'Cohort views']
        }
