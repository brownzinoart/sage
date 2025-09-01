"""
Relevance Matcher
Scores how relevant research papers are to user queries
"""

import re
import asyncio
from typing import List, Dict, Any
import logging
from datetime import datetime

import sys
import os
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from mcp_types import ResearchPaper, ResearchQuery

logger = logging.getLogger(__name__)

class RelevanceMatcher:
    """Matches research papers to user queries and scores relevance"""
    
    def __init__(self):
        # Keyword mappings for different intents
        self.intent_keywords = {
            'sleep': {
                'primary': ['sleep', 'insomnia', 'sleep quality', 'sleep disorder', 'sleep latency'],
                'secondary': ['sedating', 'hypnotic', 'drowsiness', 'bedtime', 'rest'],
                'compounds': ['cbn', 'cannabinol', 'melatonin'],
                'avoid': ['stimulating', 'energizing', 'alertness']
            },
            'anxiety': {
                'primary': ['anxiety', 'anxiolytic', 'stress', 'worry', 'panic'],
                'secondary': ['calming', 'relaxing', 'soothing', 'tension'],
                'compounds': ['cbd', 'cannabidiol'],
                'avoid': ['stimulating', 'paranoia', 'psychoactive']
            },
            'pain': {
                'primary': ['pain', 'analgesia', 'analgesic', 'chronic pain', 'neuropathic'],
                'secondary': ['inflammation', 'arthritis', 'fibromyalgia', 'migraine'],
                'compounds': ['cbd', 'thc', 'cbg'],
                'avoid': ['no effect', 'ineffective']
            },
            'epilepsy': {
                'primary': ['epilepsy', 'seizure', 'anticonvulsant', 'dravet', 'lennox-gastaut'],
                'secondary': ['convulsion', 'spasm', 'neurological'],
                'compounds': ['cbd', 'cannabidiol'],
                'avoid': ['pro-convulsant', 'seizure-inducing']
            },
            'dosage': {
                'primary': ['dose', 'dosage', 'mg', 'milligram', 'administration'],
                'secondary': ['titration', 'start low', 'dose-response', 'pharmacokinetics'],
                'compounds': ['cbd', 'thc', 'cbn', 'cbg'],
                'avoid': []
            },
            'safety': {
                'primary': ['safety', 'adverse', 'side effect', 'toxicity', 'interaction'],
                'secondary': ['contraindication', 'warning', 'precaution', 'tolerance'],
                'compounds': ['cbd', 'thc', 'cannabinoid'],
                'avoid': []
            }
        }
        
        # Compound synonyms for better matching
        self.compound_synonyms = {
            'cbd': ['cannabidiol', 'cbd'],
            'thc': ['tetrahydrocannabinol', 'thc', 'delta-9-thc'],
            'cbn': ['cannabinol', 'cbn'],
            'cbg': ['cannabigerol', 'cbg'],
            'cbc': ['cannabichromene', 'cbc']
        }
    
    async def score_relevance(self, paper: ResearchPaper, query: ResearchQuery) -> float:
        """
        Score how relevant a paper is to the user's query
        Returns score from 0.0 to 1.0
        """
        
        score = 0.0
        
        # Text fields to analyze
        title_text = paper.title.lower()
        abstract_text = paper.abstract.lower()
        combined_text = f"{title_text} {abstract_text}"
        
        # Query text analysis
        query_text = query.query.lower()
        intent = query.intent
        compounds = [c.lower() for c in query.compounds]
        
        # 1. Direct query match (30% weight)
        query_score = self._score_query_match(combined_text, query_text)
        score += query_score * 0.3
        
        # 2. Intent-specific keywords (25% weight)
        intent_score = self._score_intent_match(combined_text, intent)
        score += intent_score * 0.25
        
        # 3. Compound mentions (20% weight)
        compound_score = self._score_compound_match(combined_text, compounds)
        score += compound_score * 0.2
        
        # 4. Study type relevance (15% weight)
        study_type_score = self._score_study_type_relevance(paper.study_type, intent)
        score += study_type_score * 0.15
        
        # 5. Title relevance bonus (10% weight)
        title_score = self._score_title_relevance(title_text, query_text, intent)
        score += title_score * 0.1
        
        # Apply negative scoring for irrelevant content
        negative_score = self._score_negative_indicators(combined_text, intent)
        score -= negative_score
        
        # Ensure score is between 0 and 1
        final_score = max(0.0, min(1.0, score))
        
        logger.debug(f"Relevance score for '{paper.title[:50]}...': {final_score:.3f}")
        
        return final_score
    
    def _score_query_match(self, text: str, query: str) -> float:
        """Score direct matches with the user query"""
        
        if not query:
            return 0.0
        
        # Clean query (remove common words)
        stop_words = {'i', 'can', 'cant', 'cannot', 'need', 'want', 'help', 'with', 'for', 'and', 'or', 'the', 'a', 'an'}
        query_words = [word for word in re.findall(r'\b\w+\b', query) if word not in stop_words and len(word) > 2]
        
        if not query_words:
            return 0.0
        
        # Count matches
        matches = 0
        for word in query_words:
            if word in text:
                matches += 1
        
        # Bonus for exact phrase matches
        if query in text:
            matches += len(query_words)  # Bonus for exact phrase
        
        return min(1.0, matches / len(query_words))
    
    def _score_intent_match(self, text: str, intent: str) -> float:
        """Score matches with intent-specific keywords"""
        
        if intent not in self.intent_keywords:
            return 0.0
        
        keywords = self.intent_keywords[intent]
        score = 0.0
        
        # Primary keywords (higher weight)
        primary_matches = 0
        for keyword in keywords['primary']:
            if keyword in text:
                primary_matches += 1
        
        if keywords['primary']:
            score += (primary_matches / len(keywords['primary'])) * 0.7
        
        # Secondary keywords (lower weight)
        secondary_matches = 0
        for keyword in keywords['secondary']:
            if keyword in text:
                secondary_matches += 1
        
        if keywords['secondary']:
            score += (secondary_matches / len(keywords['secondary'])) * 0.3
        
        return min(1.0, score)
    
    def _score_compound_match(self, text: str, compounds: List[str]) -> float:
        """Score mentions of relevant compounds"""
        
        if not compounds:
            return 0.0
        
        total_score = 0.0
        
        for compound in compounds:
            compound_score = 0.0
            
            # Check for exact compound match
            if compound in text:
                compound_score += 0.8
            
            # Check for synonyms
            if compound in self.compound_synonyms:
                for synonym in self.compound_synonyms[compound]:
                    if synonym in text:
                        compound_score += 0.6
                        break
            
            # Count frequency (more mentions = higher relevance)
            frequency = text.count(compound)
            if frequency > 1:
                compound_score += min(0.2, frequency * 0.05)
            
            total_score += min(1.0, compound_score)
        
        return min(1.0, total_score / len(compounds))
    
    def _score_study_type_relevance(self, study_type: str, intent: str) -> float:
        """Score study type relevance to intent"""
        
        # High-relevance study types for different intents
        intent_study_preferences = {
            'sleep': ['clinical-trial', 'randomized-controlled-trial', 'systematic-review'],
            'anxiety': ['clinical-trial', 'randomized-controlled-trial', 'meta-analysis'],
            'pain': ['systematic-review', 'meta-analysis', 'clinical-trial'],
            'epilepsy': ['clinical-trial', 'randomized-controlled-trial', 'case-report'],
            'dosage': ['clinical-trial', 'phase-1-trial', 'phase-2-trial'],
            'safety': ['adverse-event-report', 'clinical-trial', 'systematic-review']
        }
        
        if intent in intent_study_preferences:
            preferred_types = intent_study_preferences[intent]
            if study_type in preferred_types:
                return 1.0
            elif study_type in ['clinical-trial', 'systematic-review', 'meta-analysis']:
                return 0.7  # Generally good study types
            else:
                return 0.3
        
        # Default scoring for unknown intents
        high_quality_types = ['meta-analysis', 'systematic-review', 'randomized-controlled-trial']
        if study_type in high_quality_types:
            return 0.8
        else:
            return 0.4
    
    def _score_title_relevance(self, title: str, query: str, intent: str) -> float:
        """Score relevance based on title content"""
        
        score = 0.0
        
        # Title contains query terms
        if query in title:
            score += 0.8
        
        # Title contains intent keywords
        if intent in self.intent_keywords:
            for keyword in self.intent_keywords[intent]['primary']:
                if keyword in title:
                    score += 0.6
                    break
        
        # Title indicates comprehensive study
        comprehensive_indicators = ['systematic review', 'meta-analysis', 'clinical trial', 'effects of']
        for indicator in comprehensive_indicators:
            if indicator in title:
                score += 0.4
                break
        
        return min(1.0, score)
    
    def _score_negative_indicators(self, text: str, intent: str) -> float:
        """Score negative indicators that reduce relevance"""
        
        negative_score = 0.0
        
        # General negative indicators
        general_negative = ['no effect', 'ineffective', 'failed', 'negative results']
        for indicator in general_negative:
            if indicator in text:
                negative_score += 0.2
        
        # Intent-specific negative indicators
        if intent in self.intent_keywords and 'avoid' in self.intent_keywords[intent]:
            for avoid_term in self.intent_keywords[intent]['avoid']:
                if avoid_term in text:
                    negative_score += 0.3
        
        # Animal studies (less relevant for human applications)
        animal_indicators = ['animal', 'rat', 'mouse', 'mice', 'rodent', 'in vitro']
        animal_mentions = sum(1 for indicator in animal_indicators if indicator in text)
        if animal_mentions > 0:
            negative_score += min(0.3, animal_mentions * 0.1)
        
        return min(0.5, negative_score)  # Cap negative impact
    
    def rank_papers_by_relevance(self, papers: List[ResearchPaper], query: ResearchQuery) -> List[ResearchPaper]:
        """Rank papers by relevance score"""
        
        # Score all papers
        scored_papers = []
        for paper in papers:
            relevance_score = asyncio.run(self.score_relevance(paper, query))
            paper.relevance_score = relevance_score
            scored_papers.append(paper)
        
        # Sort by relevance (descending)
        return sorted(scored_papers, key=lambda x: x.relevance_score, reverse=True)
    
    def get_relevance_summary(self, papers: List[ResearchPaper], query: ResearchQuery) -> Dict[str, Any]:
        """Generate summary of relevance analysis"""
        
        if not papers:
            return {}
        
        relevance_scores = [paper.relevance_score for paper in papers if hasattr(paper, 'relevance_score')]
        
        if not relevance_scores:
            return {}
        
        avg_relevance = sum(relevance_scores) / len(relevance_scores)
        high_relevance_count = len([s for s in relevance_scores if s >= 0.7])
        moderate_relevance_count = len([s for s in relevance_scores if 0.4 <= s < 0.7])
        
        return {
            'total_papers': len(papers),
            'average_relevance': round(avg_relevance, 3),
            'high_relevance_count': high_relevance_count,
            'moderate_relevance_count': moderate_relevance_count,
            'relevance_distribution': {
                'high (≥0.7)': high_relevance_count,
                'moderate (0.4-0.7)': moderate_relevance_count,
                'low (<0.4)': len(relevance_scores) - high_relevance_count - moderate_relevance_count
            },
            'query_coverage': self._analyze_query_coverage(papers, query),
            'recommendation': self._get_relevance_recommendation(avg_relevance, high_relevance_count)
        }
    
    def _analyze_query_coverage(self, papers: List[ResearchPaper], query: ResearchQuery) -> Dict[str, Any]:
        """Analyze how well papers cover the query"""
        
        coverage = {
            'compounds_covered': [],
            'intent_coverage': False,
            'study_types_present': []
        }
        
        combined_text = ' '.join([paper.title + ' ' + paper.abstract for paper in papers]).lower()
        
        # Check compound coverage
        for compound in query.compounds:
            if compound.lower() in combined_text:
                coverage['compounds_covered'].append(compound)
        
        # Check intent coverage
        if query.intent in self.intent_keywords:
            intent_keywords = self.intent_keywords[query.intent]['primary']
            for keyword in intent_keywords:
                if keyword in combined_text:
                    coverage['intent_coverage'] = True
                    break
        
        # Study types present
        coverage['study_types_present'] = list(set([paper.study_type for paper in papers]))
        
        return coverage
    
    def _get_relevance_recommendation(self, avg_relevance: float, high_relevance_count: int) -> str:
        """Get recommendation based on relevance analysis"""
        
        if avg_relevance >= 0.7 and high_relevance_count >= 3:
            return "Excellent query match with highly relevant research"
        elif avg_relevance >= 0.5 and high_relevance_count >= 2:
            return "Good query match with relevant studies found"
        elif avg_relevance >= 0.3:
            return "Moderate relevance; may need broader search terms"
        else:
            return "Limited relevance; consider refining search query"