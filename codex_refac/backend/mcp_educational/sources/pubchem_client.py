"""
PubChem API Client
Fetches chemical compound data for cannabinoids and terpenes
"""

import aiohttp
import asyncio
import json
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
from urllib.parse import quote

import sys
import os
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from mcp_types import ResearchPaper

logger = logging.getLogger(__name__)

class PubChemClient:
    """Client for PubChem compound database"""
    
    def __init__(self, config: Dict[str, Any]):
        self.base_url = config.get('base_url', 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/')
        self.session = None
        
        # Common cannabinoid and terpene CIDs (Compound IDs)
        self.known_compounds = {
            'cannabidiol': 644019,
            'CBD': 644019,
            'tetrahydrocannabinol': 16078,
            'THC': 16078,
            'cannabinol': 5284592,
            'CBN': 5284592,
            'cannabigerol': 5315659,
            'CBG': 5315659,
            'cannabichromene': 2940,
            'CBC': 2940,
            'myrcene': 31253,
            'limonene': 440917,
            'pinene': 6654,
            'linalool': 6549,
            'caryophyllene': 5281515,
            'humulene': 5281520,
            'terpinolene': 11463,
            'ocimene': 5281553
        }
        
        # Rate limiting
        self.request_delay = 0.2  # 200ms between requests
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session"""
        if self.session is None:
            timeout = aiohttp.ClientTimeout(total=30)
            self.session = aiohttp.ClientSession(timeout=timeout)
        return self.session
    
    async def search(self, query: str, compounds: List[str]) -> List[ResearchPaper]:
        """
        Search for chemical compound information
        """
        papers = []
        
        # Search for each compound
        for compound in compounds:
            try:
                compound_data = await self._get_compound_data(compound)
                if compound_data:
                    paper = self._convert_compound_to_paper(compound_data, compound)
                    if paper:
                        papers.append(paper)
                
                # Rate limiting
                await asyncio.sleep(self.request_delay)
                
            except Exception as e:
                logger.warning(f"Failed to get PubChem data for {compound}: {e}")
        
        # Also search for common terpenes if cannabinoids are present
        if any(c.upper() in ['CBD', 'THC', 'CBG', 'CBN', 'CBC'] for c in compounds):
            terpenes = ['myrcene', 'limonene', 'pinene', 'linalool', 'caryophyllene']
            
            for terpene in terpenes[:3]:  # Limit to 3 most common terpenes
                try:
                    terpene_data = await self._get_compound_data(terpene)
                    if terpene_data:
                        paper = self._convert_compound_to_paper(terpene_data, terpene)
                        if paper:
                            papers.append(paper)
                    
                    await asyncio.sleep(self.request_delay)
                    
                except Exception as e:
                    logger.warning(f"Failed to get PubChem data for terpene {terpene}: {e}")
        
        logger.info(f"Found {len(papers)} PubChem compound records")
        return papers
    
    async def _get_compound_data(self, compound_name: str) -> Optional[Dict[str, Any]]:
        """Get comprehensive compound data from PubChem"""
        
        # Try to get CID first
        cid = await self._get_compound_cid(compound_name)
        if not cid:
            return None
        
        # Get compound properties
        properties = await self._get_compound_properties(cid)
        
        # Get compound description
        description = await self._get_compound_description(cid)
        
        # Get bioactivity data
        bioactivity = await self._get_bioactivity_data(cid)
        
        compound_data = {
            'cid': cid,
            'name': compound_name,
            'properties': properties or {},
            'description': description or '',
            'bioactivity': bioactivity or {}
        }
        
        return compound_data
    
    async def _get_compound_cid(self, compound_name: str) -> Optional[int]:
        """Get PubChem Compound ID (CID) for a compound"""
        
        # Check known compounds first
        if compound_name.lower() in self.known_compounds:
            return self.known_compounds[compound_name.lower()]
        
        session = await self._get_session()
        
        # Search by name
        url = f"{self.base_url}compound/name/{quote(compound_name)}/cids/JSON"
        
        try:
            async with session.get(url) as response:
                if response.status != 200:
                    logger.debug(f"PubChem CID search failed for {compound_name}: {response.status}")
                    return None
                
                data = await response.json()
                cids = data.get('IdentifierList', {}).get('CID', [])
                
                if cids:
                    return int(cids[0])  # Return first CID
                    
        except Exception as e:
            logger.debug(f"Error getting CID for {compound_name}: {e}")
        
        return None
    
    async def _get_compound_properties(self, cid: int) -> Optional[Dict[str, Any]]:
        """Get compound properties from PubChem"""
        
        session = await self._get_session()
        
        # Request specific properties
        properties = [
            'MolecularFormula',
            'MolecularWeight', 
            'IUPACName',
            'InChI',
            'InChIKey',
            'CanonicalSMILES',
            'XLogP',
            'TPSA',
            'Complexity',
            'HBondDonorCount',
            'HBondAcceptorCount'
        ]
        
        property_string = ','.join(properties)
        url = f"{self.base_url}compound/cid/{cid}/property/{property_string}/JSON"
        
        try:
            async with session.get(url) as response:
                if response.status != 200:
                    logger.debug(f"PubChem properties failed for CID {cid}: {response.status}")
                    return None
                
                data = await response.json()
                properties_list = data.get('PropertyTable', {}).get('Properties', [])
                
                if properties_list:
                    return properties_list[0]
                    
        except Exception as e:
            logger.debug(f"Error getting properties for CID {cid}: {e}")
        
        return None
    
    async def _get_compound_description(self, cid: int) -> Optional[str]:
        """Get compound description from PubChem"""
        
        session = await self._get_session()
        
        url = f"{self.base_url}compound/cid/{cid}/description/XML"
        
        try:
            async with session.get(url) as response:
                if response.status != 200:
                    return None
                
                xml_content = await response.text()
                root = ET.fromstring(xml_content)
                
                # Extract description text
                descriptions = []
                for info in root.findall('.//Information'):
                    description_elem = info.find('.//Description')
                    if description_elem is not None and description_elem.text:
                        descriptions.append(description_elem.text.strip())
                
                if descriptions:
                    return descriptions[0]  # Return first description
                    
        except Exception as e:
            logger.debug(f"Error getting description for CID {cid}: {e}")
        
        return None
    
    async def _get_bioactivity_data(self, cid: int) -> Optional[Dict[str, Any]]:
        """Get bioactivity summary for compound"""
        
        session = await self._get_session()
        
        url = f"{self.base_url}compound/cid/{cid}/assaysummary/JSON"
        
        try:
            async with session.get(url) as response:
                if response.status != 200:
                    return None
                
                data = await response.json()
                
                # Extract bioactivity summary
                bioactivity_summary = data.get('Table', {})
                
                if bioactivity_summary:
                    return {
                        'active_assays': bioactivity_summary.get('TotalAssayCount', 0),
                        'active_targets': bioactivity_summary.get('ActiveAssayCount', 0),
                        'total_activity_outcomes': bioactivity_summary.get('TotalActivityOutcome', 0)
                    }
                    
        except Exception as e:
            logger.debug(f"Error getting bioactivity for CID {cid}: {e}")
        
        return None
    
    def _convert_compound_to_paper(self, compound_data: Dict[str, Any], original_query: str) -> Optional[ResearchPaper]:
        """Convert PubChem compound data to ResearchPaper format"""
        
        try:
            cid = compound_data.get('cid')
            name = compound_data.get('name', 'Unknown Compound')
            properties = compound_data.get('properties', {})
            description = compound_data.get('description', '')
            bioactivity = compound_data.get('bioactivity', {})
            
            # Build title
            title = f"Chemical Compound Profile: {name.title()}"
            
            # Build abstract
            abstract_parts = []
            
            if description:
                abstract_parts.append(description[:400])
            
            # Add molecular information
            molecular_formula = properties.get('MolecularFormula')
            molecular_weight = properties.get('MolecularWeight')
            if molecular_formula:
                molecular_info = f"Molecular Formula: {molecular_formula}"
                if molecular_weight:
                    molecular_info += f", Molecular Weight: {molecular_weight:.2f} g/mol"
                abstract_parts.append(molecular_info)
            
            # Add IUPAC name if available
            iupac_name = properties.get('IUPACName')
            if iupac_name and iupac_name != name:
                abstract_parts.append(f"IUPAC Name: {iupac_name}")
            
            # Add chemical properties
            xlogp = properties.get('XLogP')
            tpsa = properties.get('TPSA')
            if xlogp is not None or tpsa is not None:
                props = []
                if xlogp is not None:
                    props.append(f"XLogP: {xlogp}")
                if tpsa is not None:
                    props.append(f"TPSA: {tpsa} Ų")
                abstract_parts.append(f"Chemical Properties: {', '.join(props)}")
            
            # Add hydrogen bonding info
            hbd_count = properties.get('HBondDonorCount')
            hba_count = properties.get('HBondAcceptorCount')
            if hbd_count is not None or hba_count is not None:
                bonding_info = []
                if hbd_count is not None:
                    bonding_info.append(f"{hbd_count} H-bond donors")
                if hba_count is not None:
                    bonding_info.append(f"{hba_count} H-bond acceptors")
                abstract_parts.append(f"Hydrogen Bonding: {', '.join(bonding_info)}")
            
            # Add bioactivity info if available
            if bioactivity:
                active_assays = bioactivity.get('active_assays', 0)
                if active_assays > 0:
                    abstract_parts.append(f"Bioactivity: {active_assays} biological assays available")
            
            abstract = ". ".join(abstract_parts)
            if len(abstract) > 1200:
                abstract = abstract[:1197] + "..."
            
            # Determine compound category
            compound_category = self._categorize_compound(name, properties)
            
            # Build URL
            url = f"https://pubchem.ncbi.nlm.nih.gov/compound/{cid}"
            
            return ResearchPaper(
                id=f"pubchem_{cid}",
                title=title,
                authors=["PubChem Database, NCBI"],
                year=datetime.now().year,
                journal="PubChem Compound Database",
                abstract=abstract,
                doi="",
                pubmed_id="",
                url=url,
                source="pubchem",
                study_type=compound_category,
                credibility_score=0.0,  # Will be scored later
                relevance_score=0.0,    # Will be scored later
                citation_count=0
            )
            
        except Exception as e:
            logger.warning(f"Failed to convert PubChem compound: {e}")
            return None
    
    def _categorize_compound(self, compound_name: str, properties: Dict[str, Any]) -> str:
        """Categorize compound type"""
        
        name_lower = compound_name.lower()
        
        # Cannabinoids
        if any(term in name_lower for term in ['cannabidiol', 'cbd', 'tetrahydrocannabinol', 'thc', 'cannabinol', 'cbn', 'cannabigerol', 'cbg', 'cannabichromene', 'cbc']):
            return 'cannabinoid-compound'
        
        # Terpenes
        if any(term in name_lower for term in ['myrcene', 'limonene', 'pinene', 'linalool', 'caryophyllene', 'humulene', 'terpinolene', 'ocimene', 'terpene']):
            return 'terpene-compound'
        
        # General chemical compound
        return 'chemical-compound'
    
    async def get_compound_interactions(self, compound_name: str) -> Dict[str, Any]:
        """Get known drug interactions for a compound"""
        
        cid = await self._get_compound_cid(compound_name)
        if not cid:
            return {}
        
        session = await self._get_session()
        
        # Search for interaction data (this is limited in PubChem)
        url = f"{self.base_url}compound/cid/{cid}/xrefs/RN/JSON"
        
        try:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        'compound': compound_name,
                        'cid': cid,
                        'cross_references': data.get('InformationList', {}).get('Information', [])
                    }
        except Exception as e:
            logger.debug(f"Error getting interactions for {compound_name}: {e}")
        
        return {}
    
    async def get_terpene_effects_data(self, terpene_names: List[str]) -> Dict[str, Dict[str, Any]]:
        """Get chemical data for terpenes to understand their effects"""
        
        terpene_data = {}
        
        for terpene in terpene_names:
            try:
                compound_data = await self._get_compound_data(terpene)
                if compound_data:
                    # Add known effects based on chemical structure and literature
                    effects = self._get_known_terpene_effects(terpene)
                    compound_data['known_effects'] = effects
                    terpene_data[terpene] = compound_data
                
                await asyncio.sleep(self.request_delay)
                
            except Exception as e:
                logger.warning(f"Failed to get terpene data for {terpene}: {e}")
        
        return terpene_data
    
    def _get_known_terpene_effects(self, terpene_name: str) -> Dict[str, Any]:
        """Get known effects for common terpenes"""
        
        terpene_effects = {
            'myrcene': {
                'effects': ['sedating', 'relaxing', 'muscle-relaxant'],
                'aroma': 'earthy, musky, clove-like',
                'therapeutic': ['sleep', 'pain-relief', 'anti-inflammatory']
            },
            'limonene': {
                'effects': ['uplifting', 'stress-relief', 'mood-enhancement'],
                'aroma': 'citrus, lemon, orange',
                'therapeutic': ['anxiety', 'depression', 'acid-reflux']
            },
            'pinene': {
                'effects': ['alertness', 'memory-retention', 'counteracts-thc'],
                'aroma': 'pine, rosemary, basil',
                'therapeutic': ['asthma', 'pain', 'ulcers', 'anxiety']
            },
            'linalool': {
                'effects': ['calming', 'sedating', 'anti-anxiety'],
                'aroma': 'floral, lavender, spicy',
                'therapeutic': ['anxiety', 'depression', 'insomnia', 'pain']
            },
            'caryophyllene': {
                'effects': ['anti-inflammatory', 'analgesic', 'neuroprotective'],
                'aroma': 'spicy, woody, clove',
                'therapeutic': ['pain', 'anxiety', 'depression', 'ulcers']
            },
            'humulene': {
                'effects': ['appetite-suppressant', 'anti-inflammatory', 'antibacterial'],
                'aroma': 'woody, earthy, spicy',
                'therapeutic': ['inflammation', 'pain']
            }
        }
        
        return terpene_effects.get(terpene_name.lower(), {
            'effects': ['compound-specific-effects'],
            'aroma': 'varies',
            'therapeutic': ['research-ongoing']
        })
    
    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
            self.session = None