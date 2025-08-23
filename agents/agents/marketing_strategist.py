from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class MarketingStrategist(Agent):
    name: str = "Marketing Strategist"
    capabilities: List[str] = None
    cost_weight: float = 0.9

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['marketing', 'media', 'ads', 'performance']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['marketing', 'ads', 'performance']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['launch', 'campaign', 'media']):
                score += 0.15
        if any(c in task.constraints for c in ['limited budget']):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Pick 2-3 channels', 'Draft creative/email briefs'],
            "deliverables": ['Channel plan', 'Creative briefs']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Lean multi-channel plan ready",
            "next_steps": ['Run first flight', 'Evaluate CAC']
        }
