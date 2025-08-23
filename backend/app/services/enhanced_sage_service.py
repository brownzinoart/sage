"""
Enhanced Sage Service with Educational MCP Integration
Combines Gemini AI with educational research aggregation for evidence-based responses
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import sys
import os

from .advanced_gemini_service import AdvancedGeminiService, UserIntent, UserPersona

# Import educational MCP server
try:
    # Add MCP educational path
    mcp_path = os.path.join(os.path.dirname(__file__), '../../mcp_educational')
    if mcp_path not in sys.path:
        sys.path.insert(0, mcp_path)
    from server import EducationalMCPServer
    MCP_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Educational MCP server not available: {e}")
    MCP_AVAILABLE = False
    EducationalMCPServer = None

logger = logging.getLogger(__name__)

class EnhancedSageService(AdvancedGeminiService):
    """Enhanced Sage service that combines AI with educational research"""
    
    def __init__(self):
        super().__init__()
        
        # Initialize educational MCP server
        self.educational_mcp = None
        if MCP_AVAILABLE:
            try:
                self.educational_mcp = EducationalMCPServer()
                logger.info("Educational MCP server initialized")
            except Exception as e:
                logger.error(f"Failed to initialize educational MCP: {e}")
                self.educational_mcp = None
        
        # Compound extraction patterns
        self.compound_patterns = {
            'CBD': ['cbd', 'cannabidiol'],
            'CBN': ['cbn', 'cannabinol'],
            'CBG': ['cbg', 'cannabigerol'],
            'CBC': ['cbc', 'cannabichromene'],
            'THC': ['thc', 'tetrahydrocannabinol']
        }
    
    async def generate_enhanced_sage_response(self, user_query: str, experience_level: str = "casual") -> Dict[str, Any]:
        """
        Generate enhanced Sage response with parallel AI and research processing
        """
        
        if not self.educational_mcp:
            # Fallback to original service if MCP not available
            return self.generate_sage_response(user_query, experience_level)
        
        try:
            # Extract compounds and intent from query
            compounds = self._extract_compounds_from_query(user_query)
            intent, persona = self.classify_intent_and_persona(user_query)
            
            # Override persona based on experience level
            if experience_level == "new":
                persona = UserPersona.NEWCOMER
            elif experience_level == "experienced":
                persona = UserPersona.EXPERIENCED_USER
            else:
                persona = UserPersona.CURIOUS_LEARNER
            
            logger.info(f"Processing enhanced query: {user_query} (intent: {intent.value}, compounds: {compounds})")
            
            # Parallel execution of AI response and research gathering
            tasks = []
            
            # 1. Generate AI response (original Sage)
            ai_response_task = asyncio.create_task(
                self._generate_ai_response_async(user_query, intent, persona, experience_level)
            )
            tasks.append(("ai_response", ai_response_task))
            
            # 2. Fetch research evidence
            research_task = asyncio.create_task(
                self.educational_mcp._fetch_research_evidence(
                    query=user_query,
                    intent=intent.value,
                    compounds=compounds,
                    max_results=10
                )
            )
            tasks.append(("research", research_task))
            
            # 3. Get dosage guidelines (if relevant)
            if compounds and intent.value in ['sleep', 'anxiety', 'pain', 'dosage']:
                dosage_task = asyncio.create_task(
                    self.educational_mcp._get_dosage_guidelines(
                        compound=compounds[0],  # Primary compound
                        condition=intent.value,
                        user_profile={'experience_level': experience_level}
                    )
                )
                tasks.append(("dosage", dosage_task))
            
            # 4. Check safety information
            if compounds:
                safety_task = asyncio.create_task(
                    self.educational_mcp._check_drug_interactions(
                        compounds=compounds
                    )
                )
                tasks.append(("safety", safety_task))
            
            # 5. Get legal status
            legal_task = asyncio.create_task(
                self.educational_mcp._get_legal_status(
                    location="NC",
                    compounds=compounds
                )
            )
            tasks.append(("legal", legal_task))
            
            # Execute all tasks in parallel
            results = {}
            for task_name, task in tasks:
                try:
                    result = await task
                    results[task_name] = result
                except Exception as e:
                    logger.error(f"Task {task_name} failed: {e}")
                    results[task_name] = {"error": str(e)}
            
            # Combine results into enhanced response
            enhanced_response = self._combine_ai_and_research(results, user_query, compounds, intent.value)
            
            return enhanced_response
            
        except Exception as e:
            logger.error(f"Enhanced Sage response generation error: {e}")
            # Fallback to original service
            return self.generate_sage_response(user_query, experience_level)
    
    async def _generate_ai_response_async(self, user_query: str, intent: UserIntent, 
                                        persona: UserPersona, experience_level: str) -> Dict[str, Any]:
        """Generate AI response asynchronously"""
        
        # Run in thread to avoid blocking
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, 
            self._generate_ai_response_sync, 
            user_query, intent, persona, experience_level
        )
    
    def _generate_ai_response_sync(self, user_query: str, intent: UserIntent, 
                                 persona: UserPersona, experience_level: str) -> Dict[str, Any]:
        """Synchronous AI response generation"""
        
        try:
            # Generate personalized response
            system_prompt = self._get_system_prompt()
            context_prompt = self._get_context_prompt(intent, persona)
            response_prompt = self._get_response_prompt(user_query, intent, persona, experience_level)
            
            full_prompt = f"{system_prompt}\n\n{context_prompt}\n\n{response_prompt}"
            
            response = self.model.generate_content(full_prompt)
            
            # Parse the structured response
            parsed_response = self._parse_ai_response(response.text)
            
            # Generate products separately for better control
            products = self._generate_products(user_query, intent, persona, parsed_response['explanation'])
            
            return {
                'explanation': parsed_response['explanation'],
                'products': products,
                'intent': intent.value,
                'persona': persona.value,
                'follow_up_questions': parsed_response.get('follow_up_questions', [])
            }
            
        except Exception as e:
            logger.error(f"AI response generation error: {e}")
            return self._fallback_response(user_query, experience_level)
    
    def _combine_ai_and_research(self, results: Dict[str, Any], user_query: str, 
                               compounds: List[str], intent: str) -> Dict[str, Any]:
        """Combine AI response with research evidence"""
        
        # Get AI response
        ai_response = results.get('ai_response', {})
        
        # Base response structure
        enhanced_response = {
            'explanation': ai_response.get('explanation', ''),
            'products': ai_response.get('products', []),
            'intent': ai_response.get('intent', intent),
            'persona': ai_response.get('persona', 'curious_learner'),
            'follow_up_questions': ai_response.get('follow_up_questions', []),
            'educational_resources': {}
        }
        
        # Add research evidence
        research_data = results.get('research', {})
        if research_data and not research_data.get('error'):
            enhanced_response['educational_resources']['research_studies'] = {
                'papers': research_data.get('papers', [])[:8],  # Top 8 papers
                'summary': research_data.get('summary', {}),
                'quality_analysis': research_data.get('quality_analysis', {}),
                'total_found': research_data.get('total_found', 0)
            }
        
        # Add dosage guidelines
        dosage_data = results.get('dosage', {})
        if dosage_data and not dosage_data.get('error'):
            enhanced_response['educational_resources']['dosage_guidelines'] = {
                'guidelines': dosage_data.get('guidelines', {}),
                'recommendation': dosage_data.get('recommendation', ''),
                'evidence_base': dosage_data.get('evidence_base', []),
                'safety_considerations': dosage_data.get('safety_considerations', [])
            }
        
        # Add safety information
        safety_data = results.get('safety', {})
        if safety_data and not safety_data.get('error'):
            enhanced_response['educational_resources']['safety_information'] = {
                'interactions': safety_data.get('interactions', {}),
                'general_warnings': safety_data.get('general_warnings', []),
                'recommendation': safety_data.get('recommendation', '')
            }
        
        # Add legal status
        legal_data = results.get('legal', {})
        if legal_data and not legal_data.get('error'):
            enhanced_response['educational_resources']['legal_status'] = {
                'federal_status': legal_data.get('federal_status', {}),
                'state_status': legal_data.get('state_status', {}),
                'compliance_notes': legal_data.get('compliance_notes', [])
            }
        
        # Add mechanism explanation for educational value
        if compounds:
            enhanced_response['educational_resources']['mechanism_of_action'] = self._get_mechanism_summary(compounds[0], intent)
        
        # Add source credibility summary
        research_papers = enhanced_response['educational_resources'].get('research_studies', {}).get('papers', [])
        if research_papers:
            enhanced_response['educational_resources']['source_credibility'] = self._analyze_source_credibility(research_papers)
        
        # Update products with evidence context
        enhanced_response['products'] = self._enhance_products_with_evidence(
            ai_response.get('products', []), 
            enhanced_response['educational_resources']
        )
        
        # Add educational summary - always generate for demo
        enhanced_response['educational_summary'] = self._generate_educational_summary(
            enhanced_response['educational_resources'], 
            user_query, 
            compounds
        )
        
        return enhanced_response
    
    def _extract_compounds_from_query(self, query: str) -> List[str]:
        """Extract cannabinoid compounds mentioned in query"""
        
        compounds = []
        query_lower = query.lower()
        
        for compound, patterns in self.compound_patterns.items():
            if any(pattern in query_lower for pattern in patterns):
                compounds.append(compound)
        
        # Default to CBD if no specific compounds mentioned
        if not compounds:
            compounds = ['CBD']
        
        return compounds
    
    def _get_mechanism_summary(self, compound: str, intent: str) -> Dict[str, str]:
        """Get simplified mechanism explanation"""
        
        mechanisms = {
            'CBD': {
                'sleep': "CBD helps with sleep by calming the nervous system and reducing anxiety through serotonin receptors.",
                'anxiety': "CBD reduces anxiety by enhancing your body's natural anandamide levels and interacting with serotonin receptors.",
                'pain': "CBD helps with pain by reducing inflammation and interacting with pain receptors in your endocannabinoid system."
            },
            'CBN': {
                'sleep': "CBN promotes sleep by directly activating receptors in the brain that control sleep cycles and circadian rhythms.",
                'anxiety': "CBN may help with anxiety through its calming effects on the nervous system, though research is still developing."
            },
            'CBG': {
                'focus': "CBG may enhance focus by interacting with receptors that affect alertness without causing sedation.",
                'pain': "CBG shows potential for pain relief through its anti-inflammatory properties and interaction with pain pathways."
            }
        }
        
        compound_mechanisms = mechanisms.get(compound, {})
        explanation = compound_mechanisms.get(intent, f"{compound} works through the endocannabinoid system to potentially provide therapeutic benefits.")
        
        return {
            'compound': compound,
            'condition': intent,
            'explanation': explanation,
            'pathway': 'Endocannabinoid system'
        }
    
    def _analyze_source_credibility(self, papers: List[Dict]) -> Dict[str, Any]:
        """Analyze credibility of research sources"""
        
        if not papers:
            return {}
        
        # Count by source type
        source_counts = {}
        total_credibility = 0
        high_credibility_count = 0
        
        for paper in papers:
            source = paper.get('source', 'unknown')
            credibility = paper.get('credibility_score', 0)
            
            source_counts[source] = source_counts.get(source, 0) + 1
            total_credibility += credibility
            
            if credibility >= 7.0:
                high_credibility_count += 1
        
        avg_credibility = total_credibility / len(papers) if papers else 0
        
        return {
            'total_papers': len(papers),
            'average_credibility': round(avg_credibility, 2),
            'high_credibility_count': high_credibility_count,
            'source_distribution': source_counts,
            'credibility_level': self._get_credibility_level(avg_credibility)
        }
    
    def _get_credibility_level(self, avg_score: float) -> str:
        """Get credibility level description"""
        
        if avg_score >= 8:
            return "Excellent - High-quality peer-reviewed sources"
        elif avg_score >= 6:
            return "Good - Reliable academic sources"
        elif avg_score >= 4:
            return "Fair - Mixed quality sources"
        else:
            return "Limited - Preliminary evidence only"
    
    def _enhance_products_with_evidence(self, products: List[Dict], educational_resources: Dict) -> List[Dict]:
        """Enhance product recommendations with evidence context"""
        
        dosage_guidelines = educational_resources.get('dosage_guidelines', {})
        safety_info = educational_resources.get('safety_information', {})
        
        enhanced_products = []
        
        for product in products:
            enhanced_product = product.copy()
            
            # Add evidence-based dosage note
            if dosage_guidelines.get('recommendation'):
                enhanced_product['evidence_note'] = f"Clinical evidence suggests: {dosage_guidelines['recommendation']}"
            
            # Add safety consideration
            general_warnings = safety_info.get('general_warnings', [])
            if general_warnings:
                enhanced_product['safety_note'] = general_warnings[0]  # First warning
            
            enhanced_products.append(enhanced_product)
        
        return enhanced_products
    
    def _generate_educational_summary(self, educational_resources: Dict, 
                                    user_query: str, compounds: List[str]) -> Dict[str, Any]:
        """Generate educational summary using Gemini AI"""
        
        # Generate educational content using Gemini AI
        educational_prompt = f"""
        Generate an educational summary about {', '.join(compounds) if compounds else 'hemp compounds'} for the user query: "{user_query}"
        
        Provide educational content in this JSON format:
        {{
            "query": "{user_query}",
            "compounds_researched": {compounds},
            "evidence_strength": "moderate",
            "key_findings": [
                "Educational point 1 about how these compounds work",
                "Educational point 2 about potential benefits",
                "Educational point 3 about safety considerations"
            ],
            "mechanism_explanation": "Brief explanation of how these compounds work in the body",
            "confidence_level": "moderate"
        }}
        
        Focus on educational content that helps users understand the science behind hemp compounds.
        """
        
        try:
            response = self.model.generate_content(educational_prompt)
            import json
            # Try to parse JSON response
            summary_data = json.loads(response.text.replace('```json', '').replace('```', '').strip())
            return summary_data
        except Exception as e:
            logger.error(f"Error generating educational summary: {e}")
            # Fallback summary
            return {
                'query': user_query,
                'compounds_researched': compounds,
                'evidence_strength': 'educational',
                'key_findings': [
                    'Hemp compounds interact with your body\'s endocannabinoid system',
                    'Different compounds have different effects and benefits',
                    'Start with small amounts and adjust based on your body\'s response'
                ],
                'mechanism_explanation': 'Hemp compounds work by interacting with cannabinoid receptors throughout your body, helping to maintain balance and wellness.',
                'confidence_level': 'educational'
            }
    
    def _extract_key_findings(self, papers: List[Dict], query: str) -> List[str]:
        """Extract key findings from research papers"""
        
        findings = []
        
        # Look for common themes in paper titles and abstracts
        sleep_indicators = ['sleep', 'insomnia', 'rest']
        anxiety_indicators = ['anxiety', 'stress', 'calm']
        pain_indicators = ['pain', 'inflammation', 'analgesic']
        
        query_lower = query.lower()
        
        # Count papers by topic
        sleep_papers = len([p for p in papers if any(ind in p.get('title', '').lower() for ind in sleep_indicators)])
        anxiety_papers = len([p for p in papers if any(ind in p.get('title', '').lower() for ind in anxiety_indicators)])
        pain_papers = len([p for p in papers if any(ind in p.get('title', '').lower() for ind in pain_indicators)])
        
        if sleep_papers >= 2:
            findings.append(f"Multiple studies ({sleep_papers}) support sleep benefits")
        if anxiety_papers >= 2:
            findings.append(f"Research evidence ({anxiety_papers} studies) supports anxiety relief")
        if pain_papers >= 2:
            findings.append(f"Clinical studies ({pain_papers}) demonstrate pain relief potential")
        
        # Add high-credibility study findings
        high_credibility_papers = [p for p in papers if p.get('credibility_score', 0) >= 8]
        if high_credibility_papers:
            findings.append(f"{len(high_credibility_papers)} high-quality studies provide strong evidence")
        
        return findings or ["Research evidence supports potential therapeutic benefits"]
    
    async def close(self):
        """Close resources"""
        if self.educational_mcp:
            await self.educational_mcp.close()
        
        # Close parent resources
        if hasattr(super(), 'close'):
            await super().close()