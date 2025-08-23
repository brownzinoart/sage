#!/usr/bin/env python3
"""
scaffold_agents.py — Drop-in scaffolder for your Claude Code projects.

Run this once from your repo root:

    python scaffold_agents.py

It will create an `agents/` package with:
- main orchestrator (main.py)
- base interfaces (base.py)
- registry for auto-discovery (registry.py)
- role tags (roles.py)
- stubs for each consolidated agent you approved

Then try it:

    python -m agents.main "Launch iOS MVP and acquire 1,000 users in 60 days"

Edit the agent stubs to tune suitability/plan/act logic.
"""

from __future__ import annotations
import os
from pathlib import Path

ROOT = Path.cwd()
AGENTS = ROOT / "agents"
GENERATORS = AGENTS / "generators"

FILES: dict[str, str] = {}

# --------------------------- base.py ---------------------------
FILES["base.py"] = r'''from __future__ import annotations
from dataclasses import dataclass, field
from typing import Protocol, Dict, Any, List

@dataclass
class Task:
    description: str
    goals: List[str] = field(default_factory=list)
    constraints: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)  # e.g., ["ios", "growth", "privacy"]

class Agent(Protocol):
    name: str
    capabilities: List[str]
    cost_weight: float  # relative complexity/cost to involve this agent

    def suitability(self, task: Task) -> float:
        """Return a score (0-1) for how well this agent matches the task."""
        ...

    def plan(self, task: Task) -> Dict[str, Any]:
        """Return the agent's proposed plan/steps for the task."""
        ...

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute or simulate execution; return results to feed group output."""
        ...
'''

# --------------------------- registry.py ---------------------------
FILES["registry.py"] = r'''from typing import Dict, Type, List
from .base import Agent

_REGISTRY: Dict[str, Type[Agent]] = {}

def register(cls: Type[Agent]):
    """Class decorator to auto-register an Agent implementation."""
    _REGISTRY[cls.__name__] = cls
    return cls

def all_agents() -> List[Type[Agent]]:
    return list(_REGISTRY.values())

def get_agent_class(name: str) -> Type[Agent]:
    return _REGISTRY[name]
'''

# --------------------------- roles.py ---------------------------
FILES["roles.py"] = r'''# Capability tags used by the orchestrator to reason about coverage.
ROLE_TAGS = {
    "Product Design & Strategy Expert": ["product", "strategy", "design-thinking", "positioning"],
    "UX Researcher": ["research", "users", "insights", "cultural-intel"],
    "UX/UI Expert": ["ux", "ui", "web", "app", "information-architecture"],
    "Graphic/Content Design Expert": ["brand", "visual", "content", "graphics"],
    "Digital Animation Expert": ["motion", "cgi", "animation"],
    "Information Architect": ["ia", "structure", "taxonomy"],
    "Development Expert": ["backend", "frontend", "fullstack"],
    "iOS App Expert": ["ios", "swift", "mobile"],
    "Android App Expert": ["android", "kotlin", "mobile"],
    "API Integration Expert": ["api", "integration"],
    "ML/LLM Expert": ["ml", "ai", "llm", "prompting"],
    "Testing/QA Expert": ["qa", "testing", "automation"],
    "Marketing Strategist": ["marketing", "media", "ads", "performance"],
    "Social/Creator/Influencer Expert": ["social", "creators", "influencers", "content"],
    "Analytics & Reporting Expert": ["analytics", "reporting", "dashboards"],
    "Growth & Acquisition Expert": ["growth", "lifecycle", "activation", "retention"],
    "Project Management Expert": ["pm", "delivery", "roadmap"],
    "Operations & People Expert": ["ops", "people", "hr"],
    "Legal & Compliance Expert": ["legal", "privacy", "compliance"],
    "Investor Relations & Fundraising": ["ir", "fundraising", "capital"],
}
'''

# --------------------------- main.py ---------------------------
FILES["main.py"] = r'''from __future__ import annotations
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
'''

# --------------------------- agent template helper ---------------------------
AGENT_TEMPLATE = r'''from dataclasses import dataclass
from typing import List, Dict, Any
from .base import Agent, Task
from .registry import register

@register
@dataclass
class {ClassName}(Agent):
    name: str = "{DisplayName}"
    capabilities: List[str] = None
    cost_weight: float = {Cost}

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = {Capabilities}

    def suitability(self, task: Task) -> float:
        score = 0.0
        # naive tag/goal matching — tune per role
        for t in {Tags}:
            if t in task.tags:
                score += 0.35
        for g in task.goals:
            if any(k in g.lower() for k in {GoalHints}):
                score += 0.15
        if any(c in task.constraints for c in {ConstraintHints}):
            score += 0.05
        return min(score, 1.0)

    def plan(self, task: Task) -> Dict[str, Any]:
        return {{
            "steps": {Steps},
            "deliverables": {Deliverables}
        }}

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        return {{
            "key_outcome": "{Outcome}",
            "next_steps": {NextSteps}
        }}
'''

