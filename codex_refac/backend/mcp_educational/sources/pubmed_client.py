"""
PubMed API Client
Fetches peer-reviewed research papers from NCBI PubMed and PMC databases
"""

import aiohttp
import asyncio
import xml.etree.ElementTree as ET
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

class PubMedClient:
    """Client for NCBI PubMed and PMC APIs"""
    
    def __init__(self, config: Dict[str, Any]):
        self.base_url = config['base_url']
        self.api_key = config.get('api_key')  # Optional, increases rate limit
        self.session = None
        
        # Common parameters
        self.email = "sage@budguide.com"  # Required for higher rate limits
        self.tool = "BudGuide-Educational-MCP"
        
        # Search parameters
        self.default_params = {
            'retmode': 'xml',
            'retmax': 50,
            'email': self.email,
            'tool': self.tool
        }
        
        if self.api_key:
            self.default_params['api_key'] = self.api_key
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session"""
        if self.session is None:
            timeout = aiohttp.ClientTimeout(total=30)
            self.session = aiohttp.ClientSession(timeout=timeout)
        return self.session
    
    async def search(self, query: str, compounds: List[str], intent: str, 
                    min_year: int = 2015, max_results: int = 20) -> List[ResearchPaper]:
        """
        Search PubMed for research papers
        """
        # Build search query
        search_query = self._build_search_query(query, compounds, intent, min_year)
        
        logger.info(f"PubMed search query: {search_query}")
        
        # Step 1: Search for paper IDs
        paper_ids = await self._search_papers(search_query, max_results)
        
        if not paper_ids:
            logger.warning("No papers found in PubMed")
            return []
        
        logger.info(f"Found {len(paper_ids)} papers in PubMed")
        
        # Step 2: Fetch detailed information
        papers = await self._fetch_paper_details(paper_ids)
        
        return papers
    
    def _build_search_query(self, query: str, compounds: List[str], intent: str, min_year: int) -> str:
        """Build PubMed search query with proper syntax"""
        
        # Base query terms
        query_terms = []
        
        # Add cannabinoid terms
        compound_terms = []
        for compound in compounds:
            if compound.upper() == 'CBD':
                compound_terms.append('(cannabidiol[Title/Abstract] OR CBD[Title/Abstract])')
            elif compound.upper() == 'CBN':
                compound_terms.append('(cannabinol[Title/Abstract] OR CBN[Title/Abstract])')
            elif compound.upper() == 'CBG':
                compound_terms.append('(cannabigerol[Title/Abstract] OR CBG[Title/Abstract])')
            elif compound.upper() == 'CBC':
                compound_terms.append('(cannabichromene[Title/Abstract] OR CBC[Title/Abstract])')
            else:
                compound_terms.append(f'{compound}[Title/Abstract]')
        
        if compound_terms:
            query_terms.append(f"({' OR '.join(compound_terms)})")
        
        # Add condition-specific terms
        intent_terms = self._get_intent_terms(intent)
        if intent_terms:
            query_terms.append(f"({intent_terms})")
        
        # Add general query terms
        if query and not any(compound.lower() in query.lower() for compound in compounds):
            # Clean and add user query if it doesn't duplicate compound terms
            clean_query = re.sub(r'[^\w\s]', '', query)
            if clean_query.strip():
                query_terms.append(f'({clean_query}[Title/Abstract])')
        
        # Join with AND
        full_query = ' AND '.join(query_terms)
        
        # Add publication type filters
        full_query += ' AND (Clinical Trial[Publication Type] OR Randomized Controlled Trial[Publication Type] OR Review[Publication Type] OR Meta-Analysis[Publication Type] OR Systematic Review[Publication Type] OR Case Reports[Publication Type])'
        
        # Add date filter
        full_query += f' AND {min_year}:3000[Publication Date]'
        
        # Add language filter
        full_query += ' AND English[Language]'
        
        # Add human studies filter
        full_query += ' AND humans[MeSH Terms]'
        
        return full_query
    
    def _get_intent_terms(self, intent: str) -> str:
        """Get search terms specific to user intent"""
        
        intent_mapping = {
            'sleep': 'sleep[Title/Abstract] OR insomnia[Title/Abstract] OR "sleep quality"[Title/Abstract] OR "sleep disorders"[Title/Abstract]',
            'anxiety': 'anxiety[Title/Abstract] OR "anxiety disorder"[Title/Abstract] OR anxiolytic[Title/Abstract] OR stress[Title/Abstract]',
            'pain': 'pain[Title/Abstract] OR "chronic pain"[Title/Abstract] OR analgesic[Title/Abstract] OR inflammation[Title/Abstract]',
            'epilepsy': 'epilepsy[Title/Abstract] OR seizure[Title/Abstract] OR anticonvulsant[Title/Abstract]',
            'cancer': 'cancer[Title/Abstract] OR tumor[Title/Abstract] OR oncology[Title/Abstract]',
            'dosage': 'dose[Title/Abstract] OR dosage[Title/Abstract] OR "dose response"[Title/Abstract]',
            'safety': 'safety[Title/Abstract] OR "adverse effects"[Title/Abstract] OR toxicity[Title/Abstract]'
        }
        
        return intent_mapping.get(intent, '')
    
    async def _search_papers(self, query: str, max_results: int) -> List[str]:
        """Search for paper IDs using ESearch"""
        
        session = await self._get_session()
        
        params = {
            **self.default_params,
            'db': 'pubmed',
            'term': query,
            'retmax': max_results,
            'usehistory': 'y'
        }
        
        url = f"{self.base_url}esearch.fcgi"
        
        try:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    logger.error(f"PubMed search failed: {response.status}")
                    return []
                
                xml_content = await response.text()
                return self._parse_search_results(xml_content)
                
        except asyncio.TimeoutError:
            logger.error("PubMed search timeout")
            return []
        except Exception as e:
            logger.error(f"PubMed search error: {e}")
            return []
    
    def _parse_search_results(self, xml_content: str) -> List[str]:
        """Parse XML search results to extract PubMed IDs"""
        
        try:
            root = ET.fromstring(xml_content)
            
            # Check for errors
            error_list = root.find('.//ErrorList')
            if error_list is not None:
                error_msg = error_list.find('.//PhraseNotFound')
                if error_msg is not None:
                    logger.warning(f"PubMed search warning: {error_msg.text}")
            
            # Extract IDs
            id_list = root.find('.//IdList')
            if id_list is not None:
                return [id_elem.text for id_elem in id_list.findall('Id')]
            
            return []
            
        except ET.ParseError as e:
            logger.error(f"Failed to parse PubMed search XML: {e}")
            return []
    
    async def _fetch_paper_details(self, paper_ids: List[str]) -> List[ResearchPaper]:
        """Fetch detailed information for papers using EFetch"""
        
        if not paper_ids:
            return []
        
        session = await self._get_session()
        
        # Split into batches of 20 to avoid URL length issues
        batch_size = 20
        all_papers = []
        
        for i in range(0, len(paper_ids), batch_size):
            batch_ids = paper_ids[i:i + batch_size]
            
            params = {
                **self.default_params,
                'db': 'pubmed',
                'id': ','.join(batch_ids),
                'rettype': 'abstract'
            }
            
            url = f"{self.base_url}efetch.fcgi"
            
            try:
                async with session.get(url, params=params) as response:
                    if response.status != 200:
                        logger.error(f"PubMed fetch failed: {response.status}")
                        continue
                    
                    xml_content = await response.text()
                    batch_papers = self._parse_paper_details(xml_content)
                    all_papers.extend(batch_papers)
                    
                    # Rate limiting - wait between batches
                    await asyncio.sleep(0.5)
                    
            except Exception as e:
                logger.error(f"PubMed fetch error for batch: {e}")
                continue
        
        return all_papers
    
    def _parse_paper_details(self, xml_content: str) -> List[ResearchPaper]:
        """Parse XML to extract detailed paper information"""
        
        papers = []
        
        try:
            root = ET.fromstring(xml_content)
            
            for article in root.findall('.//PubmedArticle'):
                try:
                    paper = self._parse_single_article(article)
                    if paper:
                        papers.append(paper)
                except Exception as e:
                    logger.warning(f"Failed to parse article: {e}")
                    continue
            
        except ET.ParseError as e:
            logger.error(f"Failed to parse PubMed details XML: {e}")
        
        return papers
    
    def _parse_single_article(self, article_elem) -> Optional[ResearchPaper]:
        """Parse a single PubmedArticle element"""
        
        try:
            # Extract PubMed ID
            pmid_elem = article_elem.find('.//PMID')
            pmid = pmid_elem.text if pmid_elem is not None else ""
            
            # Extract article details
            article_info = article_elem.find('.//Article')
            if article_info is None:
                return None
            
            # Title
            title_elem = article_info.find('.//ArticleTitle')
            title = title_elem.text if title_elem is not None else ""
            
            # Authors
            authors = self._extract_authors(article_info)
            
            # Journal
            journal_elem = article_info.find('.//Journal/Title')
            journal = journal_elem.text if journal_elem is not None else ""
            
            # Publication date/year
            year = self._extract_year(article_info)
            
            # Abstract
            abstract = self._extract_abstract(article_info)
            
            # DOI
            doi = self._extract_doi(article_elem)
            
            # Publication types
            pub_types = self._extract_publication_types(article_elem)
            study_type = self._categorize_study_type(pub_types)
            
            # Build URLs
            pubmed_url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
            doi_url = f"https://doi.org/{doi}" if doi else ""
            
            return ResearchPaper(
                id=f"pubmed_{pmid}",
                title=title,
                authors=authors,
                year=year,
                journal=journal,
                abstract=abstract,
                doi=doi,
                pubmed_id=pmid,
                url=doi_url or pubmed_url,
                source="pubmed",
                study_type=study_type,
                credibility_score=0.0,  # Will be scored later
                relevance_score=0.0,    # Will be scored later
                citation_count=0
            )
            
        except Exception as e:
            logger.warning(f"Failed to parse article: {e}")
            return None
    
    def _extract_authors(self, article_elem) -> List[str]:
        """Extract author names"""
        authors = []
        
        author_list = article_elem.find('.//AuthorList')
        if author_list is not None:
            for author in author_list.findall('Author'):
                last_name = author.find('LastName')
                first_name = author.find('ForeName')
                
                if last_name is not None:
                    name = last_name.text
                    if first_name is not None:
                        name = f"{last_name.text}, {first_name.text}"
                    authors.append(name)
        
        return authors
    
    def _extract_year(self, article_elem) -> int:
        """Extract publication year"""
        
        # Try article date first
        pub_date = article_elem.find('.//PubDate')
        if pub_date is not None:
            year_elem = pub_date.find('Year')
            if year_elem is not None:
                try:
                    return int(year_elem.text)
                except ValueError:
                    pass
        
        # Try journal issue date
        journal_issue = article_elem.find('.//JournalIssue/PubDate')
        if journal_issue is not None:
            year_elem = journal_issue.find('Year')
            if year_elem is not None:
                try:
                    return int(year_elem.text)
                except ValueError:
                    pass
        
        return datetime.now().year  # Default to current year
    
    def _extract_abstract(self, article_elem) -> str:
        """Extract article abstract"""
        abstract_parts = []
        
        abstract_elem = article_elem.find('.//Abstract')
        if abstract_elem is not None:
            # Handle structured abstracts
            for abstract_text in abstract_elem.findall('.//AbstractText'):
                label = abstract_text.get('Label', '')
                text = abstract_text.text or ''
                
                if label:
                    abstract_parts.append(f"{label}: {text}")
                else:
                    abstract_parts.append(text)
        
        return ' '.join(abstract_parts).strip()
    
    def _extract_doi(self, article_elem) -> str:
        """Extract DOI"""
        
        # Look in ArticleIdList
        id_list = article_elem.find('.//ArticleIdList')
        if id_list is not None:
            for article_id in id_list.findall('ArticleId'):
                if article_id.get('IdType') == 'doi':
                    return article_id.text or ""
        
        return ""
    
    def _extract_publication_types(self, article_elem) -> List[str]:
        """Extract publication types"""
        pub_types = []
        
        pub_type_list = article_elem.find('.//PublicationTypeList')
        if pub_type_list is not None:
            for pub_type in pub_type_list.findall('PublicationType'):
                if pub_type.text:
                    pub_types.append(pub_type.text.lower())
        
        return pub_types
    
    def _categorize_study_type(self, pub_types: List[str]) -> str:
        """Categorize study type based on publication types"""
        
        if any('randomized controlled trial' in pt for pt in pub_types):
            return 'randomized-controlled-trial'
        elif any('clinical trial' in pt for pt in pub_types):
            return 'clinical-trial'
        elif any('meta-analysis' in pt for pt in pub_types):
            return 'meta-analysis'
        elif any('systematic review' in pt for pt in pub_types):
            return 'systematic-review'
        elif any('review' in pt for pt in pub_types):
            return 'review'
        elif any('case report' in pt for pt in pub_types):
            return 'case-report'
        else:
            return 'research-article'
    
    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
            self.session = None