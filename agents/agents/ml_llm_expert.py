from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class MlLlmExpert(Agent):
    name: str = "ML/LLM Expert"
    capabilities: List[str] = None
    cost_weight: float = 1.2

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['ml', 'ai', 'llm', 'prompting']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in ['ml', 'ai', 'llm']:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in ['model', 'prompt', 'rag']):
                score += 0.15
        if any(c in task.constraints for c in ['privacy']):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {
            "steps": ['Define evals', 'Design prompts/RAG', 'Ship baselines'],
            "deliverables": ['Eval harness', 'Prompt pack']
        }

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "key_outcome": "Baselines and evals shipped",
            "next_steps": ['Tighten prompts', 'Hard-negative mining']
        }