# role specs (DisplayName, module_name, Capabilities, Tags, GoalHints, ConstraintHints, Steps, Deliverables, Outcome, NextSteps, Cost)
ROLES = [
    ("Product Design & Strategy Expert", "product_design_strategy_expert", ["product", "strategy", "positioning"], ["product", "strategy"], ["position", "roadmap"], ["limited budget"],
     ["Clarify target user & job-to-be-done", "Define value prop and v1 scope", "Draft lightweight roadmap"], ["Lean PRD", "Roadmap", "Positioning brief"],
     "Clear v1 positioning and scope", ["Align stakeholders", "Approve v1 scope"] , 1.0),

    ("UX Researcher", "ux_researcher", ["research", "insights"], ["research", "insights"], ["user", "interview", "survey"], [],
     ["Identify key assumptions", "Draft 5 interview prompts", "Synthesize risks"], ["Interview guide", "Assumption map"],
     "Top user risks identified", ["Run 5 interviews", "Update assumptions"], 0.8),

    ("UX/UI Expert", "ux_ui_expert", ["ux", "ui", "ia"], ["ux", "ui", "web", "app"], ["flow", "prototype"], [],
     ["Sketch core flows", "Clickable prototype", "Usability checklist"], ["Prototype", "UX checklist"],
     "Usable prototype for core task", ["Run usability test", "Iterate UI"], 1.0),

    ("Graphic/Content Design Expert", "graphic_content_design_expert", ["brand", "visual", "content"], ["brand", "content"], ["brand", "visual"], [],
     ["Define visual direction", "Create key assets"], ["Style tiles", "Asset pack"],
     "Brand assets prepared", ["Apply across surfaces"], 0.8),

    ("Digital Animation Expert", "digital_animation_expert", ["motion", "cgi", "animation"], ["animation", "cgi"], ["motion", "video"], [],
     ["Storyboard motion", "Render sample"], ["Storyboard", "Sample render"],
     "Animation concept proofed", ["Finalize motion assets"], 1.2),

    ("Information Architect", "information_architect", ["ia", "taxonomy"], ["ia", "structure"], ["nav", "taxonomy"], [],
     ["Audit information domains", "Propose IA"], ["IA map"],
     "IA proposed", ["Validate with users"], 0.7),

    ("Development Expert", "development_expert", ["backend", "frontend", "fullstack"], ["backend", "frontend"], ["implement", "build"], ["limited budget"],
     ["Audit repo", "Define tech spikes", "Implement minimal v1"], ["PRs", "Release notes"],
     "Minimal v1 implemented", ["Code review", "Hardening"], 1.1),

    ("iOS App Expert", "ios_app_expert", ["ios", "mobile", "app-ship"], ["ios", "mobile"], ["app", "ship", "testflight"], ["privacy"],
     ["Set up CI for TestFlight", "Embed privacy-safe analytics"], ["TestFlight build", "Analytics config"],
     "TestFlight build prepared with privacy-safe analytics", ["Beta feedback", "Crash fixes"], 1.0),

    ("Android App Expert", "android_app_expert", ["android", "mobile", "app-ship"], ["android", "mobile"], ["app", "ship", "play"], ["privacy"],
     ["Prep Play internal testing", "Embed privacy-safe analytics"], ["Play internal build", "Analytics config"],
     "Play testing build prepared", ["Beta feedback", "Crash fixes"], 1.0),

    ("API Integration Expert", "api_integration_expert", ["api", "integration"], ["api", "integration"], ["integrate", "webhook"], [],
     ["Map external APIs", "Build thin client"], ["Integration spec", "Client module"],
     "Core APIs integrated", ["Add retries", "Observability"], 0.9),

    ("ML/LLM Expert", "ml_llm_expert", ["ml", "ai", "llm", "prompting"], ["ml", "ai", "llm"], ["model", "prompt", "rag"], ["privacy"],
     ["Define evals", "Design prompts/RAG", "Ship baselines"], ["Eval harness", "Prompt pack"],
     "Baselines and evals shipped", ["Tighten prompts", "Hard-negative mining"], 1.2),

    ("Testing/QA Expert", "testing_qa_expert", ["qa", "testing", "automation"], ["qa", "testing"], ["test", "quality"], [],
     ["Define test matrix", "Add smoke tests"], ["Test matrix", "CI artifacts"],
     "Basic QA automation in place", ["Add e2e", "Track flakiness"], 0.7),

    ("Marketing Strategist", "marketing_strategist", ["marketing", "media", "ads", "performance"], ["marketing", "ads", "performance"], ["launch", "campaign", "media"], ["limited budget"],
     ["Pick 2-3 channels", "Draft creative/email briefs"], ["Channel plan", "Creative briefs"],
     "Lean multi-channel plan ready", ["Run first flight", "Evaluate CAC"], 0.9),

    ("Social/Creator/Influencer Expert", "social_creator_influencer_expert", ["social", "creators", "influencers", "content"], ["social", "creators"], ["content", "ugc", "influencer"], [],
     ["Calendar & formats", "Partner shortlist"], ["Content calendar", "Creator list"],
     "Content engine bootstrapped", ["Run 3 posts/wk", "Trial 2 creators"], 0.8),

    ("Analytics & Reporting Expert", "analytics_reporting_expert", ["analytics", "reporting", "dashboards"], ["analytics", "reporting"], ["metric", "dashboard", "activation", "retention"], ["privacy"],
     ["Define activation", "Wire privacy-safe events", "Build dashboard"], ["Metric spec", "Dashboard"],
     "Activation defined & wired to dashboard", ["Weekly reporting", "Cohort views"], 0.8),

    ("Growth & Acquisition Expert", "growth_acquisition_expert", ["growth", "lifecycle", "activation", "retention"], ["growth", "lifecycle"], ["acquire", "retain", "onboard"], [],
     ["Define activation", "3 quick experiments"], ["Experiment backlog", "Activation spec"],
     "First growth tests queued", ["Run tests", "Review weekly"], 0.9),

    ("Project Management Expert", "project_management_expert", ["pm", "delivery", "roadmap"], ["pm", "delivery"], ["timeline", "risk", "scope"], [],
     ["Delivery plan", "Risk register"], ["Timeline", "RACI"],
     "Delivery plan baselined", ["Weekly standups", "Risk monitoring"], 0.6),

    ("Operations & People Expert", "operations_people_expert", ["ops", "people", "hr"], ["ops", "people"], ["hiring", "process"], [],
     ["Map key processes", "Define hiring loop"], ["Ops SOP", "Hiring rubric"],
     "Ops basics documented", ["Pilot SOP", "First hire brief"], 0.7),

    ("Legal & Compliance Expert", "legal_compliance_expert", ["legal", "privacy", "compliance"], ["legal", "privacy", "compliance"], ["policy", "dsr", "retention"], ["privacy"],
     ["Data map", "Policy draft", "DSR flow"], ["Data map", "Policy draft", "DSR SOP"],
     "Privacy-safe analytics design drafted", ["Review with counsel", "Implement retention"], 1.2),

    ("Investor Relations & Fundraising", "investor_relations_fundraising", ["ir", "fundraising", "capital"], ["ir", "fundraising"], ["raise", "deck", "investor"], [],
     ["Narrative & milestones", "Prospect list"], ["Deck outline", "Investor CRM"],
     "Fundraising narrative + prospects ready", ["First 10 intros", "Milestone update"], 0.9),
]

