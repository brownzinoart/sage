"""
Educational Source Aggregator
Coordinates multiple academic and government APIs to gather research evidence
"""

import asyncio
import aiohttp
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import yaml
import sqlite3
import json
import hashlib
from pathlib import Path

from .pubmed_client import PubMedClient
from .clinical_trials import ClinicalTrialsClient
from .fda_client import FDAClient
from .europe_pmc_client import EuropePMCClient
from .leafly_client import LeaflyClient
from .pubchem_client import PubChemClient
from .terpene_aggregator import TerpeneAggregator
import sys
import os
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

# Import types from shared module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from mcp_types import ResearchQuery, ResearchPaper

from analyzers.credibility_scorer import CredibilityScorer
from analyzers.relevance_matcher import RelevanceMatcher
from cache.research_cache import get_research_cache

logger = logging.getLogger(__name__)

class EducationalSourceAggregator:
    """Main class for aggregating educational content from multiple sources"""
    
    def __init__(self, config_path: str = None):
        self.config_path = config_path or Path(__file__).parent.parent / "config" / "source_config.yaml"
        self.config = self._load_config()
        
        # Initialize research clients
        self.pubmed_client = PubMedClient(self.config['research_sources']['pubmed'])
        self.clinical_trials_client = ClinicalTrialsClient(self.config['research_sources']['clinical_trials'])
        self.fda_client = FDAClient(self.config['research_sources']['fda'])
        self.europe_pmc_client = EuropePMCClient(self.config['research_sources']['europe_pmc'])
        
        # Initialize cannabis industry clients
        cannabis_sources = self.config.get('cannabis_sources', {})
        self.leafly_client = LeaflyClient(cannabis_sources.get('leafly', {}))
        self.pubchem_client = PubChemClient(cannabis_sources.get('pubchem', {}))
        self.terpene_aggregator = TerpeneAggregator()
        
        # Initialize analyzers
        self.credibility_scorer = CredibilityScorer(self.config['credibility_weights'])
        self.relevance_matcher = RelevanceMatcher()
        
        # Initialize cache
        self.research_cache = get_research_cache()
        
        # Rate limiting
        self.rate_limiters = {}
        for source, conf in self.config['research_sources'].items():
            self.rate_limiters[source] = asyncio.Semaphore(conf.get('rate_limit', 1))
        
        # Add rate limiters for cannabis sources
        for source, conf in cannabis_sources.items():
            if isinstance(conf, dict):  # Skip non-dict entries like terpene_database
                self.rate_limiters[source] = asyncio.Semaphore(conf.get('rate_limit', 1))
    
    def _load_config(self) -> Dict:
        """Load configuration from YAML file"""
        try:
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Failed to load config: {e}")
            return self._get_default_config()
    
    def _get_default_config(self) -> Dict:
        """Fallback configuration"""
        return {
            'research_sources': {
                'pubmed': {'base_url': 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/', 'rate_limit': 3}
            },
            'credibility_weights': {'peer-reviewed': 10, 'clinical-trial': 9},
            'cache_settings': {'enabled': True, 'ttl_hours': 24}
        }
    
    def _init_cache_db(self) -> sqlite3.Connection:
        """Initialize SQLite cache database"""
        db_path = Path(__file__).parent.parent / "knowledge_base" / "research_cache.db"
        db_path.parent.mkdir(exist_ok=True)
        
        conn = sqlite3.connect(str(db_path), check_same_thread=False)
        conn.execute('''
            CREATE TABLE IF NOT EXISTS research_cache (
                query_hash TEXT PRIMARY KEY,
                query_text TEXT,
                results TEXT,  -- JSON
                timestamp REAL,
                ttl_hours INTEGER
            )
        ''')
        conn.commit()
        return conn
    
    async def fetch_research_evidence(self, research_query: ResearchQuery) -> Dict[str, Any]:
        """
        Main method to fetch research evidence from all sources
        """
        # Check cache first
        cached_papers = await self.research_cache.get_query_results(research_query)
        if cached_papers:
            logger.info(f"Returning cached results for query: {research_query.query}")
            return {
                'query': research_query.query,
                'intent': research_query.intent,
                'total_found': len(cached_papers),
                'returned': len(cached_papers),
                'papers': [self._paper_to_dict(paper) for paper in cached_papers],
                'summary': self._generate_summary(cached_papers),
                'timestamp': datetime.utcnow().isoformat(),
                'cached': True
            }
        
        logger.info(f"Fetching fresh research for query: {research_query.query}")
        
        # Parallel fetch from all sources with prioritization
        tasks = []
        
        # Determine source priority based on query type
        query_type = self._classify_query_type(research_query)
        
        # Medical/Research queries - prioritize academic sources
        if query_type in ['medical', 'research', 'clinical']:
            tasks.append(self._fetch_from_pubmed(research_query))
            tasks.append(self._fetch_from_europe_pmc(research_query))
            tasks.append(self._fetch_from_clinical_trials(research_query))
        
        # Product/Strain queries - prioritize industry sources
        if query_type in ['product', 'strain', 'effects']:
            tasks.append(self._fetch_from_leafly(research_query))
            tasks.append(self._fetch_from_terpene_database(research_query))
        
        # Chemical/Compound queries - prioritize chemical databases
        if query_type in ['chemical', 'compound', 'terpene']:
            tasks.append(self._fetch_from_pubchem(research_query))
            tasks.append(self._fetch_from_terpene_database(research_query))
        
        # Safety/Regulatory queries - prioritize government sources
        if query_type in ['safety', 'legal', 'regulatory']:
            tasks.append(self._fetch_from_fda(research_query))
        
        # Always include PubMed for general queries if not already added
        if query_type == 'general':
            tasks.append(self._fetch_from_pubmed(research_query))
            tasks.append(self._fetch_from_clinical_trials(research_query))
            tasks.append(self._fetch_from_leafly(research_query))
        
        # Add FDA search for CBD-related queries
        if any(compound in research_query.query.lower() for compound in ['cbd', 'cannabidiol']):
            if not any('fda' in str(task) for task in tasks):
                tasks.append(self._fetch_from_fda(research_query))
        
        # Execute all searches in parallel
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
        except Exception as e:
            logger.error(f"Error fetching research: {e}")
            results = []
        
        # Combine and process results
        all_papers = []
        for result in results:
            if isinstance(result, list):
                all_papers.extend(result)
            elif isinstance(result, Exception):
                logger.warning(f"Source fetch failed: {result}")
        
        # Score credibility and relevance
        scored_papers = await self._score_papers(all_papers, research_query)
        
        # Sort by relevance and credibility
        final_papers = sorted(
            scored_papers, 
            key=lambda x: (x.relevance_score * 0.6 + x.credibility_score/10 * 0.4), 
            reverse=True
        )[:research_query.max_results]
        
        # Cache the results
        if final_papers:
            await self.research_cache.cache_query_results(research_query, final_papers)
        
        # Create summary
        result = {
            'query': research_query.query,
            'intent': research_query.intent,
            'total_found': len(all_papers),
            'returned': len(final_papers),
            'papers': [self._paper_to_dict(paper) for paper in final_papers],
            'summary': self._generate_summary(final_papers),
            'timestamp': datetime.utcnow().isoformat(),
            'cached': False
        }
        
        return result
    
    async def cleanup_cache(self):
        """Clean up expired cache entries"""
        return await self.research_cache.cleanup_expired()
    
    def get_cache_stats(self):
        """Get cache performance statistics"""
        return self.research_cache.get_cache_stats()
    
    async def close(self):
        """Close aggregator and cleanup resources"""
        await self.research_cache.close()
    
    async def _fetch_from_pubmed(self, query: ResearchQuery) -> List[ResearchPaper]:
        """Fetch papers from PubMed"""
        async with self.rate_limiters['pubmed']:
            try:
                return await self.pubmed_client.search(
                    query=query.query,
                    compounds=query.compounds,
                    intent=query.intent,
                    min_year=query.min_year,
                    max_results=query.max_results
                )
            except Exception as e:
                logger.error(f"PubMed fetch failed: {e}")
                return []
    
    async def _fetch_from_clinical_trials(self, query: ResearchQuery) -> List[ResearchPaper]:
        """Fetch from ClinicalTrials.gov"""
        async with self.rate_limiters.get('clinical_trials', asyncio.Semaphore(1)):
            try:
                return await self.clinical_trials_client.search(
                    query=query.query,
                    compounds=query.compounds,
                    intent=query.intent,
                    min_year=query.min_year
                )
            except Exception as e:
                logger.error(f"Clinical trials fetch failed: {e}")
                return []
    
    async def _fetch_from_fda(self, query: ResearchQuery) -> List[ResearchPaper]:
        """Fetch from FDA databases"""
        async with self.rate_limiters.get('fda', asyncio.Semaphore(1)):
            try:
                return await self.fda_client.search(
                    query=query.query,
                    compounds=query.compounds
                )
            except Exception as e:
                logger.error(f"FDA fetch failed: {e}")
                return []
    
    async def _score_papers(self, papers: List[ResearchPaper], query: ResearchQuery) -> List[ResearchPaper]:
        """Score papers for credibility and relevance"""
        for paper in papers:
            # Score credibility
            paper.credibility_score = self.credibility_scorer.score_paper(paper)
            
            # Score relevance
            paper.relevance_score = await self.relevance_matcher.score_relevance(
                paper, query
            )
            
            # Generate citation
            paper.full_citation = self._format_citation(paper)
        
        return papers
    
    def _format_citation(self, paper: ResearchPaper) -> str:
        """Format paper as APA citation"""
        authors_str = ", ".join(paper.authors[:3])  # First 3 authors
        if len(paper.authors) > 3:
            authors_str += ", et al."
        
        citation = f"{authors_str} ({paper.year}). {paper.title}. {paper.journal}."
        
        if paper.doi:
            citation += f" https://doi.org/{paper.doi}"
        elif paper.url:
            citation += f" {paper.url}"
        
        return citation
    
    def _generate_summary(self, papers: List[ResearchPaper]) -> Dict[str, Any]:
        """Generate summary statistics"""
        if not papers:
            return {}
        
        # Count by study type
        study_types = {}
        for paper in papers:
            study_types[paper.study_type] = study_types.get(paper.study_type, 0) + 1
        
        # Average credibility
        avg_credibility = sum(p.credibility_score for p in papers) / len(papers)
        
        # Year distribution
        years = [p.year for p in papers]
        
        return {
            'study_types': study_types,
            'average_credibility_score': round(avg_credibility, 2),
            'year_range': {'min': min(years), 'max': max(years)},
            'top_journals': self._get_top_journals(papers),
            'high_credibility_count': len([p for p in papers if p.credibility_score >= 8])
        }
    
    def _get_top_journals(self, papers: List[ResearchPaper]) -> List[str]:
        """Get most frequent journals"""
        journal_counts = {}
        for paper in papers:
            journal_counts[paper.journal] = journal_counts.get(paper.journal, 0) + 1
        
        return sorted(journal_counts.keys(), key=lambda x: journal_counts[x], reverse=True)[:5]
    
    def _paper_to_dict(self, paper: ResearchPaper) -> Dict[str, Any]:
        """Convert ResearchPaper to dictionary"""
        return {
            'id': paper.id,
            'title': paper.title,
            'authors': paper.authors,
            'year': paper.year,
            'journal': paper.journal,
            'abstract': paper.abstract[:500] + "..." if len(paper.abstract) > 500 else paper.abstract,
            'doi': paper.doi,
            'pubmed_id': paper.pubmed_id,
            'url': paper.url,
            'source': paper.source,
            'study_type': paper.study_type,
            'credibility_score': round(paper.credibility_score, 2),
            'relevance_score': round(paper.relevance_score, 2),
            'citation': paper.full_citation,
            'citation_count': paper.citation_count
        }
    
    def _get_cache_key(self, query: ResearchQuery) -> str:
        """Generate cache key for query"""
        query_str = f"{query.query}_{query.intent}_{query.min_year}_{query.max_results}"
        return hashlib.md5(query_str.encode()).hexdigest()
    
    def _get_from_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get results from cache if valid"""
        if not self.config['cache_settings']['enabled']:
            return None
        
        try:
            cursor = self.cache_db.execute(
                'SELECT results, timestamp, ttl_hours FROM research_cache WHERE query_hash = ?',
                (cache_key,)
            )
            row = cursor.fetchone()
            
            if row:
                results, timestamp, ttl_hours = row
                cache_time = datetime.fromtimestamp(timestamp)
                if datetime.utcnow() - cache_time < timedelta(hours=ttl_hours):
                    return json.loads(results)
        except Exception as e:
            logger.warning(f"Cache read error: {e}")
        
        return None
    
    def _save_to_cache(self, cache_key: str, result: Dict[str, Any]) -> None:
        """Save results to cache"""
        if not self.config['cache_settings']['enabled']:
            return
        
        try:
            ttl_hours = self.config['cache_settings']['ttl_hours']
            self.cache_db.execute(
                'INSERT OR REPLACE INTO research_cache (query_hash, query_text, results, timestamp, ttl_hours) VALUES (?, ?, ?, ?, ?)',
                (cache_key, result['query'], json.dumps(result), datetime.utcnow().timestamp(), ttl_hours)
            )
            self.cache_db.commit()
        except Exception as e:
            logger.warning(f"Cache write error: {e}")
    
    async def get_dosage_guidelines(self, compound: str, condition: str, user_profile: Dict = None) -> Dict[str, Any]:
        """Get evidence-based dosage guidelines"""
        
        # Search for dosage studies
        query = ResearchQuery(
            query=f"{compound} dosage {condition}",
            intent="dosage",
            compounds=[compound],
            max_results=10
        )
        
        research_result = await self.fetch_research_evidence(query)
        
        # Extract dosage information from papers
        dosage_data = []
        for paper in research_result['papers']:
            if 'dosage' in paper['abstract'].lower() or 'dose' in paper['abstract'].lower():
                dosage_data.append({
                    'study': paper['title'],
                    'year': paper['year'],
                    'credibility': paper['credibility_score'],
                    'abstract': paper['abstract']
                })
        
        # Default guidelines based on literature
        guidelines = self._get_default_dosage_guidelines(compound, condition)
        
        return {
            'compound': compound,
            'condition': condition,
            'guidelines': guidelines,
            'evidence_base': dosage_data,
            'recommendation': self._generate_dosage_recommendation(compound, condition, user_profile),
            'clinical_studies_count': len(dosage_data),
            'last_updated': datetime.utcnow().isoformat()
        }
    
    def _get_default_dosage_guidelines(self, compound: str, condition: str) -> Dict[str, str]:
        """Default dosage guidelines from literature"""
        
        guidelines = {
            'CBD': {
                'anxiety': {'beginner': '10-20mg', 'intermediate': '25-40mg', 'experienced': '40-80mg'},
                'sleep': {'beginner': '15-25mg', 'intermediate': '25-50mg', 'experienced': '50-100mg'},
                'pain': {'beginner': '20-40mg', 'intermediate': '40-80mg', 'experienced': '80-160mg'}
            },
            'CBN': {
                'sleep': {'beginner': '2.5-5mg', 'intermediate': '5-10mg', 'experienced': '10-20mg'}
            },
            'CBG': {
                'focus': {'beginner': '5-15mg', 'intermediate': '15-30mg', 'experienced': '30-60mg'}
            }
        }
        
        return guidelines.get(compound.upper(), {}).get(condition, {
            'beginner': 'Start low',
            'intermediate': 'Gradually increase',
            'experienced': 'Individual titration'
        })
    
    def _generate_dosage_recommendation(self, compound: str, condition: str, user_profile: Dict = None) -> str:
        """Generate personalized dosage recommendation"""
        base_rec = f"For {condition}, clinical studies suggest starting with low doses of {compound} and gradually increasing."
        
        if user_profile:
            experience = user_profile.get('experience_level', 'beginner')
            base_rec += f" As a {experience} user, consider consulting the {experience} dosage range."
        
        base_rec += " Always consult healthcare providers for personalized advice."
        
        return base_rec
    
    def _classify_query_type(self, research_query) -> str:
        """Classify query type to determine source prioritization"""
        
        query_lower = research_query.query.lower()
        intent_lower = research_query.intent.lower() if research_query.intent else ''
        
        # Check for medical/clinical terms
        medical_terms = ['clinical', 'trial', 'study', 'research', 'medical', 'therapeutic', 'treatment']
        if any(term in query_lower or term in intent_lower for term in medical_terms):
            return 'medical'
        
        # Check for strain/product terms
        strain_terms = ['strain', 'variety', 'cultivar', 'effects', 'experience', 'high', 'buzz']
        if any(term in query_lower for term in strain_terms):
            return 'strain'
        
        # Check for chemical/compound terms
        chemical_terms = ['terpene', 'compound', 'chemical', 'molecule', 'structure', 'formula']
        if any(term in query_lower for term in chemical_terms):
            return 'chemical'
        
        # Check for safety/legal terms
        safety_terms = ['safety', 'legal', 'law', 'regulation', 'adverse', 'side effect', 'interaction']
        if any(term in query_lower for term in safety_terms):
            return 'safety'
        
        # Check intent-based classification
        if intent_lower in ['sleep', 'anxiety', 'pain', 'focus', 'energy']:
            return 'effects'
        elif intent_lower in ['dosage', 'safety']:
            return 'safety'
        
        return 'general'
    
    async def _fetch_from_europe_pmc(self, query: ResearchQuery) -> List[ResearchPaper]:
        """Fetch papers from Europe PMC"""
        async with self.rate_limiters.get('europe_pmc', asyncio.Semaphore(10)):
            try:
                return await self.europe_pmc_client.search(
                    query=query.query,
                    compounds=query.compounds,
                    intent=query.intent,
                    min_year=query.min_year,
                    max_results=query.max_results
                )
            except Exception as e:
                logger.error(f"Europe PMC fetch failed: {e}")
                return []
    
    async def _fetch_from_leafly(self, query: ResearchQuery) -> List[ResearchPaper]:
        """Fetch strain data from Leafly"""
        async with self.rate_limiters.get('leafly', asyncio.Semaphore(5)):
            try:
                return await self.leafly_client.search(
                    query=query.query,
                    compounds=query.compounds,
                    intent=query.intent,
                    max_results=min(query.max_results, 10)  # Limit Leafly results
                )
            except Exception as e:
                logger.error(f"Leafly fetch failed: {e}")
                return []
    
    async def _fetch_from_pubchem(self, query: ResearchQuery) -> List[ResearchPaper]:
        """Fetch chemical compound data from PubChem"""
        async with self.rate_limiters.get('pubchem', asyncio.Semaphore(5)):
            try:
                return await self.pubchem_client.search(
                    query=query.query,
                    compounds=query.compounds
                )
            except Exception as e:
                logger.error(f"PubChem fetch failed: {e}")
                return []
    
    async def _fetch_from_terpene_database(self, query: ResearchQuery) -> List[ResearchPaper]:
        """Fetch terpene data from internal database"""
        try:
            papers = []
            
            # Check if query involves terpenes
            terpene_terms = ['terpene', 'myrcene', 'limonene', 'pinene', 'linalool', 'caryophyllene', 'humulene']
            query_lower = query.query.lower()
            
            # Look for specific terpenes mentioned
            mentioned_terpenes = []
            for terpene in self.terpene_aggregator.get_all_terpenes():
                if terpene in query_lower:
                    mentioned_terpenes.append(terpene)
            
            # If specific terpenes mentioned, get their profiles
            if mentioned_terpenes:
                for terpene in mentioned_terpenes:
                    paper = self.terpene_aggregator.create_terpene_research_paper(terpene)
                    if paper:
                        papers.append(paper)
            
            # If intent-based query, find relevant terpenes
            elif query.intent:
                if query.intent in ['sleep', 'anxiety', 'pain', 'focus', 'energy']:
                    matching_terpenes = self.terpene_aggregator.search_by_effects([query.intent])
                    for match in matching_terpenes[:3]:  # Top 3 matches
                        terpene = match['terpene']
                        paper = self.terpene_aggregator.create_terpene_research_paper(terpene)
                        if paper:
                            papers.append(paper)
            
            # If general terpene query, provide overview of major terpenes
            elif any(term in query_lower for term in terpene_terms):
                major_terpenes = ['myrcene', 'limonene', 'pinene', 'linalool', 'caryophyllene']
                for terpene in major_terpenes:
                    paper = self.terpene_aggregator.create_terpene_research_paper(terpene)
                    if paper:
                        papers.append(paper)
            
            return papers
            
        except Exception as e:
            logger.error(f"Terpene database fetch failed: {e}")
            return []
    
    async def close(self):
        """Clean up resources"""
        await self.research_cache.close()
        
        # Close HTTP sessions in clients
        await self.pubmed_client.close()
        await self.clinical_trials_client.close()
        await self.fda_client.close()
        await self.europe_pmc_client.close()
        await self.leafly_client.close()
        await self.pubchem_client.close()