"""Auto-import all agent modules to trigger registration."""
from pathlib import Path
import importlib

# Auto-import all agent modules
_current_dir = Path(__file__).parent

# List of all agent modules
agent_modules = [
    "product_design_strategy_expert",
    "ux_researcher",
    "ux_ui_expert", 
    "graphic_content_design_expert",
    "digital_animation_expert",
    "information_architect",
    "development_expert",
    "ios_app_expert",
    "android_app_expert",
    "api_integration_expert",
    "ml_llm_expert",
    "testing_qa_expert",
    "marketing_strategist",
    "social_creator_influencer_expert",
    "analytics_reporting_expert",
    "growth_acquisition_expert",
    "project_management_expert",
    "operations_people_expert",
    "legal_compliance_expert",
    "investor_relations_fundraising"
]

# Import each module
for module_name in agent_modules:
    try:
        importlib.import_module(f".{module_name}", package="agents")
    except ImportError as e:
        print(f"Failed to import {module_name}: {e}")
