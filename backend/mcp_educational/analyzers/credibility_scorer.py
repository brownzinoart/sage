"""
Credibility Scorer
Evaluates the credibility and reliability of research sources
"""

from typing import Dict, Any
from datetime import datetime
import logging

import sys
import os
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from mcp_types import ResearchPaper

logger = logging.getLogger(__name__)

class CredibilityScorer:
    """Scores research papers for credibility and reliability"""
    
    def __init__(self, credibility_weights: Dict[str, float]):
        self.weights = credibility_weights
        
        # High-impact journals in cannabinoid research
        self.high_impact_journals = {
            'nature', 'science', 'cell', 'lancet', 'new england journal of medicine',
            'jama', 'british medical journal', 'journal of clinical investigation',
            'proceedings of the national academy of sciences', 'nature medicine',
            'neuropsychopharmacology', 'journal of cannabis research',
            'cannabis and cannabinoid research', 'european journal of pain',
            'journal of pain', 'epilepsia', 'seizure', 'sleep medicine',
            'clinical therapeutics', 'pharmacology & therapeutics'
        }
        
        # Government and official sources
        self.government_sources = {
            'fda', 'nih', 'cdc', 'who', 'nida', 'nci', 'clinical_trials',
            'cochrane', 'pubmed', 'pmc'
        }
        
        # Study type hierarchy (higher = more credible)
        self.study_type_scores = {
            'meta-analysis': 10,
            'systematic-review': 9,
            'randomized-controlled-trial': 8,
            'phase-3-trial': 8,
            'clinical-trial': 7,
            'phase-2-trial': 7,
            'cohort-study': 6,
            'case-control-study': 5,
            'phase-1-trial': 5,
            'case-report': 4,
            'observational-study': 4,
            'review': 6,
            'research-article': 5,
            'regulatory-label': 7,  # FDA labels are authoritative
            'adverse-event-report': 6,
            'regulatory-enforcement': 6
        }
    
    def score_paper(self, paper: ResearchPaper) -> float:
        """
        Calculate overall credibility score for a research paper
        Returns score from 0.0 to 10.0
        """
        
        score = 0.0
        
        # Base score from source type
        base_score = self._get_base_source_score(paper.source)
        score += base_score
        
        # Study type score
        study_score = self._get_study_type_score(paper.study_type)
        score += study_score * 0.8  # Weight study type highly
        
        # Journal impact score
        journal_score = self._get_journal_score(paper.journal)
        score += journal_score
        
        # Recency score
        recency_score = self._get_recency_score(paper.year)
        score += recency_score
        
        # Citation count score (if available)
        citation_score = self._get_citation_score(paper.citation_count)
        score += citation_score
        
        # Author/source authority score
        authority_score = self._get_authority_score(paper)
        score += authority_score
        
        # Normalize to 0-10 scale
        final_score = min(max(score, 0.0), 10.0)
        
        logger.debug(f"Credibility score for '{paper.title[:50]}...': {final_score:.2f}")
        
        return final_score
    
    def _get_base_source_score(self, source: str) -> float:
        """Get base credibility score from source type"""
        
        source_scores = {
            'pubmed': 4.0,      # Peer-reviewed baseline
            'clinical_trials': 3.5,  # Clinical data
            'fda': 4.0,         # Government authority
            'nih': 4.0,         # Government research
            'cochrane': 4.5,    # High-quality reviews
            'europe_pmc': 3.5,  # European peer-reviewed
            'doaj': 3.0,        # Open access journals
            'core': 2.5,        # Academic aggregator
            'arxiv': 2.0        # Preprints (not peer-reviewed)
        }
        
        return source_scores.get(source, 2.0)
    
    def _get_study_type_score(self, study_type: str) -> float:
        """Get score based on study methodology"""
        
        base_score = self.study_type_scores.get(study_type, 3.0)
        
        # Normalize to 0-3 scale for this component
        return (base_score / 10.0) * 3.0
    
    def _get_journal_score(self, journal: str) -> float:
        """Get score based on journal reputation"""
        
        if not journal:
            return 0.0
        
        journal_lower = journal.lower()
        
        # High-impact journals
        if any(high_journal in journal_lower for high_journal in self.high_impact_journals):
            return 1.5
        
        # Government/official publications
        government_indicators = ['fda', 'nih', 'cdc', 'who', 'clinical trials', 'cochrane']
        if any(indicator in journal_lower for indicator in government_indicators):
            return 1.0
        
        # Cannabis-specific journals
        cannabis_journals = ['cannabis', 'cannabinoid', 'hemp']
        if any(indicator in journal_lower for indicator in cannabis_journals):
            return 0.8
        
        # Medical journals (general)
        medical_indicators = ['journal', 'medicine', 'medical', 'clinical', 'therapeutics']
        if any(indicator in journal_lower for indicator in medical_indicators):
            return 0.5
        
        return 0.0
    
    def _get_recency_score(self, year: int) -> float:
        """Get score based on publication recency"""
        
        current_year = datetime.now().year
        age = current_year - year
        
        if age <= 2:
            return 1.0      # Very recent
        elif age <= 5:
            return 0.8      # Recent
        elif age <= 10:
            return 0.5      # Moderately recent
        elif age <= 15:
            return 0.3      # Older but relevant
        else:
            return 0.1      # Old but might be foundational
    
    def _get_citation_score(self, citation_count: int) -> float:
        """Get score based on citation count"""
        
        if citation_count == 0:
            return 0.0
        elif citation_count < 10:
            return 0.2
        elif citation_count < 50:
            return 0.5
        elif citation_count < 100:
            return 0.8
        else:
            return 1.0
    
    def _get_authority_score(self, paper: ResearchPaper) -> float:
        """Get score based on author/institution authority"""
        
        score = 0.0
        
        # Check for government sources
        if paper.source in self.government_sources:
            score += 0.5
        
        # Check authors for institutional indicators
        for author in paper.authors:
            author_lower = author.lower()
            
            # Government institutions
            if any(indicator in author_lower for indicator in ['fda', 'nih', 'cdc', 'who']):
                score += 0.3
                break
            
            # Universities (top-tier indicators)
            university_indicators = ['university', 'college', 'institute', 'medical center', 'hospital']
            if any(indicator in author_lower for indicator in university_indicators):
                score += 0.2
                break
        
        # Check for multi-author studies (collaborative research)
        if len(paper.authors) >= 5:
            score += 0.2
        elif len(paper.authors) >= 3:
            score += 0.1
        
        return min(score, 1.0)  # Cap at 1.0
    
    def get_credibility_badge(self, score: float) -> Dict[str, str]:
        """Get visual credibility badge info"""
        
        if score >= 8.5:
            return {
                'level': 'excellent',
                'label': 'Excellent',
                'color': 'green',
                'icon': '🏆',
                'description': 'Highly credible peer-reviewed research'
            }
        elif score >= 7.0:
            return {
                'level': 'good',
                'label': 'Good',
                'color': 'blue',
                'icon': '✓',
                'description': 'Credible research from reliable source'
            }
        elif score >= 5.0:
            return {
                'level': 'fair',
                'label': 'Fair',
                'color': 'yellow',
                'icon': '⚠️',
                'description': 'Moderate credibility, consider with caution'
            }
        elif score >= 3.0:
            return {
                'level': 'limited',
                'label': 'Limited',
                'color': 'orange',
                'icon': '?',
                'description': 'Limited credibility, preliminary evidence'
            }
        else:
            return {
                'level': 'low',
                'label': 'Low',
                'color': 'red',
                'icon': '!',
                'description': 'Low credibility, use with significant caution'
            }
    
    def analyze_source_quality(self, papers: list) -> Dict[str, Any]:
        """Analyze overall quality of a set of papers"""
        
        if not papers:
            return {}
        
        scores = [self.score_paper(paper) for paper in papers]
        
        # Calculate statistics
        avg_score = sum(scores) / len(scores)
        high_quality_count = len([s for s in scores if s >= 7.0])
        excellent_count = len([s for s in scores if s >= 8.5])
        
        # Analyze source distribution
        source_counts = {}
        study_type_counts = {}
        
        for paper in papers:
            source_counts[paper.source] = source_counts.get(paper.source, 0) + 1
            study_type_counts[paper.study_type] = study_type_counts.get(paper.study_type, 0) + 1
        
        return {
            'total_papers': len(papers),
            'average_credibility': round(avg_score, 2),
            'high_quality_count': high_quality_count,
            'excellent_count': excellent_count,
            'quality_percentage': round((high_quality_count / len(papers)) * 100, 1),
            'source_distribution': source_counts,
            'study_type_distribution': study_type_counts,
            'recommendation': self._get_quality_recommendation(avg_score, high_quality_count, len(papers))
        }
    
    def _get_quality_recommendation(self, avg_score: float, high_quality_count: int, total_count: int) -> str:
        """Get recommendation based on source quality analysis"""
        
        quality_ratio = high_quality_count / total_count if total_count > 0 else 0
        
        if avg_score >= 7.5 and quality_ratio >= 0.6:
            return "Excellent evidence base with multiple high-quality sources"
        elif avg_score >= 6.0 and quality_ratio >= 0.4:
            return "Good evidence base with reliable sources"
        elif avg_score >= 4.5:
            return "Moderate evidence base; consider additional verification"
        else:
            return "Limited evidence base; seek additional authoritative sources"