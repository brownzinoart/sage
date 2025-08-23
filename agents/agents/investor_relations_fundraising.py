from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class InvestorRelationsFundraising(Agent):
    name: str = "Investor Relations & Fundraising"
    capabilities: List[str] = None
    cost_weight: float = 0.9

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['ir', 'fundraising', 'capital']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['ir', 'fundraising']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['raise', 'deck', 'investor']):
                score += 0.15
        if any(c in task.constraints for c in []):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Narrative & milestones', 'Prospect list'],
            "deliverables": ['Deck outline', 'Investor CRM']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Fundraising narrative + prospects ready",
            "next_steps": ['First 10 intros', 'Milestone update']
        }
