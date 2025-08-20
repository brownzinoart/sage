import google.generativeai as genai
import os
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        # Configure Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            self.model = None
            return
            
        genai.configure(api_key=api_key)
        
        # Initialize the model - using Gemini 1.5 Flash for free tier
        try:
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            logger.info("Gemini AI service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini model: {e}")
            self.model = None

    def generate_hemp_explanation(self, user_query: str) -> str:
        """
        Generate educational explanation about hemp/CBD based on user query
        """
        if not self.model:
            return self._fallback_explanation(user_query)
        
        try:
            # Create a specialized prompt for hemp/CBD education
            prompt = f"""
You are Sage, a knowledgeable but gentle hemp wellness guide. A user has asked: "{user_query}"

Please provide a warm, educational response that:
1. Directly addresses their question about hemp, CBD, or wellness
2. Is informative but approachable (not clinical)
3. Focuses on education and understanding
4. Mentions that products should be lab-tested and NC compliant
5. Is 2-3 sentences maximum
6. Uses a warm, sage-like tone

Remember: You're helping people understand hemp wellness, not providing medical advice.
"""

            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return self._fallback_explanation(user_query)

    def generate_product_recommendations(self, user_query: str, explanation: str) -> list:
        """
        Generate product recommendations based on user query and explanation
        """
        if not self.model:
            return self._fallback_products(user_query)
        
        try:
            prompt = f"""
Based on this user query: "{user_query}" and this explanation: "{explanation}"

Generate 3 realistic hemp/CBD product recommendations as a Python list of dictionaries. Each product should have:
- name: Product name
- description: Brief description (1-2 sentences)
- price: Price as string (like "$25")
- category: Product category (like "Gummies", "Tinctures", "Tea", etc.)

Focus on products that would actually help with their specific need. Make them sound real and appealing.

Return ONLY the Python list, no other text:
"""

            response = self.model.generate_content(prompt)
            
            # Try to parse the response as Python code
            try:
                # Clean up the response and evaluate it safely
                product_text = response.text.strip()
                if product_text.startswith('```python'):
                    product_text = product_text.replace('```python', '').replace('```', '').strip()
                elif product_text.startswith('```'):
                    product_text = product_text.replace('```', '').strip()
                
                # Use eval safely (in production, would use a proper parser)
                products = eval(product_text)
                
                # Add IDs to products
                for i, product in enumerate(products):
                    product['id'] = i + 1
                    
                return products
                
            except Exception as parse_error:
                logger.error(f"Failed to parse product recommendations: {parse_error}")
                return self._fallback_products(user_query)
                
        except Exception as e:
            logger.error(f"Gemini API error for products: {e}")
            return self._fallback_products(user_query)

    def _fallback_explanation(self, user_query: str) -> str:
        """Fallback explanation when Gemini is not available"""
        query = user_query.lower()
        
        if 'thca' in query:
            return 'THCA is the raw, non-psychoactive precursor to THC found in fresh hemp. When heated, it converts to THC. THCA products offer potential therapeutic benefits without the high.'
        elif 'sleep' in query or 'cant sleep' in query:
            return 'For sleep support, CBD and CBN work together to promote relaxation. Look for products with calming terpenes like myrcene and linalool for the most restful experience.'
        elif 'cookout' in query or 'party' in query or 'social' in query:
            return 'For social gatherings, consider low-dose edibles or beverages that promote relaxation without overwhelming effects. Start low and go slow for the best experience.'
        elif 'regulation' in query or 'legal' in query:
            return 'In North Carolina, hemp products must contain less than 0.3% Delta-9 THC. All products should be lab-tested and compliant with state regulations for your safety.'
        else:
            return 'Based on your question, here are some thoughtfully selected options that align with your wellness journey. Each product is lab-tested and NC compliant.'

    def _fallback_products(self, user_query: str) -> list:
        """Fallback products when Gemini is not available"""
        query = user_query.lower()
        
        if 'sleep' in query or 'cant sleep' in query:
            return [
                {
                    "id": 1,
                    "name": "Night Time CBD Gummies",
                    "description": "5mg CBD + 2mg CBN per gummy. Infused with lavender for peaceful sleep.",
                    "price": "$28",
                    "category": "Sleep"
                },
                {
                    "id": 2,
                    "name": "Calm Tincture",
                    "description": "Full spectrum CBD oil with chamomile. Start with 0.5ml under tongue.",
                    "price": "$45",
                    "category": "Tinctures"
                },
                {
                    "id": 3,
                    "name": "Dream Tea Blend",
                    "description": "Hemp flower tea with passionflower and lemon balm. Caffeine-free.",
                    "price": "$18",
                    "category": "Tea"
                }
            ]
        else:
            # Default products
            return [
                {
                    "id": 1,
                    "name": "CBD Wellness Gummies",
                    "description": "10mg CBD per gummy. Perfect for daily wellness support.",
                    "price": "$32",
                    "category": "Gummies"
                },
                {
                    "id": 2,
                    "name": "Full Spectrum Tincture",
                    "description": "Premium hemp extract with natural terpenes for balanced wellness.",
                    "price": "$55",
                    "category": "Tinctures"
                },
                {
                    "id": 3,
                    "name": "Hemp Flower",
                    "description": "High-quality hemp flower for those who prefer natural consumption.",
                    "price": "$25",
                    "category": "Flower"
                }
            ]

    def is_available(self) -> bool:
        """Check if Gemini service is available"""
        return self.model is not None