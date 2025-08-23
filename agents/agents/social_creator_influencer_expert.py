from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class SocialCreatorInfluencerExpert(Agent):
    name: str = "Social/Creator/Influencer Expert"
    capabilities: List[str] = None
    cost_weight: float = 0.8

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['social', 'creators', 'influencers', 'content']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['social', 'creators']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['content', 'ugc', 'influencer']):
                score += 0.15
        if any(c in task.constraints for c in []):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Calendar & formats', 'Partner shortlist'],
            "deliverables": ['Content calendar', 'Creator list']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Content engine bootstrapped",
            "next_steps": ['Run 3 posts/wk', 'Trial 2 creators']
        }
