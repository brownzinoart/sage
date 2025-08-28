from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any, List
import uuid

from app.models.schemas import ChatMessage, ChatResponse, ProductInfo
from app.db.mock_database import mock_db
from app.services.gemini_service import GeminiService
from app.services.clean_sage_service import CleanSageService

router = APIRouter()

# Initialize services
gemini_service = GeminiService()
sage_service = CleanSageService()

@router.post("/message", response_model=ChatResponse)
async def process_message(message: ChatMessage, request: Request):
    """Process a chat message and return response with recommendations and educational content"""
    
    try:
        # Get or create session
        session_id = message.session_id or str(uuid.uuid4())
        
        # Use Sage service to get comprehensive response with educational content
        try:
            sage_response = await sage_service.ask_sage(
                message.text, 
                experience_level="curious"
            )
            
            explanation = sage_response['explanation']
            educational_resources = sage_response.get('educational_resources')
            educational_summary = sage_response.get('educational_summary')
            ai_products = sage_response['products']
            
        except Exception as sage_error:
            print(f"Sage service error, falling back to Gemini: {sage_error}")
            # Fallback to Gemini service
            explanation = gemini_service.generate_hemp_explanation(message.text)
            educational_resources = None
            educational_summary = None
            ai_products = gemini_service.generate_product_recommendations(message.text, explanation)
        
        # Convert AI products to ProductInfo format
        product_list = []
        for p in ai_products:
            # Parse price from string format
            price_str = p.get('price', '0')
            if isinstance(price_str, str):
                # Remove $ and convert to float
                price_clean = price_str.replace('$', '').replace(',', '')
                try:
                    price = float(price_clean)
                except (ValueError, TypeError):
                    price = 0.0
            else:
                price = float(price_str) if price_str else 0.0
                
            product_info = ProductInfo(
                id=p.get('id', 1),
                name=p.get('name', ''),
                brand=p.get('brand', 'Sage'),
                description=p.get('description', ''),
                cbd_mg=None,
                thc_mg=None,
                cbg_mg=None,
                cbn_mg=None,
                cbc_mg=None,
                thca_percentage=None,
                price=price,
                effects=[],
                terpenes={},
                lab_tested=True,
                lab_report_url=None,
                match_score=0.9,
                product_type=p.get('category', 'Hemp Product'),
                strain_type=None,
                in_stock=True
            )
            product_list.append(product_info)
        
        # Store conversation
        await mock_db.add_message(session_id, message.text, explanation, 'ai_generated')
        
        return ChatResponse(
            session_id=session_id,
            response=explanation,
            products=product_list,
            suggestions=generate_suggestions(detect_simple_intent(message.text)),
            educational_resources=educational_resources,
            educational_summary=educational_summary,
            service_status=sage_response.get('service_status'),
            status_message=sage_response.get('status_message')
        )
        
    except Exception as e:
        print(f"Error processing message: {e}")
        raise HTTPException(status_code=500, detail="Error processing message")

def detect_simple_intent(text: str) -> str:
    """Simple intent detection fallback"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['help', 'need', 'looking for']):
        return 'search_effect'
    elif any(word in text_lower for word in ['what is', 'explain', 'how does']):
        return 'education'
    elif any(word in text_lower for word in ['safe', 'legal', 'test']):
        return 'safety'
    elif any(word in text_lower for word in ['new', 'beginner', 'start']):
        return 'education'
    else:
        return 'browse'

def generate_response(user_text: str, intent: str, products: List[ProductInfo]) -> str:
    """Generate conversational response"""
    
    if intent == 'search_effect' or intent == 'search_condition':
        if products:
            product_names = [p.name for p in products[:3]]
            return f"I found some great options for you! Here are my top recommendations: {', '.join(product_names)}. Each of these has been carefully selected based on what you're looking for. Would you like to know more about any of these?"
        else:
            return "I understand what you're looking for. Let me help you find the right products. Could you tell me a bit more about your specific needs or preferences?"
    
    elif intent == 'education':
        return """I'd be happy to help you learn about hemp products! Hemp contains many beneficial compounds called cannabinoids, like CBD, CBG, and CBN. Each has unique properties:

• **CBD**: Calming and anti-inflammatory, great for anxiety and pain
• **CBG**: Energizing and focusing, perfect for daytime use  
• **CBN**: Sedating and sleep-promoting, ideal for nighttime

What would you like to learn more about?"""
    
    elif intent == 'safety':
        return """Safety is very important! Here are key things to know:

• All our products are lab-tested for purity and potency
• Hemp products with less than 0.3% THC are legal in North Carolina
• Start with low doses and increase gradually
• Consult your doctor if you're taking medications

Do you have specific safety questions I can address?"""
    
    elif intent == 'browse':
        return "Welcome! I'm here to help you explore our hemp products. We have a thoughtfully curated selection including tinctures, gummies, topicals, and more. What brings you here today?"
    
    else:
        return "Hi there! I'm here to help you discover hemp products that match your needs. Whether you're new to hemp or looking for something specific, I'm happy to guide you through our selection."

def generate_suggestions(intent: str) -> List[str]:
    """Generate contextual suggestions"""
    
    suggestions_map = {
        'search_effect': [
            "Tell me more about the first option",
            "Do you have anything for daytime use?",
            "What about dosage recommendations?"
        ],
        'education': [
            "How is hemp different from marijuana?",
            "Will this show up on a drug test?",
            "What's the difference between CBD and CBG?"
        ],
        'safety': [
            "Can I take this with medications?",
            "Is this legal in North Carolina?",
            "How do I know the right dosage?"
        ],
        'browse': [
            "I'm new to hemp products",
            "Show me products for relaxation",
            "What are your best sellers?"
        ]
    }
    
    return suggestions_map.get(intent, [
        "Tell me more",
        "I have a question",
        "Show me products"
    ])