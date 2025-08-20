import spacy
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Tuple
import numpy as np
from enum import Enum
import re

class Intent(Enum):
    BROWSE = "browse"
    SEARCH_EFFECT = "search_effect"
    SEARCH_CONDITION = "search_condition"
    EDUCATION = "education"
    DOSAGE = "dosage"
    SAFETY = "safety"
    COMPARISON = "comparison"
    UNKNOWN = "unknown"

class NLPEngine:
    """Natural Language Processing engine for BudGuide"""
    
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("⚠️  spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
            
        try:
            self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"⚠️  SentenceTransformer model not found: {e}")
            self.encoder = None
        
        # Intent patterns
        self.intent_patterns = {
            Intent.SEARCH_EFFECT: [
                "help with", "looking for", "need something for",
                "want to feel", "make me", "help me", "good for"
            ],
            Intent.SEARCH_CONDITION: [
                "pain", "anxiety", "sleep", "insomnia", "arthritis",
                "inflammation", "stress", "depression", "nausea", "appetite"
            ],
            Intent.EDUCATION: [
                "what is", "how does", "explain", "tell me about",
                "difference between", "learn about", "how to"
            ],
            Intent.DOSAGE: [
                "how much", "dosage", "dose", "mg", "milligrams",
                "start with", "beginner dose", "how many"
            ],
            Intent.SAFETY: [
                "safe", "interact", "drug test", "legal", "side effects",
                "pregnant", "medication", "driving", "work"
            ]
        }
        
        # Effect mappings for better understanding
        self.effect_mappings = {
            "sleep": ["sedating", "relaxing", "calming", "nighttime", "sleepy"],
            "energy": ["energizing", "uplifting", "focus", "daytime", "alert"],
            "pain": ["anti-inflammatory", "analgesic", "pain-relief", "sore"],
            "anxiety": ["anxiolytic", "calming", "stress-relief", "nervous"],
            "focus": ["clarity", "concentration", "alertness", "productive"]
        }
        
        # Cannabinoid properties
        self.cannabinoid_effects = {
            "CBD": ["anti-anxiety", "anti-inflammatory", "non-intoxicating", "calming"],
            "CBG": ["focus", "energy", "anti-bacterial", "alertness"],
            "CBN": ["sedating", "sleep", "appetite", "relaxing"],
            "CBC": ["mood", "anti-inflammatory", "supportive"],
            "THCA": ["anti-inflammatory", "neuroprotective", "non-intoxicating"]
        }
    
    def process_query(self, text: str) -> Dict[str, Any]:
        """Process user query and extract intent, entities, and embeddings"""
        if not text.strip():
            return self._empty_result(text)
        
        # Extract intent
        intent = self._classify_intent(text)
        
        # Extract entities
        entities = self._extract_entities(text)
        
        # Generate embedding for semantic search
        embedding = []
        if self.encoder:
            try:
                embedding = self.encoder.encode(text)
            except Exception as e:
                print(f"⚠️  Error generating embedding: {e}")
        
        # Extract keywords for hybrid search
        keywords = self._extract_keywords(text)
        
        # Map to product requirements
        requirements = self._map_requirements(intent, entities, text)
        
        return {
            "original_text": text,
            "intent": intent.value,
            "entities": entities,
            "embedding": embedding.tolist() if len(embedding) > 0 else [],
            "keywords": keywords,
            "requirements": requirements
        }
    
    def _empty_result(self, text: str) -> Dict[str, Any]:
        """Return empty result for invalid input"""
        return {
            "original_text": text,
            "intent": Intent.UNKNOWN.value,
            "entities": {},
            "embedding": [],
            "keywords": [],
            "requirements": {}
        }
    
    def _classify_intent(self, text: str) -> Intent:
        """Classify the intent of the query"""
        text_lower = text.lower()
        
        # Check each intent pattern
        for intent, patterns in self.intent_patterns.items():
            if any(pattern in text_lower for pattern in patterns):
                return intent
        
        # Default intents based on question words
        if any(text_lower.startswith(word) for word in ["what", "how", "why", "when"]):
            return Intent.EDUCATION
        elif any(word in text_lower for word in ["browse", "show", "see", "categories"]):
            return Intent.BROWSE
            
        return Intent.SEARCH_EFFECT  # Default to search
    
    def _extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract relevant entities from the query"""
        entities = {
            "conditions": [],
            "effects": [],
            "time_of_day": [],
            "cannabinoids": [],
            "product_types": [],
            "dosage": [],
            "negations": []
        }
        
        text_lower = text.lower()
        
        # Condition extraction
        conditions = ["pain", "anxiety", "sleep", "stress", "inflammation", 
                     "arthritis", "insomnia", "depression", "nausea", "appetite",
                     "migraine", "headache", "cramps", "seizure"]
        for condition in conditions:
            if condition in text_lower:
                entities["conditions"].append(condition)
        
        # Time of day extraction
        if any(word in text_lower for word in ["morning", "daytime", "day", "am", "work"]):
            entities["time_of_day"].append("day")
        if any(word in text_lower for word in ["evening", "night", "bedtime", "sleep", "pm"]):
            entities["time_of_day"].append("night")
        
        # Cannabinoid extraction
        cannabinoids = ["cbd", "cbg", "cbn", "cbc", "thc", "thca"]
        for cannabinoid in cannabinoids:
            if cannabinoid in text_lower:
                entities["cannabinoids"].append(cannabinoid.upper())
        
        # Product type extraction
        product_types = ["flower", "tincture", "oil", "edible", "gummy", 
                        "topical", "cream", "vape", "capsule", "salve", "balm"]
        for product_type in product_types:
            if product_type in text_lower:
                entities["product_types"].append(product_type)
        
        # Dosage extraction using regex
        dosage_patterns = [
            r'(\d+)\s*mg',
            r'(\d+)\s*milligram',
            r'(\d+)\s*drop',
            r'(\d+)\s*ml'
        ]
        
        for pattern in dosage_patterns:
            matches = re.findall(pattern, text_lower)
            entities["dosage"].extend(matches)
        
        # Negation detection
        negation_patterns = [
            r'not\s+(\w+)',
            r'no\s+(\w+)',
            r'without\s+(\w+)',
            r"don't\s+want\s+(\w+)",
            r"won't\s+(\w+)"
        ]
        
        for pattern in negation_patterns:
            matches = re.findall(pattern, text_lower)
            entities["negations"].extend(matches)
        
        # Effect extraction based on mappings
        for effect_category, effect_words in self.effect_mappings.items():
            for effect_word in effect_words:
                if effect_word in text_lower:
                    entities["effects"].append(effect_category)
                    break
        
        return entities
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords for hybrid search"""
        if not self.nlp:
            # Fallback: simple word extraction
            words = text.lower().split()
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'}
            return [word for word in words if word not in stop_words and len(word) > 2]
        
        doc = self.nlp(text)
        
        # Extract nouns and adjectives
        keywords = []
        for token in doc:
            if token.pos_ in ["NOUN", "ADJ"] and not token.is_stop and len(token.text) > 2:
                keywords.append(token.lemma_.lower())
        
        # Add important bigrams
        bigrams = []
        for i in range(len(doc) - 1):
            if doc[i].pos_ == "ADJ" and doc[i + 1].pos_ == "NOUN":
                bigrams.append(f"{doc[i].text.lower()} {doc[i + 1].text.lower()}")
        
        return keywords + bigrams
    
    def _map_requirements(self, intent: Intent, entities: Dict, text: str) -> Dict[str, Any]:
        """Map intent and entities to product requirements"""
        requirements = {
            "must_have": [],
            "should_have": [],
            "must_not_have": [],
            "preferred_cannabinoids": [],
            "dosage_range": None,
            "time_of_day": None,
            "price_range": None
        }
        
        # Map conditions to effects
        condition_mappings = {
            "pain": {
                "effects": ["anti-inflammatory", "analgesic", "pain-relief"],
                "cannabinoids": ["CBD", "CBC"]
            },
            "inflammation": {
                "effects": ["anti-inflammatory"],
                "cannabinoids": ["CBD", "CBC", "THCA"]
            },
            "sleep": {
                "effects": ["sedating", "relaxing", "calming"],
                "cannabinoids": ["CBN", "CBD"]
            },
            "insomnia": {
                "effects": ["sedating", "relaxing"],
                "cannabinoids": ["CBN", "CBD"]
            },
            "anxiety": {
                "effects": ["calming", "anxiolytic", "stress-relief"],
                "cannabinoids": ["CBD", "CBG"]
            },
            "stress": {
                "effects": ["calming", "stress-relief", "relaxing"],
                "cannabinoids": ["CBD"]
            }
        }
        
        for condition in entities.get("conditions", []):
            if condition in condition_mappings:
                mapping = condition_mappings[condition]
                requirements["should_have"].extend(mapping["effects"])
                requirements["preferred_cannabinoids"].extend(mapping["cannabinoids"])
        
        # Time-based requirements
        time_of_day = entities.get("time_of_day", [])
        if "day" in time_of_day:
            requirements["must_not_have"].append("sedating")
            requirements["should_have"].append("energizing")
            requirements["time_of_day"] = "day"
        elif "night" in time_of_day:
            requirements["should_have"].append("sedating")
            requirements["must_not_have"].append("energizing")
            requirements["time_of_day"] = "night"
        
        # Handle negations
        negations = entities.get("negations", [])
        for negation in negations:
            if negation in ["high", "intoxicating", "psychoactive"]:
                requirements["must_not_have"].append("THC")
            elif negation in ["groggy", "drowsy", "sleepy"]:
                requirements["must_not_have"].append("heavy sedation")
            elif negation in ["anxious", "jittery", "wired"]:
                requirements["must_not_have"].append("stimulating")
        
        # Product type preferences
        product_types = entities.get("product_types", [])
        if product_types:
            requirements["product_type"] = product_types[0]
        
        # Cannabinoid preferences from entities
        cannabinoids = entities.get("cannabinoids", [])
        if cannabinoids:
            requirements["preferred_cannabinoids"].extend(cannabinoids)
        
        # Remove duplicates
        for key in ["must_have", "should_have", "must_not_have", "preferred_cannabinoids"]:
            if key in requirements:
                requirements[key] = list(set(requirements[key]))
        
        return requirements

    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """Basic sentiment analysis for user messages"""
        positive_words = ["good", "great", "excellent", "amazing", "perfect", "love", "like", "helpful", "effective"]
        negative_words = ["bad", "terrible", "awful", "hate", "dislike", "ineffective", "useless", "worse"]
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        total = positive_count + negative_count
        if total == 0:
            return {"positive": 0.5, "negative": 0.5, "neutral": 1.0}
        
        return {
            "positive": positive_count / total,
            "negative": negative_count / total,
            "neutral": 1.0 - (positive_count + negative_count) / len(text_lower.split())
        }