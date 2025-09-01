import google.generativeai as genai
import os
import re
from typing import Dict, Any, List, Tuple
import logging
from enum import Enum

logger = logging.getLogger(__name__)

class UserIntent(Enum):
    SLEEP_SUPPORT = "sleep_support"
    ANXIETY_STRESS = "anxiety_stress"
    PAIN_RELIEF = "pain_relief"
    SOCIAL_RELAXATION = "social_relaxation"
    EDUCATION_GENERAL = "education_general"
    EDUCATION_SPECIFIC = "education_specific"
    REGULATION_LEGAL = "regulation_legal"
    PRODUCT_BROWSING = "product_browsing"
    DOSAGE_GUIDANCE = "dosage_guidance"
    SAFETY_CONCERNS = "safety_concerns"

class UserPersona(Enum):
    NEWCOMER = "newcomer"
    CURIOUS_LEARNER = "curious_learner"
    EXPERIENCED_USER = "experienced_user"
    HEALTH_FOCUSED = "health_focused"
    RECREATIONAL_USER = "recreational_user"

class AdvancedGeminiService:
    def __init__(self):
        # Configure Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            self.model = None
            return
            
        genai.configure(api_key=api_key)
        
        try:
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            logger.info("Advanced Sage AI service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini model: {e}")
            self.model = None

    def classify_intent_and_persona(self, user_query: str) -> Tuple[UserIntent, UserPersona]:
        """Classify user intent and persona from their query"""
        if not self.model:
            return self._fallback_classification(user_query)
        
        try:
            classification_prompt = f"""
Analyze this hemp/wellness query and classify the user's intent and experience level:

Query: "{user_query}"

Return your analysis as JSON:
{{
    "intent": "one of: sleep_support, anxiety_stress, pain_relief, social_relaxation, education_general, education_specific, regulation_legal, product_browsing, dosage_guidance, safety_concerns",
    "persona": "one of: newcomer, curious_learner, experienced_user, health_focused, recreational_user",
    "confidence": "0.0 to 1.0",
    "reasoning": "brief explanation of classification"
}}

Intent definitions:
- sleep_support: trouble sleeping, insomnia, relaxation for bedtime
- anxiety_stress: anxiety, stress relief, calming needs
- pain_relief: physical discomfort, inflammation, chronic pain
- social_relaxation: social situations, parties, cookouts, gatherings
- education_general: basic hemp/CBD questions, how it works
- education_specific: detailed questions about compounds, effects, terpenes
- regulation_legal: legal questions, compliance, drug tests
- product_browsing: general shopping, "what do you have"
- dosage_guidance: how much to take, dosing questions
- safety_concerns: side effects, interactions, safety

Persona indicators:
- newcomer: first time, beginner, new to hemp/CBD
- curious_learner: asking educational questions, wants to understand
- experienced_user: knows terminology, specific product requests
- health_focused: mentions medical conditions, therapeutic use
- recreational_user: social use, fun activities, casual mention
"""

            response = self.model.generate_content(classification_prompt)
            
            # Parse JSON response
            import json
            try:
                result = json.loads(response.text.strip())
                intent = UserIntent(result.get('intent', 'education_general'))
                persona = UserPersona(result.get('persona', 'curious_learner'))
                return intent, persona
            except (json.JSONDecodeError, ValueError):
                return self._fallback_classification(user_query)
                
        except Exception as e:
            logger.error(f"Intent classification error: {e}")
            return self._fallback_classification(user_query)

    def generate_sage_response(self, user_query: str, experience_level: str = "curious") -> Dict[str, Any]:
        """Generate comprehensive Sage response with explanation and products"""
        if not self.model:
            return self._fallback_response(user_query, experience_level)
        
        try:
            # Classify user intent and persona
            intent, persona = self.classify_intent_and_persona(user_query)
            
            # Override persona based on experience level if provided
            if experience_level == "new":
                persona = UserPersona.NEWCOMER
            elif experience_level == "experienced":
                persona = UserPersona.EXPERIENCED_USER
            else:  # casual or default
                persona = UserPersona.CURIOUS_LEARNER
            
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
            logger.error(f"Sage response generation error: {e}")
            return self._fallback_response(user_query, experience_level)

    def _get_system_prompt(self) -> str:
        """Core Sage personality and guidelines"""
        return """You are Sage, a wise and gentle hemp wellness guide with deep knowledge of CBD, hemp, and natural wellness. Your personality traits:

🌿 WISDOM: You have extensive knowledge of hemp compounds, terpenes, effects, and wellness applications
🤗 WARMTH: You communicate with genuine care, empathy, and non-judgment
🛡️ SAFETY-FIRST: You always prioritize user safety, proper dosing, and compliance
🎓 EDUCATIONAL: You believe understanding leads to better wellness choices
🏡 LOCAL EXPERT: You're knowledgeable about North Carolina hemp regulations

Communication Style:
- Speak like a knowledgeable friend, not a medical professional
- Use "I" statements and personal touches ("I'd recommend", "In my experience")
- Balance education with warmth - never cold or clinical
- Always mention safety considerations naturally, not as disclaimers
- Guide users toward understanding before product recommendations

Core Principles:
- Education before recommendation
- Start low, go slow
- Lab testing is essential
- Compliance with NC regulations
- Listen to your body
- Cannabis affects everyone differently"""

    def _get_context_prompt(self, intent: UserIntent, persona: UserPersona) -> str:
        """Context-specific guidance based on intent and persona"""
        
        intent_context = {
            UserIntent.SLEEP_SUPPORT: "Focus on CBD/CBN combinations, calming terpenes (myrcene, linalool), and bedtime routine integration. Emphasize timing and avoiding stimulating compounds.",
            UserIntent.ANXIETY_STRESS: "Highlight CBD's calming properties, breathing techniques, and products that promote relaxation without sedation. Mention microdosing benefits.",
            UserIntent.PAIN_RELIEF: "Discuss CBD's anti-inflammatory properties, topical vs internal options, and the entourage effect. Emphasize working with healthcare providers.",
            UserIntent.SOCIAL_RELAXATION: "Suggest low-dose options, social anxiety support, and products that enhance enjoyment without overwhelming effects.",
            UserIntent.EDUCATION_GENERAL: "Provide foundational hemp/CBD education, explain how cannabinoids work, and build confidence through understanding.",
            UserIntent.EDUCATION_SPECIFIC: "Dive deeper into scientific aspects, compound interactions, and advanced concepts while staying accessible.",
            UserIntent.REGULATION_LEGAL: "Clearly explain NC hemp laws, testing requirements, and compliance standards. Address drug testing concerns honestly.",
            UserIntent.PRODUCT_BROWSING: "Guide discovery based on lifestyle, preferences, and wellness goals. Help narrow down choices.",
            UserIntent.DOSAGE_GUIDANCE: "Emphasize individual variation, starting low, and tracking effects. Provide general guidance while encouraging personal experimentation.",
            UserIntent.SAFETY_CONCERNS: "Address concerns directly with factual information, discuss potential interactions, and provide peace of mind."
        }
        
        persona_context = {
            UserPersona.NEWCOMER: "Use simple terms, explain basics thoroughly, provide extra reassurance, and suggest beginner-friendly products.",
            UserPersona.CURIOUS_LEARNER: "Provide detailed explanations, share interesting facts, and encourage further learning with resources.",
            UserPersona.EXPERIENCED_USER: "Use appropriate terminology, focus on specific details they're asking about, and suggest advanced options.",
            UserPersona.HEALTH_FOCUSED: "Emphasize therapeutic benefits, research-backed information, and wellness integration strategies.",
            UserPersona.RECREATIONAL_USER: "Focus on enjoyment, social aspects, and lifestyle integration while maintaining safety focus."
        }
        
        return f"CONTEXT: {intent_context.get(intent, '')} PERSONA: {persona_context.get(persona, '')}"

    def _get_response_prompt(self, user_query: str, intent: UserIntent, persona: UserPersona, experience_level: str = "curious") -> str:
        """Generate the main response prompt"""
        # Experience level guidance
        experience_guidance = {
            "new": "Use simple, accessible language. Explain basic concepts like 'cannabinoids' and 'endocannabinoid system' briefly. Focus on safety, starting small, and reassurance. Avoid technical jargon.",
            "casual": "Provide moderate detail with scientific explanations that are easy to understand. Include how compounds work and what to expect. Balance education with practical guidance.",
            "experienced": "Use technical terminology appropriately. Provide detailed mechanisms, specific compound interactions, advanced dosing considerations, and nuanced effects. Assume familiarity with basics."
        }
        
        guidance = experience_guidance.get(experience_level, experience_guidance["casual"])
        
        return f"""
USER QUERY: "{user_query}"
INTENT: {intent.value}
PERSONA: {persona.value}
EXPERIENCE LEVEL: {experience_level}

EXPERIENCE GUIDANCE: {guidance}

As Sage, provide an educational response that:

1. EXPLAINS THE SCIENCE: What compounds (CBD, CBN, CBG, terpenes) address their need and HOW they work in the body
2. EDUCATES ABOUT INTAKE: What they'll actually be consuming, how it affects them, and what to expect
3. PROVIDES CONTEXT: Why these specific compounds match their situation 
4. INCLUDES PRACTICAL GUIDANCE: Timing, dosing approach, and what results feel like

Your response should be 3-4 sentences that build genuine understanding of:
- Which cannabinoids/terpenes work for their need
- How these compounds interact with their endocannabinoid system
- What the experience feels like and timeline of effects
- Why the recommended products contain these specific compounds

Use warm, educational language like:
- "When you're dealing with [issue], your body responds well to..."
- "The combination of CBD and [compound] works by..."
- "What you'll notice is..."
- "The key is understanding how [compound] affects your..."

AVOID generic statements. BE SPECIFIC about compounds, mechanisms, and expected experiences.

Example good response for sleep:
"When you're struggling with sleep, your body's natural wind-down process needs support from compounds that work with your endocannabinoid system. CBD helps reduce the mental chatter by calming your nervous system, while CBN specifically targets sleep receptors and creates that drowsy feeling about 30-60 minutes after intake. The terpenes myrcene and linalool enhance this effect by promoting muscle relaxation and deeper sleep cycles. What you'll experience is a gentle transition from restlessness to calm, then naturally drifting into restorative sleep without the grogginess."

Make YOUR response this detailed and educational for their specific query.
"""

    def _generate_products(self, user_query: str, intent: UserIntent, persona: UserPersona, explanation: str) -> List[Dict[str, Any]]:
        """Generate contextually appropriate product recommendations"""
        if not self.model:
            return self._fallback_products(intent)
        
        try:
            product_prompt = f"""
Based on this context, generate 3 specific hemp/CBD product recommendations:

USER QUERY: "{user_query}"
INTENT: {intent.value}
PERSONA: {persona.value}
EXPLANATION PROVIDED: "{explanation}"

Create 3 realistic products as JSON array. Each product should:
- Address the specific user need directly
- Be appropriate for their experience level
- Include specific dosing/potency information
- Have realistic pricing
- Include helpful usage notes
- EXPLAIN WHY this product matches their specific query

Product format:
[
  {{
    "name": "Specific Product Name",
    "description": "Brief description with key benefits and usage notes (1-2 sentences)",
    "price": "$XX",
    "category": "Category name",
    "potency": "mg CBD/CBN/etc per unit",
    "usage_tip": "Brief tip for this user type",
    "why_recommended": "2-3 sentence explanation of why this specific product addresses their query"
  }}
]

Focus on products that genuinely match their needs and experience level.
The "why_recommended" should directly connect to their original question.
Return ONLY the JSON array, no other text.
"""

            response = self.model.generate_content(product_prompt)
            
            # Clean and parse JSON
            product_text = response.text.strip()
            if product_text.startswith('```json'):
                product_text = product_text.replace('```json', '').replace('```', '').strip()
            elif product_text.startswith('```'):
                product_text = product_text.replace('```', '').strip()
            
            try:
                products = eval(product_text)  # In production, use json.loads with better error handling
                
                # Add IDs and ensure required fields
                for i, product in enumerate(products):
                    product['id'] = i + 1
                    if 'usage_tip' not in product:
                        product['usage_tip'] = "Start with the lowest recommended dose"
                        
                return products[:3]  # Ensure max 3 products
                
            except Exception as parse_error:
                logger.error(f"Product parsing error: {parse_error}")
                return self._fallback_products(intent)
                
        except Exception as e:
            logger.error(f"Product generation error: {e}")
            return self._fallback_products(intent)

    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI response for structured data"""
        # For now, treat entire response as explanation
        # Could be enhanced to parse structured responses
        return {
            'explanation': response_text.strip(),
            'follow_up_questions': []
        }

    def _fallback_classification(self, user_query: str) -> Tuple[UserIntent, UserPersona]:
        """Fallback intent classification when AI is unavailable"""
        query_lower = user_query.lower()
        
        # Simple keyword-based classification
        if any(word in query_lower for word in ['sleep', 'cant sleep', 'insomnia', 'bedtime', 'tossing', 'turning']):
            return UserIntent.SLEEP_SUPPORT, UserPersona.CURIOUS_LEARNER
        elif any(word in query_lower for word in ['anxiety', 'anxious', 'stress', 'stressed', 'calm', 'relax', 'nervous', 'worried', 'meeting', 'work stress']):
            return UserIntent.ANXIETY_STRESS, UserPersona.CURIOUS_LEARNER
        elif any(word in query_lower for word in ['party', 'cookout', 'social', 'gathering', 'friends']):
            return UserIntent.SOCIAL_RELAXATION, UserPersona.RECREATIONAL_USER
        elif any(word in query_lower for word in ['what is', 'how does', 'explain', 'cbd', 'hemp', 'cannabinoid', 'tell me about', 'what should i know']):
            return UserIntent.EDUCATION_GENERAL, UserPersona.CURIOUS_LEARNER
        elif any(word in query_lower for word in ['legal', 'regulation', 'drug test', 'nc', 'north carolina', 'compliant']):
            return UserIntent.REGULATION_LEGAL, UserPersona.CURIOUS_LEARNER
        elif any(word in query_lower for word in ['pain', 'hurt', 'sore', 'inflammation', 'ache']):
            return UserIntent.PAIN_RELIEF, UserPersona.HEALTH_FOCUSED
        elif any(word in query_lower for word in ['dose', 'dosage', 'how much', 'mg', 'amount']):
            return UserIntent.DOSAGE_GUIDANCE, UserPersona.CURIOUS_LEARNER
        else:
            return UserIntent.EDUCATION_GENERAL, UserPersona.CURIOUS_LEARNER  # Default to education instead of browsing

    def _fallback_response(self, user_query: str, experience_level: str = "curious") -> Dict[str, Any]:
        """Fallback response when AI is unavailable"""
        intent, persona = self._fallback_classification(user_query)
        
        # Experience-level specific explanations for sleep support
        sleep_explanations = {
            "new": "Sleep troubles are really common, and natural hemp compounds can gently help your body relax. CBD is a safe, non-psychoactive compound that helps calm your mind, while CBN naturally promotes sleepiness. Together, they work with your body's own systems to help you wind down. You'll typically feel more relaxed within an hour, leading to better sleep without grogginess the next day.",
            
            "casual": "When you're struggling with sleep, your body's natural wind-down process needs support from compounds that work with your endocannabinoid system. CBD helps reduce the mental chatter by calming your nervous system, while CBN specifically targets sleep receptors and creates that drowsy feeling about 30-60 minutes after intake. The terpenes myrcene and linalool enhance this effect by promoting muscle relaxation and deeper sleep cycles. What you'll experience is a gentle transition from restlessness to calm, then naturally drifting into restorative sleep without grogginess.",
            
            "experienced": "For sleep optimization, you're looking at GABA receptor modulation via CBD's anxiolytic pathways combined with CBN's specific affinity for CB1 receptors in sleep-regulating brain regions. The synergistic effect with myrcene (β-myrcene) enhances the sedative properties through enhanced permeability of the blood-brain barrier, while linalool contributes via its action on glutamate and GABA neurotransmission. Onset typically occurs within 30-45 minutes with peak effects at 60-90 minutes, lasting 6-8 hours depending on individual metabolism and tolerance."
        }
        
        # Get experience-appropriate explanation
        sleep_explanation = sleep_explanations.get(experience_level, sleep_explanations["casual"])
        
        explanations = {
            UserIntent.SLEEP_SUPPORT: sleep_explanation,
            
            UserIntent.ANXIETY_STRESS: "When you're feeling anxious or stressed, your body's fight-or-flight response is overactive, and CBD works by interacting with serotonin receptors to help regulate this response. Unlike pharmaceutical options, CBD doesn't sedate but rather helps your nervous system find its natural balance, typically within 15-30 minutes of intake. The addition of L-theanine or adaptogenic herbs like ashwagandha can enhance this calming effect. You'll notice a subtle shift from tension to ease, allowing you to stay alert and focused while feeling more centered and resilient to stress.",
            
            UserIntent.SOCIAL_RELAXATION: "For social situations, your goal is to ease social anxiety without impairing your natural personality or cognitive function. Low-dose CBD (2.5-5mg) works by modulating your endocannabinoid system's response to social stress, reducing that fight-or-flight feeling without causing sedation. Combined with terpenes like limonene, which promotes mood elevation, you'll feel more comfortable and authentic in social settings. The effect is subtle - most people describe it as feeling like 'the best version of yourself' rather than feeling altered or impaired.",
            
            UserIntent.EDUCATION_GENERAL: "Hemp contains over 100 different cannabinoids and terpenes that work together in what's called the 'entourage effect' to support your body's endocannabinoid system - a network of receptors that help regulate sleep, mood, pain, and immune function. CBD is the most abundant non-psychoactive compound and acts as a gentle modulator, helping your body maintain homeostasis. Unlike THC, CBD won't make you feel 'high' but rather supports your natural balance. The effects are typically felt within 15-45 minutes depending on the consumption method, with benefits lasting 4-6 hours.",
            
            UserIntent.REGULATION_LEGAL: "In North Carolina, hemp-derived products are legal as long as they contain less than 0.3% Delta-9 THC by dry weight, as defined by the 2018 Farm Bill. However, it's crucial to understand that 'hemp-derived' doesn't automatically mean safe or effective - proper lab testing for potency, pesticides, heavy metals, and residual solvents is essential. Look for products with Certificate of Analysis (COA) from third-party labs, and understand that while federally legal, some employers may still test for CBD metabolites. Quality matters more than price when it comes to your wellness and legal compliance."
        }
        
        explanation = explanations.get(intent, "Based on your question, I'd love to help you find something that supports your wellness journey. Every person's experience with hemp is unique, so let's find what works best for you.")
        
        return {
            'explanation': explanation,
            'products': self._fallback_products(intent),
            'intent': intent.value,
            'persona': persona.value,
            'follow_up_questions': []
        }

    def _fallback_products(self, intent: UserIntent) -> List[Dict[str, Any]]:
        """Intent-specific fallback products"""
        
        product_sets = {
            UserIntent.SLEEP_SUPPORT: [
                {
                    "id": 1,
                    "name": "Night Time CBD + CBN Gummies",
                    "description": "5mg CBD + 2mg CBN per gummy with calming lavender. Perfect for bedtime routine.",
                    "price": "$32",
                    "category": "Sleep Support",
                    "potency": "5mg CBD + 2mg CBN",
                    "usage_tip": "Take 30-60 minutes before desired bedtime",
                    "why_recommended": "This combines CBD for mental calm with CBN for natural sleepiness, directly addressing your sleep troubles. The lavender enhances the calming effect, and the gummy format makes dosing simple and consistent."
                },
                {
                    "id": 2,
                    "name": "Dream Tincture",
                    "description": "Full spectrum CBD oil with chamomile and passionflower for natural sleep support.",
                    "price": "$48",
                    "category": "Tinctures",
                    "potency": "25mg CBD per ml",
                    "usage_tip": "Start with 0.5ml under tongue before bed",
                    "why_recommended": "Tinctures work faster than gummies for quicker sleep support. The chamomile and passionflower add traditional sleep herbs to enhance the CBD's calming effects."
                },
                {
                    "id": 3,
                    "name": "Sleepy Time Tea Blend",
                    "description": "Hemp flower tea with lavender, chamomile, and lemon balm. Caffeine-free bedtime ritual.",
                    "price": "$22",
                    "category": "Tea & Herbs",
                    "potency": "Low-dose hemp flower",
                    "usage_tip": "Steep 5-7 minutes for optimal extraction",
                    "why_recommended": "The ritual of making tea helps signal bedtime to your body, while the hemp flower provides gentle relaxation. Perfect if you prefer a natural, non-processed approach to sleep support."
                }
            ],
            UserIntent.ANXIETY_STRESS: [
                {
                    "id": 1,
                    "name": "Daily Calm CBD Capsules",
                    "description": "10mg CBD capsules for consistent daily stress support. Easy to dose and travel-friendly.",
                    "price": "$35",
                    "category": "Capsules",
                    "potency": "10mg CBD per capsule",
                    "usage_tip": "Take with food for better absorption"
                },
                {
                    "id": 2,
                    "name": "Zen Tincture",
                    "description": "Broad spectrum CBD with adaptogenic herbs like ashwagandha for stress resilience.",
                    "price": "$52",
                    "category": "Tinctures",
                    "potency": "20mg CBD per ml",
                    "usage_tip": "Start with 0.5ml twice daily"
                },
                {
                    "id": 3,
                    "name": "Calm Gummies",
                    "description": "5mg CBD gummies with L-theanine and natural fruit flavors. Discreet stress relief.",
                    "price": "$28",
                    "category": "Gummies",
                    "potency": "5mg CBD + L-theanine",
                    "usage_tip": "Take 1-2 gummies as needed for stress"
                }
            ]
        }
        
        # Default to general wellness products if intent not found
        default_products = [
            {
                "id": 1,
                "name": "Daily Wellness CBD Oil",
                "description": "Versatile full spectrum CBD oil for general wellness support. Great starting point.",
                "price": "$45",
                "category": "Tinctures",
                "potency": "15mg CBD per ml",
                "usage_tip": "Start with 0.25ml twice daily"
            },
            {
                "id": 2,
                "name": "Mixed Berry CBD Gummies",
                "description": "Delicious 10mg CBD gummies made with organic ingredients. Easy to dose.",
                "price": "$30",
                "category": "Gummies",
                "potency": "10mg CBD per gummy",
                "usage_tip": "Start with half a gummy, wait 2 hours"
            },
            {
                "id": 3,
                "name": "CBD Wellness Capsules",
                "description": "Convenient 15mg CBD capsules for consistent daily support.",
                "price": "$38",
                "category": "Capsules",
                "potency": "15mg CBD per capsule",
                "usage_tip": "Take with breakfast for all-day support"
            }
        ]
        
        return product_sets.get(intent, default_products)

    def is_available(self) -> bool:
        """Check if Gemini service is available"""
        return self.model is not None