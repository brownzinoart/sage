"""
FDA API Client
Fetches regulatory and safety data from FDA databases
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

class FDAClient:
    """Client for FDA openFDA API"""
    
    def __init__(self, config: Dict[str, Any]):
        self.base_url = config['base_url']
        self.api_key = config.get('api_key')  # Optional, increases rate limit
        self.session = None
        
        # Available databases
        self.databases = {
            'drug_label': 'drug/label.json',
            'drug_event': 'drug/event.json',
            'food_enforcement': 'food/enforcement.json',
            'device_event': 'device/event.json'
        }
        
        # Default parameters
        self.default_params = {
            'limit': 20
        }
        
        if self.api_key:
            self.default_params['api_key'] = self.api_key
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session"""
        if self.session is None:
            timeout = aiohttp.ClientTimeout(total=30)
            self.session = aiohttp.ClientSession(timeout=timeout)
        return self.session
    
    async def search(self, query: str, compounds: List[str]) -> List[ResearchPaper]:
        """
        Search FDA databases for hemp/CBD related information
        """
        
        all_papers = []
        
        # Search drug labels
        drug_label_papers = await self._search_drug_labels(compounds)
        all_papers.extend(drug_label_papers)
        
        # Search adverse events
        adverse_event_papers = await self._search_adverse_events(compounds)
        all_papers.extend(adverse_event_papers)
        
        # Search food enforcement actions
        enforcement_papers = await self._search_food_enforcement(compounds)
        all_papers.extend(enforcement_papers)
        
        logger.info(f"Found {len(all_papers)} FDA records")
        
        return all_papers
    
    async def _search_drug_labels(self, compounds: List[str]) -> List[ResearchPaper]:
        """Search FDA drug label database"""
        
        papers = []
        
        for compound in compounds:
            search_terms = self._get_fda_search_terms(compound)
            
            for term in search_terms:
                try:
                    results = await self._search_database('drug_label', term)
                    
                    for result in results:
                        paper = self._convert_drug_label_to_paper(result, compound)
                        if paper:
                            papers.append(paper)
                
                except Exception as e:
                    logger.warning(f"FDA drug label search failed for {term}: {e}")
                
                # Rate limiting
                await asyncio.sleep(1)
        
        return papers
    
    async def _search_adverse_events(self, compounds: List[str]) -> List[ResearchPaper]:
        """Search FDA adverse event database"""
        
        papers = []
        
        for compound in compounds:
            search_terms = self._get_fda_search_terms(compound)
            
            for term in search_terms:
                try:
                    results = await self._search_database('drug_event', term)
                    
                    # Aggregate adverse events into summary
                    if results:
                        paper = self._convert_adverse_events_to_paper(results, compound)
                        if paper:
                            papers.append(paper)
                
                except Exception as e:
                    logger.warning(f"FDA adverse event search failed for {term}: {e}")
                
                # Rate limiting
                await asyncio.sleep(1)
        
        return papers
    
    async def _search_food_enforcement(self, compounds: List[str]) -> List[ResearchPaper]:
        """Search FDA food enforcement database"""
        
        papers = []
        
        # Search for CBD food enforcement actions
        hemp_terms = ['CBD', 'cannabidiol', 'hemp']
        
        for term in hemp_terms:
            try:
                results = await self._search_database('food_enforcement', term)
                
                if results:
                    paper = self._convert_enforcement_to_paper(results, term)
                    if paper:
                        papers.append(paper)
            
            except Exception as e:
                logger.warning(f"FDA food enforcement search failed for {term}: {e}")
            
            # Rate limiting
            await asyncio.sleep(1)
        
        return papers
    
    def _get_fda_search_terms(self, compound: str) -> List[str]:
        """Get FDA-specific search terms for compounds"""
        
        if compound.upper() == 'CBD':
            return ['cannabidiol', 'CBD']
        elif compound.upper() == 'CBN':
            return ['cannabinol', 'CBN']
        elif compound.upper() == 'CBG':
            return ['cannabigerol', 'CBG']
        elif compound.upper() == 'THC':
            return ['tetrahydrocannabinol', 'THC', 'delta-9-THC']
        else:
            return [compound]
    
    async def _search_database(self, db_type: str, search_term: str) -> List[Dict[str, Any]]:
        """Search a specific FDA database"""
        
        if db_type not in self.databases:
            logger.error(f"Unknown FDA database: {db_type}")
            return []
        
        session = await self._get_session()
        
        # Build search query based on database type
        if db_type == 'drug_label':
            search_query = f'openfda.generic_name:"{search_term}" OR openfda.brand_name:"{search_term}" OR description:"{search_term}"'
        elif db_type == 'drug_event':
            search_query = f'patient.drug.medicinalproduct:"{search_term}" OR patient.drug.openfda.generic_name:"{search_term}"'
        elif db_type == 'food_enforcement':
            search_query = f'product_description:"{search_term}" OR reason_for_recall:"{search_term}"'
        else:
            search_query = f'"{search_term}"'
        
        params = {
            **self.default_params,
            'search': search_query
        }
        
        url = f"{self.base_url}{self.databases[db_type]}"
        
        try:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    logger.warning(f"FDA {db_type} search failed: {response.status}")
                    return []
                
                data = await response.json()
                return data.get('results', [])
                
        except Exception as e:
            logger.error(f"FDA {db_type} search error: {e}")
            return []
    
    def _convert_drug_label_to_paper(self, label_data: Dict[str, Any], compound: str) -> Optional[ResearchPaper]:
        """Convert FDA drug label to ResearchPaper format"""
        
        try:
            openfda = label_data.get('openfda', {})
            
            # Extract product information
            brand_names = openfda.get('brand_name', [])
            generic_names = openfda.get('generic_name', [])
            
            title = f"FDA Drug Label: {brand_names[0] if brand_names else generic_names[0] if generic_names else compound}"
            
            # Extract description and warnings
            description = label_data.get('description', [''])[0] if label_data.get('description') else ''
            warnings = label_data.get('warnings', [''])[0] if label_data.get('warnings') else ''
            
            abstract = f"Drug Label Information: {description}\n\nWarnings: {warnings}"
            abstract = abstract[:800] + "..." if len(abstract) > 800 else abstract
            
            # Extract manufacturer as author
            manufacturer = openfda.get('manufacturer_name', ['FDA'])[0] if openfda.get('manufacturer_name') else 'FDA'
            
            # Extract application number for URL
            application_numbers = openfda.get('application_number', [])
            set_id = label_data.get('set_id', '')
            
            # Build URL
            url = f"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid={set_id}" if set_id else "https://www.fda.gov/"
            
            return ResearchPaper(
                id=f"fda_label_{set_id or hash(title)}",
                title=title,
                authors=[manufacturer],
                year=datetime.now().year,  # FDA labels are current
                journal="FDA Drug Labels",
                abstract=abstract,
                doi="",
                pubmed_id="",
                url=url,
                source="fda",
                study_type="regulatory-label",
                credibility_score=0.0,  # Will be scored later
                relevance_score=0.0,    # Will be scored later
                citation_count=0
            )
            
        except Exception as e:
            logger.warning(f"Failed to convert FDA drug label: {e}")
            return None
    
    def _convert_adverse_events_to_paper(self, events: List[Dict[str, Any]], compound: str) -> Optional[ResearchPaper]:
        """Convert FDA adverse events to summary paper"""
        
        try:
            if not events:
                return None
            
            # Analyze adverse events
            total_events = len(events)
            
            # Extract common reactions
            reactions = []
            for event in events:
                patient = event.get('patient', {})
                if 'reaction' in patient:
                    for reaction in patient['reaction']:
                        reaction_term = reaction.get('reactionmeddrapt', '')
                        if reaction_term:
                            reactions.append(reaction_term.lower())
            
            # Count most common reactions
            reaction_counts = {}
            for reaction in reactions:
                reaction_counts[reaction] = reaction_counts.get(reaction, 0) + 1
            
            top_reactions = sorted(reaction_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            
            # Create abstract
            abstract = f"FDA Adverse Event Analysis for {compound}: {total_events} reported events."
            if top_reactions:
                reaction_list = ", ".join([f"{reaction} ({count})" for reaction, count in top_reactions[:5]])
                abstract += f" Most common reactions: {reaction_list}."
            
            title = f"FDA Adverse Event Reports: {compound}"
            
            return ResearchPaper(
                id=f"fda_events_{compound.lower()}",
                title=title,
                authors=["FDA FAERS Database"],
                year=datetime.now().year,
                journal="FDA Adverse Event Reporting System (FAERS)",
                abstract=abstract,
                doi="",
                pubmed_id="",
                url="https://www.fda.gov/drugs/surveillance/fda-adverse-event-reporting-system-faers",
                source="fda",
                study_type="adverse-event-report",
                credibility_score=0.0,  # Will be scored later
                relevance_score=0.0,    # Will be scored later
                citation_count=0
            )
            
        except Exception as e:
            logger.warning(f"Failed to convert FDA adverse events: {e}")
            return None
    
    def _convert_enforcement_to_paper(self, enforcements: List[Dict[str, Any]], term: str) -> Optional[ResearchPaper]:
        """Convert FDA enforcement actions to paper"""
        
        try:
            if not enforcements:
                return None
            
            total_actions = len(enforcements)
            
            # Analyze enforcement reasons
            reasons = []
            for action in enforcements:
                reason = action.get('reason_for_recall', '')
                if reason:
                    reasons.append(reason)
            
            # Create abstract
            abstract = f"FDA Enforcement Actions related to {term}: {total_actions} actions recorded."
            if reasons:
                unique_reasons = list(set(reasons))[:5]
                reason_text = "; ".join(unique_reasons)
                abstract += f" Common reasons: {reason_text}"
            
            title = f"FDA Food Enforcement Actions: {term}"
            
            return ResearchPaper(
                id=f"fda_enforcement_{term.lower()}",
                title=title,
                authors=["FDA Center for Food Safety and Applied Nutrition"],
                year=datetime.now().year,
                journal="FDA Enforcement Reports",
                abstract=abstract,
                doi="",
                pubmed_id="",
                url="https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts",
                source="fda",
                study_type="regulatory-enforcement",
                credibility_score=0.0,  # Will be scored later
                relevance_score=0.0,    # Will be scored later
                citation_count=0
            )
            
        except Exception as e:
            logger.warning(f"Failed to convert FDA enforcement: {e}")
            return None
    
    async def get_drug_safety_info(self, compound: str) -> Dict[str, Any]:
        """Get comprehensive safety information for a compound"""
        
        safety_info = {
            'compound': compound,
            'adverse_events': [],
            'drug_interactions': [],
            'warnings': [],
            'contraindications': []
        }
        
        try:
            # Search adverse events
            adverse_results = await self._search_database('drug_event', compound)
            
            # Process adverse events
            for event in adverse_results[:10]:  # Limit to 10 most recent
                patient = event.get('patient', {})
                reactions = patient.get('reaction', [])
                
                for reaction in reactions:
                    reaction_info = {
                        'term': reaction.get('reactionmeddrapt', ''),
                        'outcome': reaction.get('reactionoutcome', ''),
                        'seriousness': event.get('serious', '')
                    }
                    safety_info['adverse_events'].append(reaction_info)
            
            # Search drug labels for warnings
            label_results = await self._search_database('drug_label', compound)
            
            for label in label_results[:5]:  # Limit to 5 labels
                warnings = label.get('warnings', [])
                contraindications = label.get('contraindications', [])
                drug_interactions = label.get('drug_interactions', [])
                
                safety_info['warnings'].extend(warnings)
                safety_info['contraindications'].extend(contraindications)
                safety_info['drug_interactions'].extend(drug_interactions)
        
        except Exception as e:
            logger.error(f"Error getting safety info for {compound}: {e}")
        
        return safety_info
    
    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
            self.session = None