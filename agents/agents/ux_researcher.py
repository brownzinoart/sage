from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class UxResearcher(Agent):
    name: str = "UX Researcher"
    capabilities: List[str] = None
    cost_weight: float = 0.8

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['research', 'insights']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['research', 'insights']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['user', 'interview', 'survey']):
                score += 0.15
        if any(c in task.constraints for c in []):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Identify key assumptions', 'Draft 5 interview prompts', 'Synthesize risks'],
            "deliverables": ['Interview guide', 'Assumption map']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Top user risks identified",
            "next_steps": ['Run 5 interviews', 'Update assumptions']
        }
