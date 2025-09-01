"""
Educational MCP Server
Main server that provides educational research tools via Model Context Protocol
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from pathlib import Path
import yaml
from datetime import datetime

# MCP imports (these would need to be installed: pip install mcp)
try:
    from mcp.server import Server
    from mcp.types import Tool, Resource
    MCP_AVAILABLE = True
except ImportError:
    # Fallback for development without MCP
    MCP_AVAILABLE = False
    class Server:
        def __init__(self, name): self.name = name
    Tool = Dict
    Resource = Dict

import sys
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from sources.aggregator import EducationalSourceAggregator
from mcp_types import ResearchQuery, ResearchPaper
from analyzers.credibility_scorer import CredibilityScorer
from analyzers.relevance_matcher import RelevanceMatcher

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EducationalMCPServer:
    """MCP Server for educational research and evidence-based information"""
    
    def __init__(self):
        self.server = Server("educational-research") if MCP_AVAILABLE else None
        self.aggregator = EducationalSourceAggregator()
        
        # Load configuration
        config_path = Path(__file__).parent / "config" / "source_config.yaml"
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
        
        # Initialize analyzers
        self.credibility_scorer = CredibilityScorer(self.config['credibility_weights'])
        self.relevance_matcher = RelevanceMatcher()
        
        # Setup MCP handlers if available
        if self.server:
            self._setup_mcp_handlers()
        
        logger.info("Educational MCP Server initialized")
    
    def _setup_mcp_handlers(self):
        """Setup MCP tool and resource handlers"""
        
        @self.server.list_tools()
        async def handle_list_tools() -> List[Tool]:
            return [
                {
                    "name": "fetch_research_evidence",
                    "description": "Fetch peer-reviewed research evidence on hemp/CBD topics from multiple academic sources",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Research query (e.g., 'CBD for sleep anxiety')"
                            },
                            "intent": {
                                "type": "string",
                                "enum": ["sleep", "anxiety", "pain", "epilepsy", "dosage", "safety", "general"],
                                "description": "Primary intent/condition of interest"
                            },
                            "compounds": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Cannabinoids of interest (e.g., ['CBD', 'CBN'])"
                            },
                            "min_year": {
                                "type": "integer",
                                "default": 2015,
                                "description": "Minimum publication year"
                            },
                            "max_results": {
                                "type": "integer",
                                "default": 15,
                                "description": "Maximum number of papers to return"
                            },
                            "source_types": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Preferred study types (clinical-trial, review, meta-analysis)"
                            }
                        },
                        "required": ["query", "intent"]
                    }
                },
                {
                    "name": "get_dosage_guidelines",
                    "description": "Get evidence-based dosage guidelines from clinical studies",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "compound": {
                                "type": "string",
                                "description": "Cannabinoid compound (CBD, CBN, CBG, etc.)"
                            },
                            "condition": {
                                "type": "string",
                                "description": "Medical condition or intent (sleep, anxiety, pain, etc.)"
                            },
                            "user_profile": {
                                "type": "object",
                                "properties": {
                                    "experience_level": {"type": "string", "enum": ["beginner", "intermediate", "experienced"]},
                                    "weight": {"type": "number"},
                                    "age": {"type": "integer"},
                                    "medications": {"type": "array", "items": {"type": "string"}}
                                },
                                "description": "User profile for personalized recommendations"
                            }
                        },
                        "required": ["compound", "condition"]
                    }
                },
                {
                    "name": "check_drug_interactions",
                    "description": "Check for potential drug interactions with hemp/CBD compounds using FDA data",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "compounds": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Hemp compounds to check (CBD, CBN, etc.)"
                            },
                            "medications": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Current medications"
                            }
                        },
                        "required": ["compounds"]
                    }
                },
                {
                    "name": "get_legal_status",
                    "description": "Get current legal status and regulations for hemp products by jurisdiction",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "default": "NC",
                                "description": "State or jurisdiction (e.g., 'NC', 'federal')"
                            },
                            "product_type": {
                                "type": "string",
                                "description": "Type of hemp product (oil, edible, flower, etc.)"
                            },
                            "compounds": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Specific compounds to check legality"
                            }
                        },
                        "required": ["location"]
                    }
                },
                {
                    "name": "explain_mechanism",
                    "description": "Get scientific explanation of how cannabinoids work in the body",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "compound": {
                                "type": "string",
                                "description": "Cannabinoid to explain (CBD, CBN, THC, etc.)"
                            },
                            "target_system": {
                                "type": "string",
                                "enum": ["endocannabinoid", "serotonin", "gaba", "dopamine", "general"],
                                "default": "endocannabinoid",
                                "description": "Biological system of interest"
                            },
                            "detail_level": {
                                "type": "string",
                                "enum": ["basic", "intermediate", "advanced"],
                                "default": "intermediate",
                                "description": "Level of scientific detail"
                            }
                        },
                        "required": ["compound"]
                    }
                },
                {
                    "name": "analyze_source_quality",
                    "description": "Analyze the quality and credibility of research sources",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "papers": {
                                "type": "array",
                                "description": "Research papers to analyze (from fetch_research_evidence)"
                            },
                            "query_context": {
                                "type": "string",
                                "description": "Original query for relevance analysis"
                            }
                        },
                        "required": ["papers"]
                    }
                }
            ]
        
        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: Dict) -> Any:
            """Handle tool execution"""
            
            try:
                if name == "fetch_research_evidence":
                    return await self._fetch_research_evidence(**arguments)
                elif name == "get_dosage_guidelines":
                    return await self._get_dosage_guidelines(**arguments)
                elif name == "check_drug_interactions":
                    return await self._check_drug_interactions(**arguments)
                elif name == "get_legal_status":
                    return await self._get_legal_status(**arguments)
                elif name == "explain_mechanism":
                    return await self._explain_mechanism(**arguments)
                elif name == "analyze_source_quality":
                    return await self._analyze_source_quality(**arguments)
                else:
                    raise ValueError(f"Unknown tool: {name}")
            
            except Exception as e:
                logger.error(f"Tool execution failed: {name}, error: {e}")
                return {"error": str(e), "tool": name}
        
        @self.server.list_resources()
        async def handle_list_resources() -> List[Resource]:
            return [
                {
                    "uri": "educational://research/database",
                    "name": "Research Database",
                    "description": "Cached research papers and studies",
                    "mimeType": "application/json"
                },
                {
                    "uri": "educational://guidelines/dosage",
                    "name": "Dosage Guidelines",
                    "description": "Evidence-based dosing recommendations",
                    "mimeType": "application/json"
                },
                {
                    "uri": "educational://safety/interactions",
                    "name": "Drug Interactions Database",
                    "description": "Known drug interactions with cannabinoids",
                    "mimeType": "application/json"
                },
                {
                    "uri": "educational://legal/status",
                    "name": "Legal Status Database",
                    "description": "Current legal status by jurisdiction",
                    "mimeType": "application/json"
                }
            ]
    
    async def _fetch_research_evidence(self, query: str, intent: str, 
                                     compounds: List[str] = None, 
                                     min_year: int = 2015,
                                     max_results: int = 15,
                                     source_types: List[str] = None) -> Dict[str, Any]:
        """Fetch research evidence from multiple academic sources"""
        
        # Default compounds if not provided
        if not compounds:
            compounds = self._extract_compounds_from_query(query)
        
        # Create research query
        research_query = ResearchQuery(
            query=query,
            intent=intent,
            compounds=compounds,
            min_year=min_year,
            max_results=max_results,
            source_types=source_types or []
        )
        
        logger.info(f"Fetching research for: {query} (intent: {intent})")
        
        # Fetch research evidence
        result = await self.aggregator.fetch_research_evidence(research_query)
        
        # Add credibility analysis
        if result.get('papers'):
            papers = [self._dict_to_paper(paper_dict) for paper_dict in result['papers']]
            quality_analysis = self.credibility_scorer.analyze_source_quality(papers)
            result['quality_analysis'] = quality_analysis
            
            # Add relevance analysis
            relevance_analysis = self.relevance_matcher.get_relevance_summary(papers, research_query)
            result['relevance_analysis'] = relevance_analysis
        
        return result
    
    async def _get_dosage_guidelines(self, compound: str, condition: str, 
                                   user_profile: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get evidence-based dosage guidelines"""
        
        logger.info(f"Getting dosage guidelines for {compound} - {condition}")
        
        # Use aggregator's dosage method
        result = await self.aggregator.get_dosage_guidelines(compound, condition, user_profile)
        
        # Add safety considerations
        safety_info = await self._get_safety_considerations(compound, user_profile)
        result['safety_considerations'] = safety_info
        
        return result
    
    async def _check_drug_interactions(self, compounds: List[str], 
                                     medications: List[str] = None) -> Dict[str, Any]:
        """Check for drug interactions using FDA data"""
        
        logger.info(f"Checking drug interactions for: {compounds}")
        
        interactions = {}
        
        for compound in compounds:
            # Get FDA safety information
            try:
                fda_safety = await self.aggregator.fda_client.get_drug_safety_info(compound)
                interactions[compound] = {
                    'fda_interactions': fda_safety.get('drug_interactions', []),
                    'adverse_events': fda_safety.get('adverse_events', [])[:5],  # Top 5
                    'warnings': fda_safety.get('warnings', [])
                }
            except Exception as e:
                logger.error(f"Failed to get FDA data for {compound}: {e}")
                interactions[compound] = {'error': str(e)}
        
        # Add general interaction warnings
        general_warnings = self._get_general_interaction_warnings(compounds)
        
        return {
            'compounds': compounds,
            'medications_checked': medications or [],
            'interactions': interactions,
            'general_warnings': general_warnings,
            'recommendation': self._generate_interaction_recommendation(interactions),
            'last_updated': datetime.utcnow().isoformat()
        }
    
    async def _get_legal_status(self, location: str = "NC", 
                              product_type: str = None,
                              compounds: List[str] = None) -> Dict[str, Any]:
        """Get current legal status and regulations"""
        
        logger.info(f"Getting legal status for {location}")
        
        # North Carolina specific regulations
        nc_status = {
            'hemp_derived_cbd': {
                'legal': True,
                'thc_limit': '0.3% Delta-9 THC by dry weight',
                'age_requirement': '18+ (21+ for Delta-8/THCA products)',
                'testing_required': True,
                'source': 'NC Department of Agriculture & Consumer Services'
            },
            'delta_8_thc': {
                'legal': True,
                'age_requirement': '21+',
                'restrictions': 'Cannot exceed 0.3% Delta-9 THC',
                'source': 'NC General Statute 90-87'
            },
            'thca_products': {
                'legal': True,
                'age_requirement': '21+',
                'restrictions': 'Must be hemp-derived, lab tested',
                'source': 'NC Hemp Program'
            }
        }
        
        federal_status = {
            'hemp_cbd': {
                'legal': True,
                'source': '2018 Farm Bill',
                'thc_limit': '0.3% Delta-9 THC',
                'regulation': 'FDA oversight for food/supplements'
            }
        }
        
        return {
            'location': location,
            'federal_status': federal_status,
            'state_status': nc_status if location.upper() == 'NC' else {},
            'last_updated': '2024-01-01',
            'sources': [
                'NC Department of Agriculture & Consumer Services',
                '2018 Farm Bill',
                'FDA Regulations'
            ],
            'compliance_notes': [
                'All hemp products must be lab tested',
                'Child-resistant packaging required',
                'No medical claims without FDA approval',
                'Age verification required for purchase'
            ]
        }
    
    async def _explain_mechanism(self, compound: str, 
                                target_system: str = "endocannabinoid",
                                detail_level: str = "intermediate") -> Dict[str, Any]:
        """Explain how cannabinoids work in the body"""
        
        logger.info(f"Explaining mechanism for {compound} - {target_system}")
        
        # Get research papers about mechanism
        research_query = ResearchQuery(
            query=f"{compound} mechanism of action {target_system}",
            intent="mechanism",
            compounds=[compound],
            max_results=8
        )
        
        research_result = await self.aggregator.fetch_research_evidence(research_query)
        
        # Generate explanation based on detail level
        explanations = {
            'basic': self._get_basic_mechanism_explanation(compound, target_system),
            'intermediate': self._get_intermediate_mechanism_explanation(compound, target_system),
            'advanced': self._get_advanced_mechanism_explanation(compound, target_system)
        }
        
        return {
            'compound': compound,
            'target_system': target_system,
            'detail_level': detail_level,
            'explanation': explanations[detail_level],
            'key_pathways': self._get_key_pathways(compound),
            'research_evidence': research_result.get('papers', [])[:5],  # Top 5 papers
            'related_compounds': self._get_related_compounds(compound),
            'clinical_significance': self._get_clinical_significance(compound, target_system)
        }
    
    async def _analyze_source_quality(self, papers: List[Dict], 
                                    query_context: str = None) -> Dict[str, Any]:
        """Analyze quality and credibility of research sources"""
        
        if not papers:
            return {"error": "No papers provided for analysis"}
        
        # Convert dict papers to ResearchPaper objects
        paper_objects = [self._dict_to_paper(paper) for paper in papers]
        
        # Analyze credibility
        quality_analysis = self.credibility_scorer.analyze_source_quality(paper_objects)
        
        # Analyze relevance if query provided
        relevance_analysis = {}
        if query_context:
            dummy_query = ResearchQuery(
                query=query_context,
                intent="general",
                compounds=[]
            )
            relevance_analysis = self.relevance_matcher.get_relevance_summary(paper_objects, dummy_query)
        
        return {
            'total_papers_analyzed': len(papers),
            'quality_analysis': quality_analysis,
            'relevance_analysis': relevance_analysis,
            'recommendations': self._generate_source_recommendations(quality_analysis, relevance_analysis),
            'analysis_timestamp': datetime.utcnow().isoformat()
        }
    
    # Helper methods
    
    def _extract_compounds_from_query(self, query: str) -> List[str]:
        """Extract cannabinoid compounds from query text"""
        compounds = []
        query_lower = query.lower()
        
        # Comprehensive cannabinoid detection patterns
        compound_patterns = {
            'CBD': ['cbd', 'cannabidiol'],
            'CBN': ['cbn', 'cannabinol'],
            'CBG': ['cbg', 'cannabigerol'],
            'CBC': ['cbc', 'cannabichromene'],
            'THC': ['thc', 'tetrahydrocannabinol', 'delta-9', 'delta 9', 'd9', 'delta9'],
            'THCA': ['thca', 'thc-a', 'tetrahydrocannabinolic acid', 'raw thc'],
            'Delta-8': ['delta-8', 'delta 8', 'd8', 'delta8', 'delta-8-thc'],
            'Delta-10': ['delta-10', 'delta 10', 'd10', 'delta10', 'delta-10-thc'],
            'HHC': ['hhc', 'hexahydrocannabinol'],
            'THCP': ['thcp', 'thc-p', 'tetrahydrocannabiphorol'],
            'THCV': ['thcv', 'thc-v', 'tetrahydrocannabivarin'],
            'CBDV': ['cbdv', 'cbd-v', 'cannabidivarin'],
            'CBL': ['cbl', 'cannabicyclol'],
            'CBGA': ['cbga', 'cannabigerolic acid'],
            'CBDA': ['cbda', 'cannabidiolic acid']
        }
        
        # Intent-based compound inference for slang/effects
        effect_to_compounds = {
            'high': ['THC', 'THCA', 'Delta-8', 'Delta-10', 'HHC'],
            'stoned': ['THC', 'THCA', 'CBN'],
            'euphoria': ['THC', 'Delta-8', 'HHC', 'THCP'],
            'buzz': ['Delta-8', 'HHC', 'Delta-10'],
            'legal high': ['Delta-8', 'HHC', 'THCA', 'Delta-10'],
            'party': ['Delta-8', 'THCV', 'Delta-10'],
            'microdose': ['THC', 'Delta-8'],
            'creative': ['THCV', 'Delta-10', 'CBG'],
            'focus': ['THCV', 'CBG', 'Delta-10'],
            'energy': ['THCV', 'CBG', 'Delta-10'],
            'appetite': ['THCV'],  # THCV suppresses appetite
            'weight': ['THCV'],
            'sleep': ['CBN', 'THC', 'Delta-8'],
            'pain': ['THC', 'CBD', 'CBC'],
            'anxiety': ['CBD', 'Delta-8'],
            'inflammation': ['CBD', 'CBC', 'CBG']
        }
        
        # Check for direct compound mentions
        for compound, patterns in compound_patterns.items():
            if any(pattern in query_lower for pattern in patterns):
                compounds.append(compound)
        
        # Check for effect-based compound inference
        if not compounds:
            for effect, effect_compounds in effect_to_compounds.items():
                if effect in query_lower:
                    compounds.extend(effect_compounds)
                    break
        
        # Remove duplicates and return
        compounds = list(set(compounds))
        
        # Default fallback - include both CBD and THC for comprehensive research
        return compounds or ['CBD', 'THC']
    
    def _dict_to_paper(self, paper_dict: Dict) -> ResearchPaper:
        """Convert dictionary to ResearchPaper object"""
        return ResearchPaper(
            id=paper_dict.get('id', ''),
            title=paper_dict.get('title', ''),
            authors=paper_dict.get('authors', []),
            year=paper_dict.get('year', 2024),
            journal=paper_dict.get('journal', ''),
            abstract=paper_dict.get('abstract', ''),
            doi=paper_dict.get('doi', ''),
            pubmed_id=paper_dict.get('pubmed_id', ''),
            url=paper_dict.get('url', ''),
            source=paper_dict.get('source', ''),
            study_type=paper_dict.get('study_type', ''),
            credibility_score=paper_dict.get('credibility_score', 0.0),
            relevance_score=paper_dict.get('relevance_score', 0.0),
            citation_count=paper_dict.get('citation_count', 0)
        )
    
    def _get_safety_considerations(self, compound: str, user_profile: Dict = None) -> List[str]:
        """Get safety considerations for a compound"""
        
        general_safety = [
            "Start with lowest recommended dose",
            "Wait 2+ hours between doses to assess effects",
            "Consult healthcare provider if taking medications",
            "Discontinue use if adverse effects occur"
        ]
        
        compound_specific = {
            'CBD': [
                "May interact with blood thinners",
                "Can affect liver enzymes at high doses",
                "Generally well-tolerated in most people"
            ],
            'CBN': [
                "May cause drowsiness - avoid driving",
                "Limited research on long-term effects",
                "Start with very low doses (1-2mg)"
            ],
            'THC': [
                "Psychoactive effects possible",
                "May cause anxiety in sensitive individuals",
                "Legal restrictions apply in many areas"
            ]
        }
        
        safety_notes = general_safety + compound_specific.get(compound.upper(), [])
        
        # Add user-specific considerations
        if user_profile:
            if user_profile.get('medications'):
                safety_notes.append("Drug interaction screening recommended due to current medications")
            if user_profile.get('age', 0) > 65:
                safety_notes.append("Older adults may be more sensitive to effects")
        
        return safety_notes
    
    def _get_general_interaction_warnings(self, compounds: List[str]) -> List[str]:
        """Get general interaction warnings"""
        warnings = []
        
        if 'CBD' in [c.upper() for c in compounds]:
            warnings.extend([
                "CBD may interact with blood thinners (warfarin)",
                "CBD can affect liver metabolism of certain medications",
                "Monitor for increased sedation when combined with CNS depressants"
            ])
        
        if 'CBN' in [c.upper() for c in compounds]:
            warnings.append("CBN may enhance sedative effects of sleep medications")
        
        warnings.append("Always consult healthcare provider before combining with prescription medications")
        
        return warnings
    
    def _generate_interaction_recommendation(self, interactions: Dict) -> str:
        """Generate interaction safety recommendation"""
        
        has_interactions = any(
            interaction.get('fda_interactions') or interaction.get('adverse_events')
            for interaction in interactions.values()
        )
        
        if has_interactions:
            return "Potential interactions found. Consult healthcare provider before use, especially with current medications."
        else:
            return "Limited interaction data available. As with any supplement, consult healthcare provider if taking medications."
    
    def _get_basic_mechanism_explanation(self, compound: str, system: str) -> str:
        """Basic explanation of how compound works"""
        
        explanations = {
            'CBD': "CBD works by interacting with your body's natural endocannabinoid system, which helps regulate mood, sleep, and pain. Unlike THC, CBD doesn't cause a 'high' but may help promote balance and wellness.",
            'CBN': "CBN is known for its calming effects and works by interacting with receptors in your brain that control sleep and relaxation. It's often called the 'sleepy' cannabinoid.",
            'CBG': "CBG is sometimes called the 'mother cannabinoid' and may help with focus and energy. It works differently than CBD and doesn't cause drowsiness."
        }
        
        return explanations.get(compound.upper(), f"{compound} interacts with your body's endocannabinoid system to potentially provide therapeutic benefits.")
    
    def _get_intermediate_mechanism_explanation(self, compound: str, system: str) -> str:
        """Intermediate explanation with more detail"""
        
        explanations = {
            'CBD': "CBD (cannabidiol) works primarily by inhibiting the enzyme FAAH, which breaks down anandamide - your body's natural 'bliss' molecule. This increases anandamide levels, potentially reducing anxiety and inflammation. CBD also interacts with serotonin 5-HT1A receptors, which may explain its anti-anxiety effects.",
            'CBN': "CBN (cannabinol) acts as a partial agonist at CB1 receptors in the brain, particularly in areas that regulate sleep and circadian rhythms. It may also interact with GABA receptors, enhancing the brain's primary inhibitory neurotransmitter system, leading to sedative effects.",
            'CBG': "CBG (cannabigerol) has a unique mechanism, acting as an antagonist at CB1 receptors while potentially interacting with alpha-2 adrenergic receptors. This may explain its potential for promoting alertness without psychoactive effects."
        }
        
        return explanations.get(compound.upper(), f"{compound} interacts with multiple receptor systems including cannabinoid, serotonin, and other neurotransmitter pathways.")
    
    def _get_advanced_mechanism_explanation(self, compound: str, system: str) -> str:
        """Advanced scientific explanation"""
        
        explanations = {
            'CBD': "CBD exhibits complex pharmacology involving multiple molecular targets. Primary mechanisms include: (1) FAAH inhibition leading to increased anandamide and 2-AG signaling, (2) negative allosteric modulation of CB1 receptors, (3) 5-HT1A receptor agonism contributing to anxiolytic effects, (4) TRPV1 receptor activation, and (5) potential GPR55 antagonism. CBD also influences voltage-gated sodium channels and may modulate GABAergic neurotransmission indirectly.",
            'CBN': "CBN demonstrates moderate affinity for CB1 receptors (Ki ≈ 211 nM) and weaker CB2 binding. Its sedative effects likely result from enhanced adenosine signaling and modulation of GABAergic transmission. CBN may also interact with TRPA1 channels and shows some activity at histamine H1 receptors, contributing to its sleep-promoting properties through multiple convergent pathways.",
            'CBG': "CBG exhibits nanomolar affinity for CB1 (Ki ≈ 381 nM) and CB2 (Ki ≈ 168 nM) receptors but acts as an antagonist/inverse agonist. It demonstrates significant activity at α2-adrenergic receptors and may modulate 5-HT1A signaling. CBG also shows TRPM8 antagonism and potential GABA reuptake inhibition, creating a unique pharmacological profile distinct from other cannabinoids."
        }
        
        return explanations.get(compound.upper(), f"{compound} exhibits complex multi-target pharmacology involving cannabinoid receptors, ion channels, and neurotransmitter systems.")
    
    def _get_key_pathways(self, compound: str) -> List[str]:
        """Get key biological pathways affected"""
        
        pathways = {
            'CBD': ['Endocannabinoid system', 'Serotonergic pathway', 'Vanilloid system', 'Adenosine signaling'],
            'CBN': ['CB1 receptor pathway', 'GABAergic system', 'Adenosine pathway', 'Histamine system'],
            'CBG': ['Cannabinoid receptors', 'Adrenergic system', 'GABA system', 'TRP channels'],
            'THC': ['CB1/CB2 receptors', 'Dopaminergic pathway', 'GABAergic system', 'Glutamatergic system']
        }
        
        return pathways.get(compound.upper(), ['Endocannabinoid system'])
    
    def _get_related_compounds(self, compound: str) -> List[str]:
        """Get related compounds that work synergistically"""
        
        related = {
            'CBD': ['CBG', 'CBC', 'Terpenes (myrcene, limonene)'],
            'CBN': ['CBD', 'Melatonin', 'Terpenes (myrcene, linalool)'],
            'CBG': ['CBD', 'CBC', 'Terpenes (pinene, limonene)'],
            'THC': ['CBD', 'CBG', 'Terpenes (various)']
        }
        
        return related.get(compound.upper(), [])
    
    def _get_clinical_significance(self, compound: str, system: str) -> str:
        """Get clinical significance of the mechanism"""
        
        significance = {
            'CBD': "Clinical significance includes FDA approval for epilepsy (Epidiolex) and promising research for anxiety, PTSD, and inflammatory conditions.",
            'CBN': "Clinical research is limited but shows promise for sleep disorders and may be useful as a non-habit-forming sleep aid.",
            'CBG': "Early clinical research suggests potential for glaucoma, inflammatory bowel disease, and bacterial infections, though more studies needed."
        }
        
        return significance.get(compound.upper(), "Clinical research is ongoing to establish therapeutic applications.")
    
    def _generate_source_recommendations(self, quality_analysis: Dict, relevance_analysis: Dict) -> List[str]:
        """Generate recommendations based on source analysis"""
        
        recommendations = []
        
        if quality_analysis:
            avg_quality = quality_analysis.get('average_credibility', 0)
            if avg_quality >= 7:
                recommendations.append("Excellent source quality - high confidence in recommendations")
            elif avg_quality >= 5:
                recommendations.append("Good source quality - reliable evidence base")
            else:
                recommendations.append("Limited source quality - consider seeking additional research")
        
        if relevance_analysis:
            avg_relevance = relevance_analysis.get('average_relevance', 0)
            if avg_relevance >= 0.7:
                recommendations.append("High relevance to query - directly applicable findings")
            elif avg_relevance >= 0.4:
                recommendations.append("Moderate relevance - findings may be partially applicable")
            else:
                recommendations.append("Limited relevance - may need more specific search terms")
        
        recommendations.append("Always consult healthcare providers for medical decisions")
        
        return recommendations
    
    async def close(self):
        """Clean up resources"""
        await self.aggregator.close()
        logger.info("Educational MCP Server closed")

# Server initialization for direct running
async def main():
    """Main function for running the MCP server"""
    server = EducationalMCPServer()
    
    # Example usage (for testing)
    logger.info("Educational MCP Server started - ready for queries")
    
    # Keep server running
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        await server.close()

if __name__ == "__main__":
    asyncio.run(main())