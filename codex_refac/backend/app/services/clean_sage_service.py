"""
Clean Sage Service - Gemini-first with MCP cross-referencing and intelligent fallbacks
"""

try:
    import google.generativeai as genai  # optional
except Exception:
    genai = None
import os
import sys
import asyncio
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)

# Import dependencies with error handling
try:
    from app.db.mock_database import mock_db
    DB_AVAILABLE = True
except ImportError:
    logger.warning("Mock database not available")
    DB_AVAILABLE = False
    mock_db = None

try:
    mcp_path = os.path.join(os.path.dirname(__file__), '../../mcp_educational')
    if mcp_path not in sys.path:
        sys.path.insert(0, mcp_path)
    from server import EducationalMCPServer
    MCP_AVAILABLE = True
except ImportError:
    logger.warning("Educational MCP server not available")
    MCP_AVAILABLE = False
    EducationalMCPServer = None

class CleanSageService:
    """
    Optimized hemp wellness AI with transparent fallback system
    
    Service Availability Codes:
    - Code 0: All services operational (Gemini + MCP)  
    - Code 1: Gemini unavailable, MCP operational
    - Code 2: MCP unavailable, Gemini operational
    - Code 3: Both services unavailable
    """
    
    def __init__(self):
        self.gemini_available = False
        self.mcp_available = False
        
        # Initialize Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key and genai is not None:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                self.gemini_available = True
                logger.info("✅ Gemini AI service initialized")
            except Exception as e:
                logger.error(f"❌ Gemini initialization failed: {e}")
                self.model = None
        else:
            if not api_key:
                logger.warning("❌ GEMINI_API_KEY not found")
            if genai is None:
                logger.warning("❌ google-generativeai not installed; AI disabled")
            self.model = None

        # Initialize MCP Server (opt-in via env to avoid network during tests)
        enable_mcp = os.getenv("ENABLE_EDUCATIONAL_MCP", "0").lower() in ("1", "true", "yes")
        if MCP_AVAILABLE and enable_mcp:
            try:
                self.educational_mcp = EducationalMCPServer()
                self.mcp_available = True
                logger.info("✅ Educational MCP server initialized")
            except Exception as e:
                logger.error(f"❌ MCP initialization failed: {e}")
                self.educational_mcp = None
        else:
            self.educational_mcp = None

        # Log service status
        status_code = self._get_service_status_code()
        logger.info(f"🔧 Service Status Code: {status_code} - {self._get_status_message(status_code)}")

    # =============================================================================
    # MAIN API METHOD
    # =============================================================================

    async def ask_sage(self, user_query: str, experience_level: str = "curious") -> Dict[str, Any]:
        """
        Main entry point with intelligent fallback system
        """
        
        status_code = self._get_service_status_code()
        logger.info(f"Processing query with service status: {status_code}")
        
        # Route to appropriate handler based on service availability
        if status_code == 0:
            # Ideal: Both services available
            return await self._full_service_response(user_query, experience_level)
        elif status_code == 1:
            # MCP only - provide research-based response
            return await self._mcp_only_response(user_query, experience_level)
        elif status_code == 2:
            # Gemini only - provide AI response with disclaimer
            return await self._gemini_only_response(user_query, experience_level)
        else:
            # Both unavailable - minimal response
            return await self._minimal_response(user_query)

    # =============================================================================
    # SERVICE HANDLERS
    # =============================================================================

    async def _full_service_response(self, user_query: str, experience_level: str) -> Dict[str, Any]:
        """Ideal flow: Gemini-first with MCP cross-referencing"""
        
        try:
            # Step 1: Generate primary Gemini response
            primary_response = await self._generate_gemini_response(user_query, experience_level)
            
            # Step 2: Fetch MCP research and products in parallel
            educational_data, products = await asyncio.gather(
                self._fetch_mcp_research(user_query),
                self._search_products(user_query),
                return_exceptions=True
            )
            
            # Handle exceptions
            if isinstance(educational_data, Exception):
                logger.error(f"MCP research failed: {educational_data}")
                educational_data = None
            if isinstance(products, Exception):
                logger.error(f"Product search failed: {products}")
                products = []

            # Step 3: Enhance with research if available
            if educational_data:
                enhanced_response = await self._enhance_with_research(
                    primary_response, educational_data, experience_level
                )
            else:
                enhanced_response = primary_response

            return {
                "explanation": enhanced_response,
                "products": products,
                "educational_resources": educational_data,
                "educational_summary": self._create_summary(educational_data) if educational_data else None,
                "service_status": 0,
                "status_message": "All services operational"
            }

        except Exception as e:
            logger.error(f"Full service response failed: {e}")
            # Fallback to MCP only
            return await self._mcp_only_response(user_query, experience_level)

    async def _mcp_only_response(self, user_query: str, experience_level: str) -> Dict[str, Any]:
        """Fallback: MCP research only (Gemini unavailable)"""
        
        try:
            # Get research data
            educational_data = await self._fetch_mcp_research(user_query)
            products = await self._search_products(user_query)
            
            if educational_data:
                # Create research-based response
                response = self._create_research_response(educational_data, user_query, experience_level)
            else:
                response = f"I apologize - I'm having technical difficulties accessing both AI services and research data for your question about '{user_query}'. Please try again later."

            return {
                "explanation": response,
                "products": products,
                "educational_resources": educational_data,
                "educational_summary": self._create_summary(educational_data) if educational_data else None,
                "service_status": 1,
                "status_message": "AI service unavailable - response based on research data only"
            }

        except Exception as e:
            logger.error(f"MCP-only response failed: {e}")
            return await self._minimal_response(user_query)

    async def _gemini_only_response(self, user_query: str, experience_level: str) -> Dict[str, Any]:
        """Fallback: Gemini only (MCP unavailable)"""
        
        try:
            response = await self._generate_gemini_response(user_query, experience_level)
            products = await self._search_products(user_query)
            
            # Add disclaimer about missing research
            disclaimer = "\n\n⚠️ **Note**: Research database temporarily unavailable. Response based on AI knowledge only."
            response_with_disclaimer = response + disclaimer

            return {
                "explanation": response_with_disclaimer,
                "products": products,
                "educational_resources": None,
                "educational_summary": None,
                "service_status": 2,
                "status_message": "Research database unavailable - AI response only"
            }

        except Exception as e:
            logger.error(f"Gemini-only response failed: {e}")
            return await self._minimal_response(user_query)

    async def _minimal_response(self, user_query: str) -> Dict[str, Any]:
        """Last resort: Both services unavailable"""
        
        response = f"""I apologize, but I'm currently experiencing technical difficulties with both my AI reasoning and research systems.

**Your question**: {user_query}

**What's happening**: 
- AI service unavailable (Code: Connection Error)
- Research database unavailable (Code: Server Error)

**Please try**:
- Refreshing and asking again in a few minutes
- Contacting support if this persists

I want to provide you with accurate, research-backed information, so I'd rather be transparent about technical issues than give you potentially incomplete answers."""

        return {
            "explanation": response,
            "products": [],
            "educational_resources": None,
            "educational_summary": None,
            "service_status": 3,
            "status_message": "All services unavailable - please try again later"
        }

    # =============================================================================
    # GEMINI OPERATIONS
    # =============================================================================

    async def _generate_gemini_response(self, user_query: str, experience_level: str) -> str:
        """Generate experience-optimized response using Gemini"""
        
        system_prompt = self._get_experience_prompt(experience_level)
        
        prompt = f"""{system_prompt}

User Question: "{user_query}"

Provide a natural, helpful response that:
1. Directly answers their hemp/CBD question
2. Matches their {experience_level} experience level
3. Is conversational and supportive
4. Includes practical next steps
5. Mentions safety/legality appropriately for NC

Response:"""

        try:
            response = await asyncio.to_thread(self.model.generate_content, prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini response generation failed: {e}")
            raise e

    def _get_experience_prompt(self, experience_level: str) -> str:
        """Experience-level specific system prompts"""
        
        prompts = {
            "new": """You are Sage, a gentle hemp guide for complete beginners. Use simple language, focus on safety, explain basics clearly, and build confidence. Emphasize legal, lab-tested products only.""",
            
            "curious": """You are Sage, a knowledgeable hemp guide for interested learners. Balance education with practical advice, explain the "why" behind recommendations, and maintain a warm, encouraging tone.""",
            
            "casual": """You are Sage, a hemp guide for those with some experience. Give practical, actionable advice, help optimize their experience, discuss product differences, and be direct but supportive.""",
            
            "experienced": """You are Sage, a hemp guide for knowledgeable users. Provide detailed information, discuss advanced topics like terpenes and ratios, compare options, and focus on optimization and new possibilities."""
        }
        
        return prompts.get(experience_level, prompts["curious"])

    async def _enhance_with_research(self, primary_response: str, educational_data: Dict, experience_level: str) -> str:
        """Enhance Gemini response with research insights"""
        
        research_summary = self._extract_key_research(educational_data)
        if not research_summary:
            return primary_response

        enhancement_prompt = f"""Enhance this hemp/CBD response with research insights.

Original Response:
{primary_response}

Research Summary:
{research_summary}

Experience Level: {experience_level}

Add a natural "🔬 Research Notes" section that weaves in relevant findings. Keep the same tone and experience level. Focus on research that directly supports the response.

Enhanced Response:"""

        try:
            enhanced = await asyncio.to_thread(self.model.generate_content, enhancement_prompt)
            return enhanced.text.strip()
        except Exception as e:
            logger.error(f"Enhancement failed: {e}")
            return primary_response

    # =============================================================================
    # MCP OPERATIONS  
    # =============================================================================

    async def _fetch_mcp_research(self, user_query: str) -> Optional[Dict]:
        """Fetch research data from MCP server"""
        
        if not self.mcp_available:
            return None
            
        try:
            educational_data = await self.educational_mcp._fetch_research_evidence(
                user_query,
                "general"
            )
            
            if educational_data and educational_data.get('papers'):
                logger.info(f"Retrieved {len(educational_data['papers'])} research papers")
                return educational_data
            
            return None
            
        except Exception as e:
            logger.error(f"MCP research failed: {e}")
            return None

    def _create_research_response(self, educational_data: Dict, user_query: str, experience_level: str) -> str:
        """Create response based purely on research data when Gemini unavailable"""
        
        papers = educational_data.get('papers', [])
        if not papers:
            return f"I found research related to '{user_query}' but couldn't process it properly. Please try again."

        # Extract key findings from top papers
        findings = []
        for paper in papers[:3]:
            title = paper.get('title', '')
            abstract = paper.get('abstract', '')
            
            if abstract:
                # Get first meaningful sentence
                sentences = abstract.split('. ')
                if sentences:
                    key_finding = sentences[0]
                    if len(key_finding) > 150:
                        key_finding = key_finding[:150] + "..."
                    findings.append(f"• **{title[:50]}...**: {key_finding}")

        findings_text = "\n".join(findings) if findings else "Research data processing temporarily limited."

        # Create experience-appropriate response structure
        if experience_level == "new":
            intro = f"Based on current research about '{user_query}':"
        else:
            intro = f"Here's what current research shows about '{user_query}':"

        response = f"""{intro}

📚 **Key Research Findings**
{findings_text}

⚠️ **Service Note**: AI assistant temporarily unavailable - response based on research database only. For personalized guidance, please try again later.

💡 **Next Steps**: Consider consulting with a healthcare provider for personalized advice about hemp/CBD products."""

        return response

    def _extract_key_research(self, educational_data: Dict) -> str:
        """Extract key research points for enhancement"""
        
        papers = educational_data.get('papers', [])
        if not papers:
            return ""

        insights = []
        top_papers = sorted(papers, key=lambda x: x.get('relevance_score', 0), reverse=True)[:3]
        
        for paper in top_papers:
            abstract = paper.get('abstract', '')
            if abstract and len(abstract) > 50:
                sentences = abstract.split('. ')
                if sentences:
                    key_sentence = sentences[0]
                    if len(key_sentence) > 150:
                        key_sentence = key_sentence[:150] + "..."
                    insights.append(f"• {paper.get('title', 'Study')}: {key_sentence}")

        return "\n".join(insights)

    # =============================================================================
    # PRODUCT SEARCH
    # =============================================================================

    async def _search_products(self, user_query: str) -> List[Dict]:
        """Search for products"""
        
        if DB_AVAILABLE and mock_db:
            try:
                products = await mock_db.search_products(user_query, limit=3)
                if products:
                    return products
            except Exception as e:
                logger.error(f"Database product search failed: {e}")

        # Fallback to generated products
        return self._generate_contextual_products(user_query)

    def _generate_contextual_products(self, user_query: str) -> List[Dict]:
        """Generate contextually relevant demo products"""
        
        query_lower = user_query.lower()
        
        if any(word in query_lower for word in ['sleep', 'rest', 'insomnia', 'tired']):
            return [
                {"id": 1, "name": "Sleep CBD + CBN Gummies", "description": "5mg CBD + 2mg CBN for restful sleep", "price": "$32.99", "category": "Sleep"},
                {"id": 2, "name": "Dream Blend Tincture", "description": "Full spectrum with chamomile and lavender", "price": "$49.99", "category": "Tinctures"}
            ]
        elif any(word in query_lower for word in ['anxiety', 'stress', 'calm', 'worry']):
            return [
                {"id": 3, "name": "Calm Daily Gummies", "description": "10mg CBD with L-theanine for daily calm", "price": "$28.99", "category": "Wellness"},
                {"id": 4, "name": "Stress Relief Tincture", "description": "Broad spectrum CBD with adaptogenic herbs", "price": "$44.99", "category": "Tinctures"}
            ]
        elif any(word in query_lower for word in ['pain', 'sore', 'ache', 'inflammation']):
            return [
                {"id": 5, "name": "Relief Topical Balm", "description": "500mg CBD with menthol and arnica", "price": "$39.99", "category": "Topicals"},
                {"id": 6, "name": "Anti-Inflammatory Tincture", "description": "High-potency CBD with turmeric", "price": "$59.99", "category": "Tinctures"}
            ]
        else:
            return [
                {"id": 7, "name": "Daily Wellness Gummies", "description": "10mg CBD for everyday wellness support", "price": "$34.99", "category": "Wellness"}
            ]

    # =============================================================================
    # EDUCATIONAL SUMMARY
    # =============================================================================

    def _create_summary(self, educational_data: Optional[Dict]) -> Optional[Dict]:
        """Create educational summary from research data"""
        
        if not educational_data:
            return None
            
        papers = educational_data.get('papers', [])
        if not papers:
            return None

        key_findings = []
        safety_notes = []
        dosing_info = []

        for paper in papers[:5]:
            abstract = paper.get('abstract', '')
            title = paper.get('title', 'Study')
            
            if not abstract:
                continue
                
            content_lower = abstract.lower()
            
            if any(word in content_lower for word in ['effective', 'beneficial', 'improved', 'reduced', 'significant']):
                key_findings.append(f"{title}: {abstract[:120]}...")
            elif any(word in content_lower for word in ['safe', 'adverse', 'side effect', 'warning', 'risk']):
                safety_notes.append(f"{title}: {abstract[:120]}...")
            elif any(word in content_lower for word in ['dose', 'dosage', 'mg', 'administration', 'treatment']):
                dosing_info.append(f"{title}: {abstract[:120]}...")

        return {
            "total_studies": len(papers),
            "key_findings": key_findings[:3],
            "safety_notes": safety_notes[:2] if safety_notes else None,
            "dosing_insights": dosing_info[:2] if dosing_info else None
        }

    # =============================================================================
    # UTILITY METHODS
    # =============================================================================

    def _get_service_status_code(self) -> int:
        """Get current service status code"""
        if self.gemini_available and self.mcp_available:
            return 0  # All operational
        elif not self.gemini_available and self.mcp_available:
            return 1  # Gemini unavailable
        elif self.gemini_available and not self.mcp_available:
            return 2  # MCP unavailable  
        else:
            return 3  # Both unavailable

    def _get_status_message(self, code: int) -> str:
        """Get human-readable status message"""
        messages = {
            0: "All services operational",
            1: "AI service unavailable, research operational",
            2: "Research service unavailable, AI operational", 
            3: "All services unavailable"
        }
        return messages.get(code, "Unknown status")

    def is_available(self) -> bool:
        """Check if service has any functionality available"""
        return self.gemini_available or self.mcp_available

    # =============================================================================
    # LEGACY COMPATIBILITY
    # =============================================================================

    def generate_explanation(self, user_query: str, educational_data: Optional[Dict] = None, experience_level: str = "curious") -> str:
        """Legacy method for backward compatibility"""
        if self.gemini_available:
            try:
                # Simple sync version for legacy compatibility
                return f"For the most comprehensive response about '{user_query}', please use the main ask_sage method."
            except:
                pass
        return f"Service temporarily unavailable. Please try again later."

    async def search_products(self, user_query: str, context: str = "") -> List[Dict]:
        """Legacy product search method"""
        return await self._search_products(user_query)
