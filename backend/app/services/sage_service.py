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

TASK: Provide helpful, evidence-based guidance about cannabis strains and products for NJ dispensary customers.

CORE PRINCIPLE: Help users understand cannabis strain effects, potency levels, and consumption methods to make informed dispensary purchases. Focus on education-first, product recommendations second.

CANNABIS STRAIN KNOWLEDGE BASE:

STRAIN TYPES:
• INDICA: Body-focused effects, relaxation, sedation, evening use, higher myrcene content
• SATIVA: Head-focused effects, energy, creativity, daytime use, higher limonene/pinene
• HYBRID: Balanced effects combining indica and sativa traits, versatile timing

THC POTENCY RANGES:
• LOW (0-15% THC): Mild effects, good for beginners, functional use
• MEDIUM (15-25% THC): Moderate effects, regular users, balanced experience  
• HIGH (25%+ THC): Strong effects, experienced users only, careful dosing

MAJOR CANNABINOIDS:
• THC: Primary psychoactive compound, euphoria, pain relief, appetite stimulation
• CBD: Non-psychoactive, anxiety relief, anti-inflammatory, balances THC effects
• CBG: "Mother cannabinoid", focus and energy, antibacterial properties
• CBN: Sedating effects, sleep promotion, forms as THC degrades
• THCA: Raw THC form, anti-inflammatory, converts to THC when heated
• CBDA: Raw CBD form, anti-nausea, converts to CBD when heated

TERPENE PROFILES:
• MYRCENE: Sedating, muscle relaxant, "couch-lock" effects, indica dominant
• LIMONENE: Mood elevation, stress relief, citrus aroma, sativa common
• PINENE: Alertness, memory retention, pine aroma, counteracts THC anxiety
• LINALOOL: Calming, sleep aid, lavender aroma, anxiety reduction
• CARYOPHYLLENE: Anti-inflammatory, pain relief, spicy aroma, CB2 receptor binding

REQUIREMENTS:
1. STRAIN-FOCUSED: Emphasize indica/sativa/hybrid characteristics and effects
2. THC EDUCATION: Explain potency levels and appropriate user experience matching
3. TERPENE INTEGRATION: Connect terpene profiles to expected effects and experiences
4. CONSUMPTION GUIDANCE: Cover flower, edibles, vapes, concentrates with onset/duration
5. NJ COMPLIANCE: Include 21+ requirements, legal cannabis status, responsible use
6. EVIDENCE-BASED: Reference cannabis research and clinical findings when available

RESPONSE FORMAT: Use this EXACT structure with markdown formatting:

🌿 **Quick Answer**
• 1-2 concise sentences about strain type recommendation (indica/sativa/hybrid)
• Include THC potency guidance for their experience level

📚 **Key Benefits** 
• 3-4 bullet points about specific strain effects and therapeutic benefits
• Include onset time and duration for consumption methods
• Focus on their desired outcome (sleep, energy, pain relief, etc.)

🔬 **Research Insights**
• 2-3 evidence-based findings from cannabis research studies
• Terpene profile science and entourage effect explanations
• Clinical trial data on cannabinoids when available

💡 **How to Use**
• Consumption method recommendations (flower, edibles, vapes, concentrates)
• Dosage guidance by experience level (start low, go slow for THC)
• Best timing for desired effects (morning sativas, evening indicas)

