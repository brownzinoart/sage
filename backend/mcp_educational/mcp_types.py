"""
Shared types for MCP Educational Server
"""

from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime


@dataclass
class ResearchQuery:
    """Structured research query"""
    query: str
    intent: str = "general"  # sleep, anxiety, pain, etc.
    compounds: List[str] = None  # CBD, CBN, etc.
    min_year: int = 2015
    max_results: int = 15
    source_types: List[str] = None  # clinical, review, meta-analysis
    
    def __post_init__(self):
        if self.compounds is None:
            self.compounds = []
        if self.source_types is None:
            self.source_types = []


@dataclass
class ResearchPaper:
    """Standardized research paper structure"""
    id: str = ""
    title: str = ""
    authors: List[str] = None
    year: int = 0
    journal: str = ""
    abstract: str = ""
    doi: str = ""
    pubmed_id: str = ""
    url: str = ""
    source: str = "unknown"  # pubmed, clinical_trials, etc.
    study_type: str = ""  # clinical-trial, review, etc.
    credibility_score: float = 0.0
    relevance_score: float = 0.0
    citation_count: int = 0
    full_citation: str = ""
    keywords: List[str] = None
    
    def __post_init__(self):
        if self.authors is None:
            self.authors = []
        if self.keywords is None:
            self.keywords = []