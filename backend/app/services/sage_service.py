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
        
        # Generate products
        products = self.generate_products(user_query, explanation)

        return {
            "explanation": explanation,
            "products": products,
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
                    for paper in papers[:5]:  # Use top 5 papers
                        title = paper.get('title', '')
                        summary = paper.get('summary', '') or paper.get('abstract', '')
                        if title and summary:
                            key_findings.append(f"• Study: {title}\n  Finding: {summary[:200]}...")
                        elif title:
                            key_findings.append(f"• Study: {title}")
                    
                    if key_findings:
                        research_context = f"""

RESEARCH EVIDENCE from recent scientific studies:
{chr(10).join(key_findings)}

INSTRUCTIONS: Use this research to provide evidence-based recommendations. Cite specific findings when relevant, but translate complex medical terms into accessible language.
"""

            # Tone based on experience level (from Frontend Experience Agent philosophy)
            if experience_level == "new":
                tone_guide = """You are Sage, a gentle counselor and wellness guide. Use a nurturing, supportive tone:
- "Take your time exploring what feels right for you..."
- "Many people find that..." (reassuring, not overwhelming)
- "There's no pressure - this is just information to help you understand"
- Acknowledge any nervousness: "It's completely normal to feel uncertain"
- Use warm, non-judgmental language throughout"""
            
            elif experience_level == "experienced":
                tone_guide = """You are Sage, a knowledgeable peer who respects their expertise. Use a confident, direct tone:
- "Since you know your cannabinoids, let's get specific..."
- "You probably already know about terpene profiles, so here's what actually helps..."
- "Cut to the chase - based on the research..."
- Skip basic explanations, focus on actionable insights
- Use terminology they'll understand (ratios, onset times, etc.)"""
            
            else:  # casual
                tone_guide = """You are Sage, a friendly, knowledgeable guide. Use a balanced, conversational tone:
- "Here's what I've learned about this..." (personal but informative)
- Mix approachable explanations with helpful specifics
- "You might find..." (gentle suggestions without pressure)
- Balance warmth with practical information
- Casual but respectful language"""

            prompt = f"""{tone_guide}

USER CONTEXT:
Experience Level: {experience_level}
Question: "{user_query}"

{research_context}

TASK: Create a hemp/cannabis-focused response that positions these products as THE solution to enhance what they're trying to achieve.

CORE PRINCIPLE: Hemp products don't replace activities - they ENHANCE them. If they want to sleep better, show how CBD+CBN makes sleep deeper. If they want to focus, show how specific terpenes boost concentration during their existing activities.

REQUIREMENTS:
1. HEMP-CENTRIC APPROACH: Every recommendation must tie back to how hemp/cannabis products specifically help their goal
2. ENHANCEMENT MINDSET: Don't suggest alternatives - show how hemp makes their current activities better
3. RESEARCH AUTHORITY: Use studies to prove hemp's effectiveness for their specific need
4. PRODUCT SELLING: Position these products as essential tools, not optional supplements
5. MECHANISM EXPLANATION: Explain HOW cannabinoids and terpenes work in their body
6. LIFESTYLE INTEGRATION: Show how products fit seamlessly into what they already do

SELLING STRATEGY:
- Start with the problem hemp solves for them
- Explain the science behind why hemp works
- Paint the picture of their enhanced experience
- Create urgency around the specific benefits they'll miss without these products

RESPONSE STRUCTURE:
Write a natural, flowing response that seamlessly integrates:
1. Open with how hemp transforms their specific goal
2. Explain the science behind why hemp works for them
3. Paint the enhanced experience they'll have
4. Reference research evidence naturally
5. End with compelling reason to choose these products

CRITICAL: Write as one smooth, conversational response. DO NOT include section headers, bullet points, or numbered lists. DO NOT use labels like "Hook:" or "Science:" in your response. Write naturally as if speaking to them directly.

AVOID: Suggesting non-hemp alternatives, section headers, bullet formatting, generic wellness advice"""

            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return self._fallback_explanation(user_query)

    def generate_products(self, user_query: str, explanation: str) -> List[Dict[str, Any]]:
        """Generate 3 relevant product recommendations"""
        
        if not self.model:
            return self._fallback_products(user_query)

        try:
            prompt = f"""HEMP PRODUCT SELLING TASK:

User's Goal: "{user_query}"
Hemp Benefits Explained: "{explanation}"

Create 3 hemp products that are ESSENTIAL for achieving their specific goal. These aren't just "nice to have" - they're the key to unlocking their desired outcome.

SELLING PRINCIPLES:
1. ENHANCEMENT FOCUS: Show how each product makes their existing efforts MORE effective
2. SPECIFIC BENEFITS: Don't just say "relaxing" - explain exactly what changes in their experience
3. LIFESTYLE INTEGRATION: Show how it fits perfectly into what they already do
4. URGENCY: Create FOMO - what they're missing without these products
5. SCIENTIFIC BACKING: Reference how the cannabinoids/terpenes specifically work

PRODUCT STRATEGY:
- Product 1: IMMEDIATE solution (fast-acting, dramatic difference)
- Product 2: SUSTAINED solution (long-lasting, builds on their routine)
- Product 3: TARGETED solution (specific mechanism, unique advantage)

DESCRIPTION FORMULA:
"[Product Name] - Instead of just [their current approach], this [specific cannabinoid profile] lets you [enhanced version of their goal]. The [specific terpenes] work by [mechanism] to [specific benefit they can't get elsewhere]. [Usage integration into their lifestyle]."

PRICING: $25-65 range for premium, effective products

AVOID: Generic benefits, weak language like "may help", positioning as optional supplements

Return ONLY the Python list, no other text:"""

            response = self.model.generate_content(prompt)
            
            # Parse response
            try:
                product_text = response.text.strip()
                # Clean up code blocks
                if product_text.startswith('```'):
                    product_text = product_text.split('```')[1]
                    if product_text.startswith('python'):
                        product_text = product_text[6:]
                
                products = eval(product_text.strip())
                
                # Add IDs
                for i, product in enumerate(products):
                    product['id'] = i + 1
                    
                return products
                
            except Exception as parse_error:
                logger.error(f"Failed to parse products: {parse_error}")
                return self._fallback_products(user_query)
                
        except Exception as e:
            logger.error(f"Gemini API error for products: {e}")
            return self._fallback_products(user_query)

    def _create_educational_summary(self, educational_data: Dict) -> Dict[str, Any]:
        """Create a simple summary of educational findings"""
        if not educational_data:
            return None

        studies = educational_data.get('studies', [])
        if not studies:
            return None

        # Extract key insights
        key_findings = []
        safety_notes = []
        dosing_info = []

        for study in studies[:5]:  # Top 5 studies
            summary = study.get('summary', '')
            
            # Categorize findings
            if any(word in summary.lower() for word in ['effective', 'beneficial', 'improved', 'reduced']):
                key_findings.append(summary)
            elif any(word in summary.lower() for word in ['safe', 'adverse', 'side effect', 'tolerance']):
                safety_notes.append(summary)
            elif any(word in summary.lower() for word in ['dose', 'dosage', 'mg', 'administration']):
                dosing_info.append(summary)

        return {
            "total_studies": len(studies),
            "key_findings": key_findings[:3],
            "safety_notes": safety_notes[:2] if safety_notes else None,
            "dosing_insights": dosing_info[:2] if dosing_info else None
        }

    def _fallback_explanation(self, user_query: str) -> str:
        """Simple fallback when Gemini unavailable"""
        query = user_query.lower()
        
        if 'sleep' in query:
            return 'For sleep support, CBD and CBN work together to promote relaxation. Look for products with calming terpenes like myrcene and linalool for the most restful experience.'
        elif 'thca' in query:
            return 'THCA is the raw, non-psychoactive precursor to THC found in fresh hemp. When heated, it converts to THC. THCA products offer potential therapeutic benefits without the high.'
        elif any(word in query for word in ['party', 'social', 'cookout']):
            return 'For social gatherings, consider low-dose edibles or beverages that promote relaxation without overwhelming effects. Start low and go slow for the best experience.'
        else:
            return 'Based on your question, here are some thoughtfully selected options that align with your wellness journey. Each product is lab-tested and NC compliant.'

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