# --------------------------- __init__.py ---------------------------
FILES["__init__.py"] = """# agents package\n"""

# --------------------------- write helpers ---------------------------
def snake_to_class(s: str) -> str:
    return "".join(p.capitalize() for p in s.split("_"))


def write_package():
    AGENTS.mkdir(exist_ok=True)
    GENERATORS.mkdir(parents=True, exist_ok=True)

    # base files
    for fname, content in FILES.items():
        (AGENTS / fname).write_text(content)

    # dynamic agent files
    for display, module, caps, tags, ghints, chints, steps, deliverables, outcome, next_steps, cost in ROLES:
        class_name = snake_to_class(module)
        mod_path = AGENTS / f"{module}.py"
        if mod_path.exists():
            continue
        code = AGENT_TEMPLATE.format(
            ClassName=class_name,
            DisplayName=display,
            Capabilities=caps,
            Tags=tags,
            GoalHints=[g.lower() for g in ghints],
            ConstraintHints=[c.lower() for c in chints],
            Steps=steps,
            Deliverables=deliverables,
            Outcome=outcome,
            NextSteps=next_steps,
            Cost=cost,
        )
        mod_path.write_text(code)

    # simple README as comment in generators dir
    (GENERATORS / "README.txt").write_text(
        "This directory can host code generators if you want to script agent creation.\n"
    )


def ensure_gitignore():
    gi = ROOT / ".gitignore"
    if gi.exists():
        return
    gi.write_text("""# Python\n__pycache__/\n*.pyc\n*.pyo\n*.pyd\n.env\n.venv\n\n# OS\n.DS_Store\n""")


def main():
    write_package()
    ensure_gitignore()
    print("✅ Created agents/ package with orchestrator and", len(ROLES), "agent stubs.")
    print("Try:\n  python -m agents.main \"Launch iOS MVP and acquire 1,000 users in 60 days\" --tags ios growth privacy --goal 'TestFlight build' '1k users' --constraint 'limited budget'")

if __name__ == "__main__":
    main()
