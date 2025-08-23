"""
Europe PMC API Client
Fetches peer-reviewed research papers from Europe PMC database
"""

import aiohttp
import asyncio
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
import re
from urllib.parse import quote

import sys
import os
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from mcp_types import ResearchPaper

logger = logging.getLogger(__name__)

class EuropePMCClient:
    """Client for Europe PMC API"""
    
    def __init__(self, config: Dict[str, Any]):
        self.base_url = config.get('base_url', 'https://www.ebi.ac.uk/europepmc/webservices/rest/')
        self.session = None
        
        # Default parameters
        self.default_params = {
            'format': 'json',
            'resultType': 'core',
            'pageSize': 25
        }
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session"""
        if self.session is None:
            timeout = aiohttp.ClientTimeout(total=30)
            self.session = aiohttp.ClientSession(timeout=timeout)
        return self.session
    
    async def search(self, query: str, compounds: List[str], intent: str,
                    min_year: int = 2015, max_results: int = 20) -> List[ResearchPaper]:
        """
        Search Europe PMC for research papers
        """
        # Build search query
        search_query = self._build_search_query(query, compounds, intent, min_year)
        
        logger.info(f"Europe PMC search query: {search_query}")
        
        # Search for papers
        papers = await self._search_papers(search_query, max_results)
        
        if not papers:
            logger.warning("No papers found in Europe PMC")
            return []
        
        logger.info(f"Found {len(papers)} papers in Europe PMC")
        return papers
    
    def _build_search_query(self, query: str, compounds: List[str], intent: str, min_year: int) -> str:
        """Build Europe PMC search query"""
        
        query_parts = []
        
        # Add cannabinoid terms
        compound_terms = []
        for compound in compounds:
            if compound.upper() == 'CBD':
                compound_terms.append('(cannabidiol OR CBD)')
            elif compound.upper() == 'CBN':
                compound_terms.append('(cannabinol OR CBN)')
            elif compound.upper() == 'CBG':
                compound_terms.append('(cannabigerol OR CBG)')
            elif compound.upper() == 'CBC':
                compound_terms.append('(cannabichromene OR CBC)')
            elif compound.upper() == 'THC':
                compound_terms.append('(tetrahydrocannabinol OR THC)')
            else:
                compound_terms.append(f'"{compound}"')
        
        if compound_terms:
            query_parts.append(f"({' OR '.join(compound_terms)})")
        
        # Add intent-specific terms
        intent_terms = self._get_intent_terms(intent)
        if intent_terms:
            query_parts.append(f"({intent_terms})")
        
        # Add general query terms
        if query and not any(compound.lower() in query.lower() for compound in compounds):
            clean_query = re.sub(r'[^\w\s]', '', query)
            if clean_query.strip():
                query_parts.append(f'"{clean_query.strip()}"')
        
        # Join with AND
        full_query = ' AND '.join(query_parts)
        
        # Add filters
        full_query += f' AND PUB_YEAR:[{min_year} TO 2030]'  # Date range
        full_query += ' AND LANG:"eng"'  # English only
        full_query += ' AND HAS_PDF:"Y"'  # Has PDF available
        
        # Add source filters (prefer higher quality sources)
        full_query += ' AND (SRC:"MED" OR SRC:"PMC" OR SRC:"AGR" OR SRC:"CBA")'
        
        return full_query
    
    def _get_intent_terms(self, intent: str) -> str:
        """Get search terms specific to user intent"""
        
        intent_mapping = {
            'sleep': 'sleep OR insomnia OR "sleep disorder" OR "sleep quality"',
            'anxiety': 'anxiety OR "anxiety disorder" OR anxiolytic OR stress',
            'pain': 'pain OR "chronic pain" OR analgesic OR analgesia OR inflammation',
            'epilepsy': 'epilepsy OR seizure OR anticonvulsant OR "Dravet syndrome" OR "Lennox-Gastaut"',
            'cancer': 'cancer OR tumor OR tumour OR oncology OR malignant',
            'dosage': 'dose OR dosage OR "dose response" OR "dosing" OR "therapeutic dose"',
            'safety': 'safety OR "adverse effects" OR toxicity OR "side effects"'
        }
        
        return intent_mapping.get(intent, '')
    
    async def _search_papers(self, query: str, max_results: int) -> List[ResearchPaper]:
        """Search for papers using Europe PMC API"""
        
        session = await self._get_session()
        
        params = {
            **self.default_params,
            'query': query,
            'pageSize': min(max_results, 100),  # API limit is 100
            'cursorMark': '*'  # Start from beginning
        }
        
        url = f"{self.base_url}search"
        
        try:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    logger.error(f"Europe PMC search failed: {response.status}")
                    return []
                
                data = await response.json()
                result_list = data.get('resultList', {})
                results = result_list.get('result', [])
                
                papers = []
                for result in results[:max_results]:
                    paper = self._convert_result_to_paper(result)
                    if paper:
                        papers.append(paper)
                
                return papers
                
        except asyncio.TimeoutError:
            logger.error("Europe PMC search timeout")
            return []
        except Exception as e:
            logger.error(f"Europe PMC search error: {e}")
            return []
    
    def _convert_result_to_paper(self, result: Dict[str, Any]) -> Optional[ResearchPaper]:
        """Convert Europe PMC result to ResearchPaper format"""
        
        try:
            # Extract basic information
            pmid = result.get('pmid', '')
            pmcid = result.get('pmcid', '')
            doi = result.get('doi', '')
            
            # Generate ID
            if pmid:
                paper_id = f"europepmc_pmid_{pmid}"
            elif pmcid:
                paper_id = f"europepmc_pmc_{pmcid}"
            else:
                paper_id = f"europepmc_{hash(result.get('title', ''))}"
            
            # Extract title
            title = result.get('title', '').strip()
            if not title:
                return None
            
            # Extract authors
            authors = []
            author_list = result.get('authorList', {}).get('author', [])
            for author in author_list[:10]:  # Limit to 10 authors
                full_name = author.get('fullName', '')
                if full_name:
                    authors.append(full_name)
            
            if not authors:
                authors = ["Unknown Authors"]
            
            # Extract journal
            journal = result.get('journalInfo', {}).get('journal', {}).get('title', 'Unknown Journal')
            
            # Extract year
            pub_year = result.get('pubYear')
            if pub_year:
                try:
                    year = int(pub_year)
                except (ValueError, TypeError):
                    year = datetime.now().year
            else:
                year = datetime.now().year
            
            # Extract abstract
            abstract = result.get('abstractText', '').strip()
            if not abstract:
                abstract = "Abstract not available."
            
            # Truncate abstract if too long
            if len(abstract) > 1000:
                abstract = abstract[:997] + "..."
            
            # Determine study type
            publication_types = result.get('pubTypeList', {}).get('pubType', [])
            study_type = self._categorize_study_type(publication_types, result)
            
            # Build URLs
            urls = []
            if pmid:
                urls.append(f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/")
            if pmcid:
                urls.append(f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmcid}/")
            if doi:
                urls.append(f"https://doi.org/{doi}")
            
            # Use first available URL
            url = urls[0] if urls else f"https://europepmc.org/article/med/{pmid or 'unknown'}"
            
            # Extract citation count if available
            citation_count = result.get('citedByCount', 0)
            
            return ResearchPaper(
                id=paper_id,
                title=title,
                authors=authors,
                year=year,
                journal=journal,
                abstract=abstract,
                doi=doi,
                pubmed_id=pmid,
                url=url,
                source="europepmc",
                study_type=study_type,
                credibility_score=0.0,  # Will be scored later
                relevance_score=0.0,    # Will be scored later
                citation_count=citation_count
            )
            
        except Exception as e:
            logger.warning(f"Failed to convert Europe PMC result: {e}")
            return None
    
    def _categorize_study_type(self, publication_types: List[Dict[str, Any]], result: Dict[str, Any]) -> str:
        """Categorize study type based on publication types and metadata"""
        
        # Extract publication type values
        pub_type_values = []
        for pub_type in publication_types:
            value = pub_type.get('value', '').lower()
            if value:
                pub_type_values.append(value)
        
        # Check for specific study types
        if any('randomized controlled trial' in pt for pt in pub_type_values):
            return 'randomized-controlled-trial'
        elif any('clinical trial' in pt for pt in pub_type_values):
            return 'clinical-trial'
        elif any('meta-analysis' in pt for pt in pub_type_values):
            return 'meta-analysis'
        elif any('systematic review' in pt for pt in pub_type_values):
            return 'systematic-review'
        elif any('review' in pt for pt in pub_type_values):
            return 'review'
        elif any('case report' in pt for pt in pub_type_values):
            return 'case-report'
        elif any('case study' in pt for pt in pub_type_values):
            return 'case-study'
        
        # Check title and abstract for study type indicators
        title_lower = result.get('title', '').lower()
        abstract_lower = result.get('abstractText', '').lower()
        
        combined_text = f"{title_lower} {abstract_lower}"
        
        if any(term in combined_text for term in ['randomized', 'randomised', 'rct']):
            return 'randomized-controlled-trial'
        elif any(term in combined_text for term in ['clinical trial', 'phase i', 'phase ii', 'phase iii']):
            return 'clinical-trial'
        elif any(term in combined_text for term in ['meta-analysis', 'metaanalysis']):
            return 'meta-analysis'
        elif any(term in combined_text for term in ['systematic review']):
            return 'systematic-review'
        elif 'case report' in combined_text:
            return 'case-report'
        elif 'in vitro' in combined_text:
            return 'in-vitro-study'
        elif 'animal study' in combined_text or 'animal model' in combined_text:
            return 'animal-study'
        
        return 'research-article'
    
    async def get_paper_details(self, pmid: str = None, pmcid: str = None) -> Optional[Dict[str, Any]]:
        """Get detailed information for a specific paper"""
        
        if not pmid and not pmcid:
            return None
        
        session = await self._get_session()
        
        # Determine ID to use
        paper_id = pmid if pmid else pmcid
        id_type = 'MED' if pmid else 'PMC'
        
        params = {
            'format': 'json',
            'resultType': 'core'
        }
        
        url = f"{self.base_url}{id_type}/{paper_id}"
        
        try:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    logger.warning(f"Failed to get Europe PMC details for {paper_id}: {response.status}")
                    return None
                
                data = await response.json()
                result_list = data.get('resultList', {})
                results = result_list.get('result', [])
                
                if results:
                    return results[0]
                    
        except Exception as e:
            logger.warning(f"Error getting Europe PMC details for {paper_id}: {e}")
        
        return None
    
    async def get_citations(self, pmid: str = None, pmcid: str = None, max_citations: int = 10) -> List[Dict[str, Any]]:
        """Get citations for a paper"""
        
        if not pmid and not pmcid:
            return []
        
        session = await self._get_session()
        
        paper_id = pmid if pmid else pmcid
        id_type = 'MED' if pmid else 'PMC'
        
        params = {
            'format': 'json',
            'pageSize': max_citations
        }
        
        url = f"{self.base_url}{id_type}/{paper_id}/citations"
        
        try:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    return []
                
                data = await response.json()
                result_list = data.get('resultList', {})
                return result_list.get('result', [])
                
        except Exception as e:
            logger.warning(f"Error getting citations for {paper_id}: {e}")
            return []
    
    async def get_similar_papers(self, pmid: str = None, pmcid: str = None, max_results: int = 5) -> List[ResearchPaper]:
        """Get papers similar to a given paper"""
        
        if not pmid and not pmcid:
            return []
        
        session = await self._get_session()
        
        paper_id = pmid if pmid else pmcid
        id_type = 'MED' if pmid else 'PMC'
        
        params = {
            'format': 'json',
            'pageSize': max_results
        }
        
        url = f"{self.base_url}{id_type}/{paper_id}/textMinedTerms"
        
        try:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    return []
                
                data = await response.json()
                
                # Extract terms and search for similar papers
                semantic_types = data.get('semanticTypeList', {}).get('semanticType', [])
                
                # Build search query from extracted terms
                search_terms = []
                for semantic_type in semantic_types[:5]:  # Top 5 semantic types
                    tmTerm = semantic_type.get('tmTerm', [])
                    for term in tmTerm[:3]:  # Top 3 terms per type
                        term_text = term.get('term', '').strip()
                        if term_text and len(term_text) > 3:
                            search_terms.append(f'"{term_text}"')
                
                if search_terms:
                    search_query = ' OR '.join(search_terms)
                    return await self._search_papers(search_query, max_results)
                
        except Exception as e:
            logger.warning(f"Error getting similar papers for {paper_id}: {e}")
        
        return []
    
    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
            self.session = None