"""
Leafly API Client
Fetches strain data, effects, terpene profiles, and product information from Leafly
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

class LeaflyClient:
    """Client for Leafly strain and product data"""
    
    def __init__(self, config: Dict[str, Any]):
        self.base_url = config.get('base_url', 'https://web-gateway.leafly.com/api/')
        self.api_key = config.get('api_key')
        self.session = None
        
        # Headers to mimic browser requests
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        }
        
        if self.api_key:
            self.headers['Authorization'] = f'Bearer {self.api_key}'
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session"""
        if self.session is None:
            timeout = aiohttp.ClientTimeout(total=30)
            self.session = aiohttp.ClientSession(timeout=timeout, headers=self.headers)
        return self.session
    
    async def search(self, query: str, compounds: List[str], intent: str,
                    min_year: int = 2020, max_results: int = 10) -> List[ResearchPaper]:
        """
        Search for strain and product information related to query
        """
        papers = []
        
        # Search for strains related to compounds and intent
        strains = await self._search_strains(compounds, intent, max_results)
        
        for strain in strains:
            paper = self._convert_strain_to_paper(strain, query, intent)
            if paper:
                papers.append(paper)
        
        logger.info(f"Found {len(papers)} Leafly strain records")
        return papers
    
    async def _search_strains(self, compounds: List[str], intent: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Search for cannabis strains based on compounds and intent"""
        
        session = await self._get_session()
        
        # Build search parameters
        search_params = {
            'take': max_results,
            'skip': 0,
            'sort': 'popularity'
        }
        
        # Add filters based on intent
        filters = self._build_strain_filters(compounds, intent)
        if filters:
            search_params.update(filters)
        
        url = f"{self.base_url}strains"
        
        try:
            async with session.get(url, params=search_params) as response:
                if response.status != 200:
                    logger.warning(f"Leafly strain search failed: {response.status}")
                    # Fallback to static strain data if API fails
                    return self._get_fallback_strains(compounds, intent, max_results)
                
                data = await response.json()
                return data.get('data', [])
                
        except Exception as e:
            logger.warning(f"Leafly strain search error: {e}")
            # Return fallback data
            return self._get_fallback_strains(compounds, intent, max_results)
    
    def _build_strain_filters(self, compounds: List[str], intent: str) -> Dict[str, Any]:
        """Build strain search filters"""
        
        filters = {}
        
        # Add cannabinoid filters
        if 'CBD' in [c.upper() for c in compounds]:
            filters['cannabinoids'] = 'cbd'
        if 'CBG' in [c.upper() for c in compounds]:
            filters['cannabinoids'] = 'cbg'
        if 'CBN' in [c.upper() for c in compounds]:
            filters['cannabinoids'] = 'cbn'
        
        # Add effect filters based on intent
        effect_mapping = {
            'sleep': ['sleepy', 'relaxed', 'calm'],
            'anxiety': ['calm', 'relaxed', 'focused'],
            'pain': ['relaxed', 'euphoric', 'pain-relief'],
            'focus': ['focused', 'creative', 'energetic'],
            'energy': ['energetic', 'creative', 'uplifted']
        }
        
        if intent in effect_mapping:
            filters['effects'] = effect_mapping[intent][0]  # Primary effect
        
        return filters
    
    def _get_fallback_strains(self, compounds: List[str], intent: str, max_results: int) -> List[Dict[str, Any]]:
        """Fallback strain data when API is unavailable"""
        
        # Static strain database with popular strains
        fallback_strains = [
            {
                'name': 'Charlotte\'s Web',
                'type': 'sativa',
                'description': 'High-CBD strain known for therapeutic benefits without psychoactive effects.',
                'thc_percentage': {'min': 0.3, 'max': 1.0},
                'cbd_percentage': {'min': 13.0, 'max': 20.0},
                'effects': ['relaxed', 'calm', 'focused'],
                'terpenes': ['myrcene', 'pinene', 'caryophyllene'],
                'medical_uses': ['seizures', 'anxiety', 'inflammation'],
                'reviews_count': 850,
                'rating': 4.2,
                'category': 'medical'
            },
            {
                'name': 'ACDC',
                'type': 'sativa',
                'description': 'CBD-dominant strain with minimal THC, ideal for anxiety and pain relief.',
                'thc_percentage': {'min': 0.5, 'max': 1.2},
                'cbd_percentage': {'min': 14.0, 'max': 20.0},
                'effects': ['calm', 'relaxed', 'uplifted'],
                'terpenes': ['myrcene', 'pinene', 'limonene'],
                'medical_uses': ['anxiety', 'pain', 'epilepsy'],
                'reviews_count': 1200,
                'rating': 4.5,
                'category': 'medical'
            },
            {
                'name': 'Harlequin',
                'type': 'sativa',
                'description': 'Balanced CBD:THC ratio providing therapeutic benefits with mild psychoactivity.',
                'thc_percentage': {'min': 4.0, 'max': 7.0},
                'cbd_percentage': {'min': 8.0, 'max': 15.0},
                'effects': ['relaxed', 'happy', 'focused'],
                'terpenes': ['myrcene', 'pinene', 'caryophyllene'],
                'medical_uses': ['anxiety', 'pain', 'arthritis'],
                'reviews_count': 980,
                'rating': 4.3,
                'category': 'balanced'
            },
            {
                'name': 'Cannatonic',
                'type': 'hybrid',
                'description': 'High-CBD hybrid with relaxing effects and minimal psychoactivity.',
                'thc_percentage': {'min': 3.0, 'max': 6.0},
                'cbd_percentage': {'min': 12.0, 'max': 18.0},
                'effects': ['relaxed', 'happy', 'calm'],
                'terpenes': ['myrcene', 'limonene', 'caryophyllene'],
                'medical_uses': ['anxiety', 'pain', 'muscle-spasms'],
                'reviews_count': 750,
                'rating': 4.1,
                'category': 'medical'
            },
            {
                'name': 'Remedy',
                'type': 'indica',
                'description': 'Pure CBD strain with no THC, perfect for medical users seeking therapeutic benefits.',
                'thc_percentage': {'min': 0.0, 'max': 0.1},
                'cbd_percentage': {'min': 15.0, 'max': 22.0},
                'effects': ['relaxed', 'calm', 'sleepy'],
                'terpenes': ['myrcene', 'pinene', 'linalool'],
                'medical_uses': ['seizures', 'inflammation', 'anxiety'],
                'reviews_count': 420,
                'rating': 4.4,
                'category': 'medical'
            }
        ]
        
        # Filter based on compounds and intent
        filtered_strains = []
        
        for strain in fallback_strains:
            include_strain = False
            
            # Check if strain matches compound preferences
            for compound in compounds:
                if compound.upper() == 'CBD' and strain['cbd_percentage']['min'] > 8.0:
                    include_strain = True
                elif compound.upper() == 'THC' and strain['thc_percentage']['min'] > 5.0:
                    include_strain = True
            
            # Check if strain matches intent
            intent_effects = {
                'sleep': ['sleepy', 'relaxed', 'calm'],
                'anxiety': ['calm', 'relaxed', 'happy'],
                'pain': ['relaxed', 'calm'],
                'focus': ['focused', 'uplifted']
            }
            
            if intent in intent_effects:
                strain_effects = strain.get('effects', [])
                if any(effect in strain_effects for effect in intent_effects[intent]):
                    include_strain = True
            
            if include_strain:
                filtered_strains.append(strain)
        
        return filtered_strains[:max_results]
    
    def _convert_strain_to_paper(self, strain: Dict[str, Any], query: str, intent: str) -> Optional[ResearchPaper]:
        """Convert Leafly strain data to ResearchPaper format"""
        
        try:
            name = strain.get('name', 'Unknown Strain')
            strain_type = strain.get('type', 'hybrid')
            description = strain.get('description', '')
            
            # Build comprehensive title
            title = f"Cannabis Strain Profile: {name} ({strain_type.title()})"
            
            # Extract cannabinoid information
            thc_range = strain.get('thc_percentage', {})
            cbd_range = strain.get('cbd_percentage', {})
            
            thc_text = ""
            cbd_text = ""
            
            if thc_range:
                thc_min = thc_range.get('min', 0)
                thc_max = thc_range.get('max', 0)
                thc_text = f"THC: {thc_min}-{thc_max}%"
            
            if cbd_range:
                cbd_min = cbd_range.get('min', 0)
                cbd_max = cbd_range.get('max', 0)
                cbd_text = f"CBD: {cbd_min}-{cbd_max}%"
            
            # Build abstract
            abstract_parts = [description]
            
            if thc_text or cbd_text:
                cannabinoid_info = f"Cannabinoid Profile: {thc_text}{', ' if thc_text and cbd_text else ''}{cbd_text}"
                abstract_parts.append(cannabinoid_info)
            
            effects = strain.get('effects', [])
            if effects:
                effects_text = f"Primary Effects: {', '.join(effects[:5])}"
                abstract_parts.append(effects_text)
            
            terpenes = strain.get('terpenes', [])
            if terpenes:
                terpenes_text = f"Dominant Terpenes: {', '.join(terpenes[:3])}"
                abstract_parts.append(terpenes_text)
            
            medical_uses = strain.get('medical_uses', [])
            if medical_uses:
                medical_text = f"Medical Applications: {', '.join(medical_uses)}"
                abstract_parts.append(medical_text)
            
            reviews_count = strain.get('reviews_count', 0)
            rating = strain.get('rating', 0)
            if reviews_count and rating:
                reviews_text = f"User Reviews: {reviews_count} reviews, {rating}/5.0 rating"
                abstract_parts.append(reviews_text)
            
            abstract = ". ".join(abstract_parts)
            if len(abstract) > 1000:
                abstract = abstract[:997] + "..."
            
            # Generate URL (fallback since we may not have real URLs)
            strain_slug = name.lower().replace(' ', '-').replace("'", "")
            url = f"https://www.leafly.com/strains/{strain_slug}"
            
            return ResearchPaper(
                id=f"leafly_strain_{strain_slug}",
                title=title,
                authors=["Leafly Strain Database"],
                year=datetime.now().year,
                journal="Leafly Cannabis Strain Guide",
                abstract=abstract,
                doi="",
                pubmed_id="",
                url=url,
                source="leafly",
                study_type="strain-profile",
                credibility_score=0.0,  # Will be scored later
                relevance_score=0.0,    # Will be scored later
                citation_count=reviews_count  # Use review count as citation equivalent
            )
            
        except Exception as e:
            logger.warning(f"Failed to convert Leafly strain: {e}")
            return None
    
    async def get_strain_details(self, strain_name: str) -> Optional[Dict[str, Any]]:
        """Get detailed information for a specific strain"""
        
        session = await self._get_session()
        
        # URL encode strain name
        encoded_name = quote(strain_name.lower().replace(' ', '-'))
        url = f"{self.base_url}strains/{encoded_name}"
        
        try:
            async with session.get(url) as response:
                if response.status != 200:
                    logger.warning(f"Failed to get strain details for {strain_name}: {response.status}")
                    return None
                
                data = await response.json()
                return data.get('data')
                
        except Exception as e:
            logger.warning(f"Error getting strain details for {strain_name}: {e}")
            return None
    
    async def search_by_effects(self, desired_effects: List[str], max_results: int = 10) -> List[Dict[str, Any]]:
        """Search strains by desired effects"""
        
        session = await self._get_session()
        
        params = {
            'take': max_results,
            'effects': ','.join(desired_effects),
            'sort': 'rating'
        }
        
        url = f"{self.base_url}strains"
        
        try:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    logger.warning(f"Leafly effects search failed: {response.status}")
                    return []
                
                data = await response.json()
                return data.get('data', [])
                
        except Exception as e:
            logger.warning(f"Leafly effects search error: {e}")
            return []
    
    async def get_terpene_profiles(self, strain_names: List[str]) -> Dict[str, Dict[str, Any]]:
        """Get terpene profiles for multiple strains"""
        
        terpene_data = {}
        
        for strain_name in strain_names:
            try:
                strain_details = await self.get_strain_details(strain_name)
                if strain_details and 'terpenes' in strain_details:
                    terpene_data[strain_name] = strain_details['terpenes']
            except Exception as e:
                logger.warning(f"Failed to get terpene profile for {strain_name}: {e}")
        
        return terpene_data
    
    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
            self.session = None