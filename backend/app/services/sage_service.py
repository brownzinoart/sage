"""
Clean Sage Service - Simple Gemini AI + Optional MCP Research Integration
"""

import google.generativeai as genai
import os
import sys
import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Import mock database
try:
    from app.db.mock_database import mock_db
    DB_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Mock database not available: {e}")
    DB_AVAILABLE = False
    mock_db = None

# Try to import MCP educational server
try:
    mcp_path = os.path.join(os.path.dirname(__file__), '../../mcp_educational')
    if mcp_path not in sys.path:
        sys.path.insert(0, mcp_path)
    from server import EducationalMCPServer
    MCP_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Educational MCP server not available: {e}")
    MCP_AVAILABLE = False
    EducationalMCPServer = None

class SageService:
    def __init__(self):
        # Configure Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            self.model = None
        else:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                logger.info("Sage AI service initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini model: {e}")
                self.model = None

        # Initialize MCP educational server
        self.educational_mcp = None
        if MCP_AVAILABLE:
            try:
                self.educational_mcp = EducationalMCPServer()
                logger.info("Educational MCP server initialized")
            except Exception as e:
                logger.error(f"Failed to initialize educational MCP: {e}")
                self.educational_mcp = None

    async def ask_sage(self, user_query: str, experience_level: str = "curious") -> Dict[str, Any]:
        """
        Main method - handles user questions with optional research data
        """
        
        # Get research data if available
        educational_data = None
        if self.educational_mcp:
            try:
                educational_data = await self.educational_mcp._fetch_research_evidence(user_query, "general")
                # Debug logging to understand data structure
                logger.info(f"Educational data keys: {list(educational_data.keys()) if educational_data else 'None'}")
                if educational_data:
                    papers = educational_data.get('studies', []) or educational_data.get('papers', [])
                    logger.info(f"Retrieved educational data with {len(papers)} papers/studies")
                    if papers:
                        logger.info(f"First paper keys: {list(papers[0].keys())}")
                else:
                    logger.info("No educational data retrieved")
            except Exception as e:
                logger.error(f"Failed to get educational data: {e}")
                educational_data = None

        # Generate explanation with Gemini
        explanation = self.generate_explanation(user_query, educational_data, experience_level)
        
        # Search for real products
        products = await self.search_products(user_query, explanation)

        return {
            "explanation": explanation,
            "products": products,
            "educational_resources": educational_data if educational_data else None,
            "educational_summary": self._create_educational_summary(educational_data) if educational_data else None
        }

    def generate_explanation(self, user_query: str, educational_data: Optional[Dict] = None, experience_level: str = "curious") -> str:
        """Generate explanation with optional research context"""
        
        if not self.model:
            return self._fallback_explanation(user_query)

        try:
            # Build prompt with optional research context
            research_context = ""
            if educational_data:
                # Try both 'studies' and 'papers' keys for compatibility
                papers = educational_data.get('studies', []) or educational_data.get('papers', [])
                if papers:
                    key_findings = []
                    safety_notes = []
                    mechanism_info = []
                    
                    for paper in papers[:6]:  # Use top 6 papers
                        title = paper.get('title', '')
                        summary = paper.get('summary', '') or paper.get('abstract', '')
                        
                        if title and summary:
                            # Categorize research findings
                            if any(word in summary.lower() for word in ['effective', 'beneficial', 'improved', 'reduced', 'significant']):
                                key_findings.append(f"• {title}: {summary[:150]}...")
                            elif any(word in summary.lower() for word in ['safe', 'adverse', 'side effect', 'tolerance', 'well-tolerated']):
                                safety_notes.append(f"• {title}: {summary[:150]}...")
                            elif any(word in summary.lower() for word in ['mechanism', 'receptor', 'pathway', 'endocannabinoid']):
                                mechanism_info.append(f"• {title}: {summary[:150]}...")
                    
                    research_sections = []
                    if key_findings:
                        research_sections.append(f"EFFECTIVENESS RESEARCH:\n{chr(10).join(key_findings[:3])}")
                    if safety_notes:
                        research_sections.append(f"SAFETY RESEARCH:\n{chr(10).join(safety_notes[:2])}")
                    if mechanism_info:
                        research_sections.append(f"MECHANISM RESEARCH:\n{chr(10).join(mechanism_info[:2])}")
                    
                    if research_sections:
                        research_context = f"""

SCIENTIFIC EVIDENCE from peer-reviewed studies:
{chr(10).join(research_sections)}

INSTRUCTIONS: Reference this research naturally in your response. Explain what the studies suggest about effectiveness and safety. Use accessible language and acknowledge both benefits and limitations shown in research.
"""

            # Tone based on experience level
            if experience_level == "new":
                tone_guide = """You are Sage, a supportive hemp guide for beginners. Be gentle but informative:
- Use simple language and explain basics clearly
- Include extra safety reminders
- Suggest starting with lower doses
- Acknowledge this is new territory for them"""
            
            elif experience_level == "experienced":
                tone_guide = """You are Sage, speaking to someone knowledgeable about hemp. Be direct and specific:
- Use technical terms they'll understand (ratios, onset times, bioavailability)
- Focus on advanced insights and specific product details
- Skip basic explanations
- Provide precise dosage ranges and timing"""
            
            else:  # casual
                tone_guide = """You are Sage, a knowledgeable hemp guide. Be helpful and straightforward:
- Balance accessibility with useful details
- Provide clear, actionable information
- Use friendly but professional language
- Focus on practical guidance"""

            prompt = f"""{tone_guide}

USER CONTEXT:
Experience Level: {experience_level}
Question: "{user_query}"

{research_context}

TASK: Provide helpful, evidence-based guidance about hemp products that may support their wellness goals.

CORE PRINCIPLE: Help users understand how hemp products might fit into their wellness routine. Be informative and supportive, not pushy.

CANNABINOID KNOWLEDGE BASE:
• CBD: Non-psychoactive, anxiety/pain relief, legal everywhere
• THC/Delta-9: Traditional psychoactive cannabinoid, euphoria, pain relief
• THCa: Raw form, converts to THC when heated, legal hemp-derived
• Delta-8: Mild psychoactive, legal hemp-derived, smooth euphoria
• Delta-10: Creative/energizing effects, clear-headed high
• HHC: Hemp-derived, stable shelf life, THC-like effects
• CBG: "Mother cannabinoid", focus and clarity, non-psychoactive
• CBN: Sedating, sleep-promoting, "couch lock" effects
• CBC: Mood support, anti-inflammatory, works with other cannabinoids
• THCP: Highly potent, 33x stronger binding than THC
• THCV: Energy, appetite suppressant, "diet weed"

REQUIREMENTS:
1. COMPREHENSIVE COVERAGE: Discuss ALL relevant cannabinoids, not just CBD
2. EFFECT-BASED MATCHING: Match cannabinoids to user's desired effects
3. LEGAL EDUCATION: Explain legal status and compliance for each compound
4. EVIDENCE-BASED: Reference research for ALL cannabinoids mentioned
5. PRACTICAL GUIDANCE: Dosing and usage for different cannabinoids
6. TRANSPARENCY: Clear about psychoactive vs non-psychoactive effects

RESPONSE FORMAT: Use this EXACT structure with markdown formatting:

🌿 **Quick Answer**
• 1-2 concise sentences directly answering their question

📚 **Key Benefits** 
• 3-4 bullet points about relevant hemp benefits
• Each point should be 1 line maximum
• Focus on their specific need

🔬 **Research Insights**
• 2-3 evidence-based findings with simple explanations
• Include credibility indicators when available
• Mention any important limitations

💡 **How to Use**
• Practical dosage guidance (start low)
• Best timing recommendations
• Integration with lifestyle tips

⚠️ **Important Notes**
• Key safety considerations and legal compliance
• Age requirements (21+ for psychoactive products)
• State law variations and responsible use
• Consult healthcare provider reminder

REQUIREMENTS:
- Use EXACT section headers with emojis as shown
- Maximum 250 words total
- Use bullet points for ALL information
- Each bullet point: 1-2 lines maximum
- NO long paragraphs or walls of text
- Be direct and actionable

TONE: Helpful, knowledgeable, concise. Skip filler words and reassurances."""

            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return self._fallback_explanation(user_query)

    async def search_products(self, user_query: str, explanation: str) -> List[Dict[str, Any]]:
        """Search for relevant products from real database"""
        
        if not DB_AVAILABLE or not mock_db:
            return self._fallback_products(user_query)

        try:
            # Search products based on query
            products = await mock_db.search_products(user_query, limit=3)
            
            if not products:
                # Fallback to basic query terms if no matches
                query_terms = ['cbd', 'sleep', 'pain', 'anxiety']
                for term in query_terms:
                    if term in user_query.lower():
                        products = await mock_db.search_products(term, limit=3)
                        break
            
            # If still no products, get first 3 products as fallback
            if not products:
                products = mock_db.products[:3]
                for product in products:
                    product['match_score'] = 1
            
            # Format products for frontend
            formatted_products = []
            for product in products:
                formatted_product = {
                    'id': product.get('id', str(len(formatted_products) + 1)),
                    'name': product.get('name', 'Hemp Product'),
                    'description': product.get('description', ''),
                    'price': f"${product.get('price', 0):.2f}",
                    'category': product.get('category', 'wellness').title(),
                    'cbd_mg': product.get('cbd_mg', 0),
                    'thc_mg': product.get('thc_mg', 0),
                    'cbg_mg': product.get('cbg_mg', 0),
                    'cbn_mg': product.get('cbn_mg', 0),
                    'cbc_mg': product.get('cbc_mg', 0),
                    'thca_percentage': product.get('thca_percentage'),
                    'effects': product.get('effects', []),
                    'terpenes': product.get('terpenes', {}),
                    'lab_tested': product.get('lab_tested', True),
                    'lab_report_url': product.get('lab_report_url'),
                    'in_stock': product.get('in_stock', True),
                    'match_score': product.get('match_score', 0),
                    'brand': product.get('brand', 'Hemp Generation'),
                    'size': product.get('size', ''),
                    'product_type': product.get('product_type', 'supplement')
                }
                formatted_products.append(formatted_product)
                
            return formatted_products
                
        except Exception as e:
            logger.error(f"Database search error: {e}")
            return self._fallback_products(user_query)

    def _create_educational_summary(self, educational_data: Dict) -> Dict[str, Any]:
        """Create a simple summary of educational findings"""
        if not educational_data:
            return None

        # Try both 'papers' and 'studies' keys for compatibility
        studies = educational_data.get('papers', []) or educational_data.get('studies', [])
        if not studies:
            return None

        # Extract key insights
        key_findings = []
        safety_notes = []
        dosing_info = []

        for study in studies[:5]:  # Top 5 studies
            # Use abstract instead of summary since papers have abstract field
            text_content = study.get('abstract', '') or study.get('summary', '')
            if not text_content:
                continue
                
            content_lower = text_content.lower()
            title = study.get('title', 'Study')
            
            # Categorize findings based on abstract content
            if any(word in content_lower for word in ['effective', 'beneficial', 'improved', 'reduced', 'significant']):
                key_findings.append(f"{title}: {text_content[:150]}...")
            elif any(word in content_lower for word in ['safe', 'adverse', 'side effect', 'tolerance', 'warning']):
                safety_notes.append(f"{title}: {text_content[:150]}...")  
            elif any(word in content_lower for word in ['dose', 'dosage', 'mg', 'administration']):
                dosing_info.append(f"{title}: {text_content[:150]}...")

        summary_result = {
            "total_studies": len(studies),
            "key_findings": key_findings[:3],
            "safety_notes": safety_notes[:2] if safety_notes else None,
            "dosing_insights": dosing_info[:2] if dosing_info else None
        }
        
        # Debug logging
        logger.info(f"Educational summary created: {len(studies)} studies, {len(key_findings)} findings, {len(safety_notes)} safety notes")
        
        return summary_result

    def _fallback_explanation(self, user_query: str) -> str:
        """Simple fallback when Gemini unavailable"""
        query = user_query.lower()
        
        if 'sleep' in query:
            return 'For sleep support, CBN and Delta-8 work together to promote relaxation. Look for products with calming terpenes like myrcene and linalool for the most restful experience.'
        elif any(word in query for word in ['thca', 'thc-a']):
            return 'THCA is the raw, non-psychoactive precursor to THC found in fresh hemp. When heated, it converts to THC. THCA products offer potential therapeutic benefits without the high.'
        elif any(word in query for word in ['delta-8', 'delta 8', 'd8']):
            return 'Delta-8 THC offers a milder, legal alternative to traditional THC. Users report smooth, clear-headed effects with less anxiety. Perfect for legal euphoria.'
        elif any(word in query for word in ['hhc', 'hexahydrocannabinol']):
            return 'HHC provides THC-like effects with greater stability and shelf life. Many users enjoy its balanced euphoria and clear-headed high.'
        elif any(word in query for word in ['thcv', 'diet weed']):
            return 'THCV is known as "diet weed" for its appetite-suppressing properties. It provides energy and focus without traditional munchies.'
        elif any(word in query for word in ['high', 'euphoria', 'buzz']):
            return 'For legal euphoria, consider Delta-8, HHC, or THCA products. Each offers different effects - Delta-8 for smooth relaxation, HHC for balanced high, THCA when heated.'
        elif any(word in query for word in ['party', 'social', 'fun']):
            return 'For social gatherings, Delta-8 edibles or HHC vapes offer balanced euphoria perfect for good vibes. Start low and go slow for the best experience.'
        elif any(word in query for word in ['focus', 'energy', 'creative']):
            return 'For focus and creativity, try THCV capsules, CBG products, or Delta-10 vapes. These cannabinoids promote alertness without sedation.'
        else:
            return 'We offer the full spectrum of cannabinoids - CBD, THC, Delta-8, HHC, THCV, CBG, CBN, and more. Each product is lab-tested and compliant with applicable laws.'

    def _fallback_products(self, user_query: str) -> List[Dict[str, Any]]:
        """Simple fallback products"""
        query = user_query.lower()
        
        if 'sleep' in query:
            return [
                {"id": 1, "name": "Night Time CBD Gummies", "description": "5mg CBD + 2mg CBN per gummy. Infused with lavender for peaceful sleep.", "price": "$28", "category": "Sleep"},
                {"id": 2, "name": "Calm Tincture", "description": "Full spectrum CBD oil with chamomile. Start with 0.5ml under tongue.", "price": "$45", "category": "Tinctures"},
                {"id": 3, "name": "Dream Tea Blend", "description": "Hemp flower tea with passionflower and lemon balm. Caffeine-free.", "price": "$18", "category": "Tea"}
            ]
        else:
            return [
                {"id": 1, "name": "CBD Wellness Gummies", "description": "10mg CBD per gummy. Perfect for daily wellness support.", "price": "$32", "category": "Gummies"},
                {"id": 2, "name": "Full Spectrum Tincture", "description": "Premium hemp extract with natural terpenes for balanced wellness.", "price": "$55", "category": "Tinctures"},
                {"id": 3, "name": "Hemp Flower", "description": "High-quality hemp flower for those who prefer natural consumption.", "price": "$25", "category": "Flower"}
            ]

    def is_available(self) -> bool:
        """Check if service is available"""
        return self.model is not None