⚠️ **Important Notes**
• NJ legal compliance (21+ adult use, state licensed dispensaries only)
• Drug testing considerations for employment
• Interaction warnings and responsible consumption
• Start with lower potency products for new users

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

    async def search_products(self, user_query: str, explanation: str, educational_data: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Search for relevant products using research-enhanced matching"""
        
        if not DB_AVAILABLE or not mock_db:
            return self._fallback_products(user_query)

        try:
            # Enhance search query with research findings
            enhanced_query = self._enhance_query_with_research(user_query, educational_data)
            
            # Search products with enhanced query
            products = await mock_db.search_products(enhanced_query, limit=3)
            
            # If no matches with enhanced query, try original
            if not products:
                products = await mock_db.search_products(user_query, limit=3)
            
            # Apply research-based scoring adjustments
            if products and educational_data:
                products = self._adjust_scores_with_research(products, educational_data, user_query)
            
            if not products:
                # Fallback to evidence-based query terms
                research_terms = self._extract_research_terms(educational_data) if educational_data else []
                fallback_terms = research_terms + ['cannabis', 'cannabinoid', 'terpene', 'strain']
                
                for term in fallback_terms:
                    if term in user_query.lower():
                        products = await mock_db.search_products(term, limit=3)
                        break
            
            # If still no products, get scientifically relevant defaults
            if not products:
                products = self._get_research_based_defaults(user_query, educational_data)
                for product in products:
                    product['match_score'] = 5  # Low but non-zero score
            
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

    def _enhance_query_with_research(self, user_query: str, educational_data: Optional[Dict]) -> str:
        """Enhance search query with research findings"""
        if not educational_data:
            return user_query
            
        enhanced_terms = [user_query]
        
        # Extract key terms from research studies
        studies = educational_data.get('studies', [])
        for study in studies[:3]:  # Use top 3 studies
            title = study.get('title', '').lower()
            # Extract cannabis-relevant terms from study titles
            cannabis_terms = ['cannabinoid', 'thc', 'cbd', 'terpene', 'cannabis', 'indica', 'sativa']
            for term in cannabis_terms:
                if term in title and term not in enhanced_terms:
                    enhanced_terms.append(term)
        
        return ' '.join(enhanced_terms)
    
    def _adjust_scores_with_research(self, products: List[Dict], educational_data: Dict, user_query: str) -> List[Dict]:
        """Adjust product scores based on research evidence"""
        studies = educational_data.get('studies', [])
        if not studies:
            return products
            
        # Extract research-supported cannabinoids and terpenes
        research_cannabinoids = set()
        research_terpenes = set()
        
        for study in studies:
            title = study.get('title', '').lower()
            abstract = study.get('abstract', '').lower()
            text = f"{title} {abstract}"
            
            # Identify mentioned cannabinoids
            cannabinoids = ['thc', 'cbd', 'cbg', 'cbn', 'cbc', 'delta-9']
            for cannabinoid in cannabinoids:
                if cannabinoid in text:
                    research_cannabinoids.add(cannabinoid)
                    
            # Identify mentioned terpenes  
            terpenes = ['myrcene', 'limonene', 'pinene', 'linalool', 'caryophyllene']
            for terpene in terpenes:
                if terpene in text:
                    research_terpenes.add(terpene)
        
        # Adjust scores based on research alignment
        for product in products:
            research_bonus = 0
            dominant_terpene = product.get('dominant_terpene', '').lower()
            
            # Bonus for research-supported terpenes
            if dominant_terpene in research_terpenes:
                research_bonus += 15
                
            # Bonus for research-supported cannabinoid profiles
            if product.get('thc_percentage', 0) > 0 and 'thc' in research_cannabinoids:
                research_bonus += 10
            if product.get('cbd_percentage', 0) > 0 and 'cbd' in research_cannabinoids:
                research_bonus += 10
                
            product['match_score'] = product.get('match_score', 0) + research_bonus
            product['research_supported'] = research_bonus > 0
            
        return sorted(products, key=lambda x: x.get('match_score', 0), reverse=True)
    
    def _extract_research_terms(self, educational_data: Dict) -> List[str]:
        """Extract relevant search terms from research data"""
        terms = []
        studies = educational_data.get('studies', [])
        
        for study in studies[:2]:  # Top 2 studies
            title = study.get('title', '').lower()
            # Extract key cannabis terms
            key_terms = ['sleep', 'pain', 'anxiety', 'epilepsy', 'inflammation', 'nausea']
            for term in key_terms:
                if term in title and term not in terms:
                    terms.append(term)
                    
        return terms
    
    def _get_research_based_defaults(self, user_query: str, educational_data: Optional[Dict]) -> List[Dict]:
        """Get default products based on research patterns"""
        if not mock_db or not mock_db.products:
            return []
            
        # Get top 3 products by scientific relevance
        relevant_products = []
        
        for product in mock_db.products:
            relevance_score = 0
            
            # Prefer products with lab testing
            if product.get('lab_tested', False):
                relevance_score += 10
                
            # Prefer products with terpene data
            if product.get('dominant_terpene'):
                relevance_score += 8
                
            # Prefer balanced cannabinoid profiles
            if product.get('cbd_percentage', 0) > 0:
                relevance_score += 5
                
            product['match_score'] = relevance_score
            relevant_products.append(product)
            
        return sorted(relevant_products, key=lambda x: x.get('match_score', 0), reverse=True)[:3]

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