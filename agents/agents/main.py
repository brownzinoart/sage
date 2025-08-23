from __future__ import annotations
from dataclasses import dataclass
from typing import List, Dict, Any, Tuple
from .base import Task, Agent
from . import registry

@dataclass
class SelectionConfig:
    max_team_size: int = 6
    min_score: float = 0.35       # drop agents below this
    prefer_low_cost: bool = True  # tie-breaker

class Orchestrator:
    def __init__(self, selection: SelectionConfig | None = None):
        self.selection = selection or SelectionConfig()
        self.agent_classes = registry.all_agents()

    def score_agents(self, task: Task) -> List[Tuple[Agent, float]]:
        scored: List[Tuple[Agent, float]] = []
        for cls in self.agent_classes:
            agent = cls()  # type: ignore
            score = agent.suitability(task)
            if score >= self.selection.min_score:
                scored.append((agent, score))
        scored.sort(key=lambda s: (-s[1], s[0].cost_weight if self.selection.prefer_low_cost else 0))
        return scored

    def pick_team(self, task: Task) -> List[Agent]:
        ranked = self.score_agents(task)
        team: List[Agent] = []
        covered_caps: set[str] = set()
        for agent, _ in ranked:
            new_caps = set(agent.capabilities) - covered_caps
            if new_caps:
                team.append(agent)
                covered_caps |= new_caps
            if len(team) >= self.selection.max_team_size:
                break
        if not team and ranked:
            team = [a for a, _ in ranked[: self.selection.max_team_size]]
        return team

    def run(self, task: Task) -> Dict[str, Any]:
        team = self.pick_team(task)
        plans = {member.name: member.plan(task) for member in team}
        context: Dict[str, Any] = {"plans": plans, "task": task}
        results = {member.name: member.act(task, context) for member in team}
        synthesis = {
            "summary": self._synthesize(plans, results),
            "team": [m.name for m in team],
            "plans": plans,
            "results": results,
        }
        return synthesis

    def _synthesize(self, plans: Dict[str, Any], results: Dict[str, Any]) -> str:
        bullets = []
        for k in results:
            r = results[k]
            bullets.append(f"- {k}: {r.get('key_outcome', 'completed plan')}")
        return "Team output:\n" + "\n".join(bullets)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run the Main Expert Orchestrator")
    parser.add_argument("task", type=str, help="Task description in quotes")
    parser.add_argument("--tags", nargs="*", default=[], help="Tags like ios growth privacy")
    parser.add_argument("--goal", dest="goals", nargs="*", default=[], help="One or more goals")
    parser.add_argument("--constraint", dest="constraints", nargs="*", default=[], help="One or more constraints")
    args = parser.parse_args()

    task = Task(description=args.task, goals=args.goals, constraints=args.constraints, tags=args.tags)
    orch = Orchestrator()
    from pprint import pprint
    pprint(orch.run(task))
