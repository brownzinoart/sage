"""
ClinicalTrials.gov API Client
Fetches clinical trial data for hemp/CBD research
"""

import aiohttp
import asyncio
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
import re

import sys
import os
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from mcp_types import ResearchPaper

logger = logging.getLogger(__name__)

class ClinicalTrialsClient:
    """Client for ClinicalTrials.gov API v2"""
    
    def __init__(self, config: Dict[str, Any]):
        self.base_url = config['base_url']
        self.session = None
        
        # API endpoints
        self.search_endpoint = "studies"
        
        # Default parameters
        self.default_params = {
            'format': 'json',
            'countTotal': 'true',
            'pageSize': 50
        }
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session"""
        if self.session is None:
            timeout = aiohttp.ClientTimeout(total=30)
            self.session = aiohttp.ClientSession(timeout=timeout)
        return self.session
    
    async def search(self, query: str, compounds: List[str], intent: str, 
                    min_year: int = 2015) -> List[ResearchPaper]:
        """
        Search ClinicalTrials.gov for relevant studies
        """
        
        # Build search query
        search_query = self._build_search_query(query, compounds, intent)
        
        logger.info(f"ClinicalTrials search query: {search_query}")
        
        # Search for studies
        studies = await self._search_studies(search_query, min_year)
        
        if not studies:
            logger.warning("No clinical trials found")
            return []
        
        logger.info(f"Found {len(studies)} clinical trials")
        
        # Convert to ResearchPaper format
        papers = []
        for study in studies:
            paper = self._convert_study_to_paper(study)
            if paper:
                papers.append(paper)
        
        return papers
    
    def _build_search_query(self, query: str, compounds: List[str], intent: str) -> str:
        """Build search query for ClinicalTrials.gov"""
        
        query_terms = []
        
        # Add cannabinoid terms
        for compound in compounds:
            if compound.upper() == 'CBD':
                query_terms.extend(['cannabidiol', 'CBD'])
            elif compound.upper() == 'CBN':
                query_terms.extend(['cannabinol', 'CBN'])
            elif compound.upper() == 'CBG':
                query_terms.extend(['cannabigerol', 'CBG'])
            elif compound.upper() == 'CBC':
                query_terms.extend(['cannabichromene', 'CBC'])
            else:
                query_terms.append(compound)
        
        # Add intent-specific terms
        intent_terms = self._get_intent_terms(intent)
        if intent_terms:
            query_terms.extend(intent_terms)
        
        # Add general query terms (cleaned)
        clean_query = re.sub(r'[^\w\s]', '', query)
        if clean_query.strip():
            query_terms.append(clean_query.strip())
        
        return ' OR '.join(query_terms[:10])  # Limit to avoid overly complex queries
    
    def _get_intent_terms(self, intent: str) -> List[str]:
        """Get search terms specific to user intent"""
        
        intent_mapping = {
            'sleep': ['insomnia', 'sleep disorder', 'sleep quality'],
            'anxiety': ['anxiety', 'anxiety disorder', 'stress'],
            'pain': ['pain', 'chronic pain', 'analgesia'],
            'epilepsy': ['epilepsy', 'seizure', 'Dravet syndrome', 'Lennox-Gastaut'],
            'cancer': ['cancer', 'tumor', 'oncology'],
            'safety': ['safety', 'adverse effects', 'toxicity']
        }
        
        return intent_mapping.get(intent, [])
    
    async def _search_studies(self, query: str, min_year: int) -> List[Dict[str, Any]]:
        """Search for studies using the API"""
        
        session = await self._get_session()
        
        params = {
            **self.default_params,
            'query.cond': query,
            'query.intr': 'cannabidiol OR CBD OR hemp OR cannabis',  # Intervention filter
            'filter.advanced': f'AREA[StudyFirstPostDate]RANGE[{min_year}-01-01,MAX]'  # Date filter
        }
        
        url = f"{self.base_url}{self.search_endpoint}"
        
        try:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    logger.error(f"ClinicalTrials search failed: {response.status}")
                    return []
                
                data = await response.json()
                return data.get('studies', [])
                
        except asyncio.TimeoutError:
            logger.error("ClinicalTrials search timeout")
            return []
        except Exception as e:
            logger.error(f"ClinicalTrials search error: {e}")
            return []
    
    def _convert_study_to_paper(self, study: Dict[str, Any]) -> Optional[ResearchPaper]:
        """Convert ClinicalTrials study to ResearchPaper format"""
        
        try:
            protocol_section = study.get('protocolSection', {})
            identification_module = protocol_section.get('identificationModule', {})
            description_module = protocol_section.get('descriptionModule', {})
            status_module = protocol_section.get('statusModule', {})
            contact_module = protocol_section.get('contactsLocationsModule', {})
            
            # Extract basic information
            nct_id = identification_module.get('nctId', '')
            title = identification_module.get('officialTitle') or identification_module.get('briefTitle', '')
            
            # Extract investigators as authors
            authors = self._extract_investigators(contact_module)
            
            # Extract summary/description
            brief_summary = description_module.get('briefSummary', '')
            detailed_description = description_module.get('detailedDescription', '')
            abstract = f"{brief_summary}\n\n{detailed_description}".strip()
            
            # Extract dates
            study_first_submit_date = status_module.get('studyFirstSubmitDate', '')
            year = self._extract_year_from_date(study_first_submit_date)
            
            # Extract study type and phase
            design_module = protocol_section.get('designModule', {})
            study_type = design_module.get('studyType', 'Interventional')
            phases = design_module.get('phases', [])
            
            # Determine journal (use ClinicalTrials as source)
            journal = "ClinicalTrials.gov"
            
            # Build URL
            url = f"https://clinicaltrials.gov/study/{nct_id}"
            
            # Categorize study type
            categorized_type = self._categorize_clinical_study_type(study_type, phases)
            
            return ResearchPaper(
                id=f"clinical_trial_{nct_id}",
                title=title,
                authors=authors,
                year=year,
                journal=journal,
                abstract=abstract[:1000] + "..." if len(abstract) > 1000 else abstract,
                doi="",  # Clinical trials don't have DOIs
                pubmed_id="",
                url=url,
                source="clinical_trials",
                study_type=categorized_type,
                credibility_score=0.0,  # Will be scored later
                relevance_score=0.0,    # Will be scored later
                citation_count=0
            )
            
        except Exception as e:
            logger.warning(f"Failed to convert clinical trial: {e}")
            return None
    
    def _extract_investigators(self, contact_module: Dict[str, Any]) -> List[str]:
        """Extract principal investigators as authors"""
        
        authors = []
        
        # Try to get central contacts first
        central_contacts = contact_module.get('centralContacts', [])
        for contact in central_contacts:
            name = contact.get('name', '')
            if name:
                authors.append(name)
        
        # Try overall officials
        overall_officials = contact_module.get('overallOfficials', [])
        for official in overall_officials:
            name = official.get('name', '')
            if name and name not in authors:
                authors.append(name)
        
        # If no authors found, use "Clinical Trial Investigators"
        if not authors:
            authors = ["Clinical Trial Investigators"]
        
        return authors[:5]  # Limit to 5 authors
    
    def _extract_year_from_date(self, date_str: str) -> int:
        """Extract year from date string"""
        
        if not date_str:
            return datetime.now().year
        
        try:
            # Try different date formats
            for fmt in ['%Y-%m-%d', '%B %d, %Y', '%Y']:
                try:
                    date_obj = datetime.strptime(date_str, fmt)
                    return date_obj.year
                except ValueError:
                    continue
            
            # Extract year with regex
            year_match = re.search(r'(\d{4})', date_str)
            if year_match:
                return int(year_match.group(1))
                
        except Exception:
            pass
        
        return datetime.now().year
    
    def _categorize_clinical_study_type(self, study_type: str, phases: List[str]) -> str:
        """Categorize clinical study type"""
        
        if study_type.lower() == 'observational':
            return 'observational-study'
        
        if phases:
            phase_str = ', '.join(phases).lower()
            if 'phase 1' in phase_str:
                return 'phase-1-trial'
            elif 'phase 2' in phase_str:
                return 'phase-2-trial'
            elif 'phase 3' in phase_str:
                return 'phase-3-trial'
            elif 'phase 4' in phase_str:
                return 'phase-4-trial'
        
        return 'clinical-trial'
    
    async def get_study_details(self, nct_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information for a specific study"""
        
        session = await self._get_session()
        
        params = {
            'format': 'json',
            'fields': 'all'
        }
        
        url = f"{self.base_url}{self.search_endpoint}/{nct_id}"
        
        try:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    logger.error(f"Failed to get study details for {nct_id}: {response.status}")
                    return None
                
                data = await response.json()
                studies = data.get('studies', [])
                return studies[0] if studies else None
                
        except Exception as e:
            logger.error(f"Error getting study details for {nct_id}: {e}")
            return None
    
    async def search_by_intervention(self, intervention: str, condition: str = None) -> List[Dict[str, Any]]:
        """Search specifically by intervention (drug/compound)"""
        
        session = await self._get_session()
        
        params = {
            **self.default_params,
            'query.intr': intervention
        }
        
        if condition:
            params['query.cond'] = condition
        
        url = f"{self.base_url}{self.search_endpoint}"
        
        try:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    logger.error(f"ClinicalTrials intervention search failed: {response.status}")
                    return []
                
                data = await response.json()
                return data.get('studies', [])
                
        except Exception as e:
            logger.error(f"ClinicalTrials intervention search error: {e}")
            return []
    
    async def get_completed_studies(self, compounds: List[str]) -> List[ResearchPaper]:
        """Get only completed studies for more reliable data"""
        
        papers = []
        
        for compound in compounds:
            session = await self._get_session()
            
            params = {
                **self.default_params,
                'query.intr': compound,
                'filter.overallStatus': 'COMPLETED'  # Only completed studies
            }
            
            url = f"{self.base_url}{self.search_endpoint}"
            
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        studies = data.get('studies', [])
                        
                        for study in studies:
                            paper = self._convert_study_to_paper(study)
                            if paper:
                                papers.append(paper)
            except Exception as e:
                logger.error(f"Error fetching completed studies for {compound}: {e}")
        
        return papers
    
    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
            self.session = None