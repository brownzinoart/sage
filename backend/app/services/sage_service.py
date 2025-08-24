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
                logger.info(f"Retrieved educational data with {len(educational_data.get('studies', []))} studies")
            except Exception as e:
                logger.error(f"Failed to get educational data: {e}")
                educational_data = None

        # Generate explanation with Gemini
        explanation = self.generate_explanation(user_query, educational_data)
        
        # Generate products
        products = self.generate_products(user_query, explanation)

        return {
            "explanation": explanation,
            "products": products,
            "educational_summary": self._create_educational_summary(educational_data) if educational_data else None
        }

    def generate_explanation(self, user_query: str, educational_data: Optional[Dict] = None) -> str:
        """Generate explanation with optional research context"""
        
        if not self.model:
            return self._fallback_explanation(user_query)

        try:
            # Build prompt with optional research context
            research_context = ""
            if educational_data and educational_data.get('studies'):
                key_findings = []
                for study in educational_data['studies'][:3]:  # Use top 3 studies
                    if study.get('summary'):
                        key_findings.append(f"• {study['summary']}")
                
                if key_findings:
                    research_context = f"""
                    
Research context from recent studies:
{chr(10).join(key_findings)}

Use this research to inform your response, but keep it conversational and accessible.
"""

            prompt = f"""You are Sage, a warm and knowledgeable hemp wellness guide. A user asked: "{user_query}"

{research_context}

Provide a helpful, educational response that:
1. Directly addresses their question about hemp, CBD, or wellness
2. Is warm and approachable (not clinical or overly technical)
3. Incorporates relevant research insights when available
4. Is 2-3 sentences maximum
5. Uses a sage-like, caring tone

Focus on education and understanding, not medical advice."""

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
            prompt = f"""Based on this user query: "{user_query}" and explanation: "{explanation}"

Generate exactly 3 hemp/CBD product recommendations as a Python list. Each product needs:
- name: Product name (realistic and appealing)
- description: Brief description (1-2 sentences)  
- price: Price as string (like "$25")
- category: Product type ("Gummies", "Tinctures", "Tea", etc.)

Make them relevant to the user's specific need. Return ONLY the Python list, no other text:"""

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