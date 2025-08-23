"""
Terpene Profile Aggregator
Combines terpene data from multiple sources and provides comprehensive terpene analysis
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import json

import sys
import os
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from mcp_types import ResearchPaper

logger = logging.getLogger(__name__)

class TerpeneAggregator:
    """Aggregates terpene data and provides comprehensive terpene analysis"""
    
    def __init__(self):
        # Comprehensive terpene database with effects, aromas, and therapeutic benefits
        self.terpene_database = {
            'myrcene': {
                'name': 'Myrcene',
                'chemical_name': 'β-Myrcene',
                'formula': 'C10H16',
                'molecular_weight': 136.23,
                'boiling_point': 167,  # Celsius
                'effects': {
                    'primary': ['sedating', 'relaxing', 'muscle-relaxant'],
                    'secondary': ['couch-lock', 'sleepy', 'calm'],
                    'synergy': 'enhances THC absorption'
                },
                'aroma': {
                    'primary': 'earthy',
                    'secondary': ['musky', 'clove-like', 'herbal'],
                    'notes': 'reminiscent of ripe mango'
                },
                'therapeutic': {
                    'conditions': ['insomnia', 'pain', 'inflammation', 'muscle-spasms'],
                    'mechanisms': ['GABA enhancement', 'muscle relaxation', 'anti-inflammatory'],
                    'dosage_threshold': '0.5%'  # Typical threshold for effects
                },
                'sources': ['mangoes', 'hops', 'lemongrass', 'cannabis'],
                'prevalence': 'most-common-in-indica',
                'research_status': 'well-studied'
            },
            'limonene': {
                'name': 'Limonene',
                'chemical_name': 'D-Limonene',
                'formula': 'C10H16',
                'molecular_weight': 136.23,
                'boiling_point': 176,
                'effects': {
                    'primary': ['uplifting', 'stress-relief', 'mood-enhancement'],
                    'secondary': ['energizing', 'focus', 'anti-anxiety'],
                    'synergy': 'enhances serotonin and dopamine'
                },
                'aroma': {
                    'primary': 'citrus',
                    'secondary': ['lemon', 'orange', 'fresh'],
                    'notes': 'bright and clean'
                },
                'therapeutic': {
                    'conditions': ['depression', 'anxiety', 'stress', 'acid-reflux', 'gallstones'],
                    'mechanisms': ['serotonin uptake', 'gastric protection', 'anti-tumor'],
                    'dosage_threshold': '0.3%'
                },
                'sources': ['citrus-peels', 'juniper', 'peppermint', 'cannabis'],
                'prevalence': 'common-in-sativa',
                'research_status': 'extensively-studied'
            },
            'pinene': {
                'name': 'Pinene',
                'chemical_name': 'α-Pinene',
                'formula': 'C10H16',
                'molecular_weight': 136.23,
                'boiling_point': 156,
                'effects': {
                    'primary': ['alertness', 'memory-retention', 'focus'],
                    'secondary': ['counteracts-thc-memory-loss', 'bronchodilator', 'anti-inflammatory'],
                    'synergy': 'balances THC effects'
                },
                'aroma': {
                    'primary': 'pine',
                    'secondary': ['rosemary', 'basil', 'woody'],
                    'notes': 'fresh forest-like'
                },
                'therapeutic': {
                    'conditions': ['asthma', 'pain', 'ulcers', 'anxiety', 'cancer'],
                    'mechanisms': ['acetylcholinesterase inhibition', 'bronchodilation', 'anti-microbial'],
                    'dosage_threshold': '0.2%'
                },
                'sources': ['pine-needles', 'rosemary', 'basil', 'dill', 'cannabis'],
                'prevalence': 'common-in-sativa',
                'research_status': 'well-researched'
            },
            'linalool': {
                'name': 'Linalool',
                'chemical_name': 'Linalool',
                'formula': 'C10H18O',
                'molecular_weight': 154.25,
                'boiling_point': 198,
                'effects': {
                    'primary': ['calming', 'sedating', 'anti-anxiety'],
                    'secondary': ['anti-convulsant', 'analgesic', 'anti-depressant'],
                    'synergy': 'enhances CBD effects'
                },
                'aroma': {
                    'primary': 'floral',
                    'secondary': ['lavender', 'spicy', 'woody'],
                    'notes': 'soothing and sweet'
                },
                'therapeutic': {
                    'conditions': ['anxiety', 'depression', 'insomnia', 'pain', 'seizures'],
                    'mechanisms': ['GABA modulation', 'serotonin receptor activation', 'voltage-gated sodium channels'],
                    'dosage_threshold': '0.1%'
                },
                'sources': ['lavender', 'coriander', 'mint', 'cinnamon', 'cannabis'],
                'prevalence': 'rare-but-potent',
                'research_status': 'emerging-research'
            },
            'caryophyllene': {
                'name': 'Caryophyllene',
                'chemical_name': 'β-Caryophyllene',
                'formula': 'C15H24',
                'molecular_weight': 204.35,
                'boiling_point': 266,
                'effects': {
                    'primary': ['anti-inflammatory', 'analgesic', 'neuroprotective'],
                    'secondary': ['gastroprotective', 'anti-oxidant', 'anti-anxiety'],
                    'synergy': 'CB2 receptor activation (only terpene to do this)'
                },
                'aroma': {
                    'primary': 'spicy',
                    'secondary': ['woody', 'clove', 'pepper'],
                    'notes': 'warm and complex'
                },
                'therapeutic': {
                    'conditions': ['chronic-pain', 'anxiety', 'depression', 'ulcers', 'arthritis'],
                    'mechanisms': ['CB2 receptor agonist', 'anti-inflammatory pathways', 'neuroprotection'],
                    'dosage_threshold': '0.4%'
                },
                'sources': ['black-pepper', 'cloves', 'hops', 'oregano', 'cannabis'],
                'prevalence': 'common-secondary-terpene',
                'research_status': 'promising-clinical-data'
            },
            'humulene': {
                'name': 'Humulene',
                'chemical_name': 'α-Humulene',
                'formula': 'C15H24',
                'molecular_weight': 204.35,
                'boiling_point': 198,
                'effects': {
                    'primary': ['appetite-suppressant', 'anti-inflammatory', 'antibacterial'],
                    'secondary': ['energizing', 'focus', 'anti-tumor'],
                    'synergy': 'works well with caryophyllene'
                },
                'aroma': {
                    'primary': 'woody',
                    'secondary': ['earthy', 'spicy', 'herbal'],
                    'notes': 'subtle and grounding'
                },
                'therapeutic': {
                    'conditions': ['inflammation', 'bacterial-infections', 'appetite-control'],
                    'mechanisms': ['cyclooxygenase inhibition', 'antimicrobial activity'],
                    'dosage_threshold': '0.2%'
                },
                'sources': ['hops', 'coriander', 'cloves', 'basil', 'cannabis'],
                'prevalence': 'moderate',
                'research_status': 'early-research'
            },
            'terpinolene': {
                'name': 'Terpinolene',
                'chemical_name': 'Terpinolene',
                'formula': 'C10H16',
                'molecular_weight': 136.23,
                'boiling_point': 185,
                'effects': {
                    'primary': ['uplifting', 'energetic', 'creative'],
                    'secondary': ['anti-oxidant', 'sedating-in-large-doses', 'anti-bacterial'],
                    'synergy': 'complex biphasic effects'
                },
                'aroma': {
                    'primary': 'fresh',
                    'secondary': ['piney', 'floral', 'citrus'],
                    'notes': 'complex and bright'
                },
                'therapeutic': {
                    'conditions': ['oxidative-stress', 'bacterial-infections', 'insomnia-in-large-doses'],
                    'mechanisms': ['antioxidant activity', 'antimicrobial', 'CNS depressant'],
                    'dosage_threshold': '0.1%'
                },
                'sources': ['nutmeg', 'tea-tree', 'conifers', 'apples', 'cannabis'],
                'prevalence': 'rare-primary-terpene',
                'research_status': 'limited-studies'
            },
            'ocimene': {
                'name': 'Ocimene',
                'chemical_name': 'β-Ocimene',
                'formula': 'C10H16',
                'molecular_weight': 136.23,
                'boiling_point': 185,
                'effects': {
                    'primary': ['uplifting', 'energizing', 'decongestant'],
                    'secondary': ['anti-viral', 'anti-fungal', 'anti-bacterial'],
                    'synergy': 'enhances other terpene absorption'
                },
                'aroma': {
                    'primary': 'sweet',
                    'secondary': ['citrus', 'floral', 'woody'],
                    'notes': 'tropical and fruity'
                },
                'therapeutic': {
                    'conditions': ['congestion', 'viral-infections', 'fungal-infections'],
                    'mechanisms': ['antimicrobial activity', 'decongestant properties'],
                    'dosage_threshold': '0.1%'
                },
                'sources': ['mint', 'parsley', 'pepper', 'basil', 'orchids', 'cannabis'],
                'prevalence': 'rare',
                'research_status': 'very-limited'
            }
        }
        
        # Terpene interaction matrix
        self.terpene_interactions = {
            ('myrcene', 'limonene'): {
                'effect': 'balanced-relaxation',
                'description': 'Myrcene\'s sedating effects balanced by limonene\'s uplifting properties'
            },
            ('myrcene', 'caryophyllene'): {
                'effect': 'enhanced-pain-relief',
                'description': 'Synergistic anti-inflammatory and analgesic effects'
            },
            ('limonene', 'pinene'): {
                'effect': 'enhanced-focus',
                'description': 'Alertness and mood elevation for productive focus'
            },
            ('pinene', 'linalool'): {
                'effect': 'balanced-calm-alertness',
                'description': 'Calm focus without sedation or anxiety'
            },
            ('caryophyllene', 'humulene'): {
                'effect': 'potent-anti-inflammatory',
                'description': 'Combined CB2 activation and COX inhibition'
            },
            ('linalool', 'myrcene'): {
                'effect': 'deep-relaxation',
                'description': 'Powerful sedating and anti-anxiety combination'
            }
        }
    
    def get_terpene_profile(self, terpene_name: str) -> Optional[Dict[str, Any]]:
        """Get comprehensive profile for a single terpene"""
        terpene_key = terpene_name.lower()
        
        if terpene_key in self.terpene_database:
            profile = self.terpene_database[terpene_key].copy()
            profile['last_updated'] = datetime.now().isoformat()
            return profile
        
        return None
    
    def analyze_terpene_combination(self, terpenes: List[str], concentrations: List[float] = None) -> Dict[str, Any]:
        """Analyze effects of terpene combinations"""
        
        if not terpenes:
            return {}
        
        # Normalize terpene names
        normalized_terpenes = [t.lower() for t in terpenes]
        
        # Get individual profiles
        individual_profiles = {}
        for terpene in normalized_terpenes:
            profile = self.get_terpene_profile(terpene)
            if profile:
                individual_profiles[terpene] = profile
        
        # Analyze synergistic effects
        synergistic_effects = []
        interaction_pairs = []
        
        for i, terp1 in enumerate(normalized_terpenes):
            for j, terp2 in enumerate(normalized_terpenes[i+1:], i+1):
                pair_key = tuple(sorted([terp1, terp2]))
                if pair_key in self.terpene_interactions:
                    interaction = self.terpene_interactions[pair_key]
                    synergistic_effects.append(interaction['effect'])
                    interaction_pairs.append({
                        'terpenes': [terp1, terp2],
                        'interaction': interaction
                    })
        
        # Combine effects
        all_effects = []
        all_therapeutic_conditions = []
        all_aromas = []
        
        for terpene, profile in individual_profiles.items():
            all_effects.extend(profile['effects']['primary'])
            all_effects.extend(profile['effects']['secondary'])
            all_therapeutic_conditions.extend(profile['therapeutic']['conditions'])
            all_aromas.append(profile['aroma']['primary'])
            all_aromas.extend(profile['aroma']['secondary'])
        
        # Determine dominant effects based on concentration or occurrence
        effect_counts = {}
        for effect in all_effects:
            effect_counts[effect] = effect_counts.get(effect, 0) + 1
        
        dominant_effects = sorted(effect_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Determine primary therapeutic applications
        condition_counts = {}
        for condition in all_therapeutic_conditions:
            condition_counts[condition] = condition_counts.get(condition, 0) + 1
        
        primary_therapeutic = sorted(condition_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Create combined aroma profile
        aroma_counts = {}
        for aroma in all_aromas:
            aroma_counts[aroma] = aroma_counts.get(aroma, 0) + 1
        
        dominant_aromas = sorted(aroma_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            'terpenes_analyzed': normalized_terpenes,
            'individual_profiles': individual_profiles,
            'synergistic_interactions': interaction_pairs,
            'combined_effects': {
                'dominant_effects': [effect for effect, count in dominant_effects],
                'effect_strength': dict(dominant_effects)
            },
            'therapeutic_applications': {
                'primary_conditions': [condition for condition, count in primary_therapeutic],
                'condition_support': dict(primary_therapeutic)
            },
            'aroma_profile': {
                'dominant_aromas': [aroma for aroma, count in dominant_aromas],
                'complexity_score': len(set(all_aromas))
            },
            'recommendations': self._generate_recommendations(individual_profiles, synergistic_effects),
            'analysis_timestamp': datetime.now().isoformat()
        }
    
    def _generate_recommendations(self, profiles: Dict[str, Any], synergistic_effects: List[str]) -> Dict[str, Any]:
        """Generate usage recommendations based on terpene analysis"""
        
        recommendations = {
            'best_for': [],
            'timing': 'varies',
            'dosage_considerations': [],
            'contraindications': []
        }
        
        # Analyze dominant effect patterns
        sedating_terpenes = 0
        energizing_terpenes = 0
        therapeutic_terpenes = 0
        
        for terpene, profile in profiles.items():
            primary_effects = profile['effects']['primary']
            
            if any(effect in primary_effects for effect in ['sedating', 'relaxing', 'calming']):
                sedating_terpenes += 1
            
            if any(effect in primary_effects for effect in ['uplifting', 'energizing', 'focus']):
                energizing_terpenes += 1
            
            if any(effect in primary_effects for effect in ['anti-inflammatory', 'analgesic', 'neuroprotective']):
                therapeutic_terpenes += 1
        
        # Generate recommendations based on profile
        if sedating_terpenes > energizing_terpenes:
            recommendations['best_for'] = ['evening use', 'relaxation', 'sleep preparation']
            recommendations['timing'] = 'evening'
        elif energizing_terpenes > sedating_terpenes:
            recommendations['best_for'] = ['daytime use', 'productivity', 'creative activities']
            recommendations['timing'] = 'morning/afternoon'
        else:
            recommendations['best_for'] = ['any time', 'balanced effects', 'versatile use']
            recommendations['timing'] = 'flexible'
        
        if therapeutic_terpenes >= 2:
            recommendations['best_for'].append('therapeutic applications')
        
        # Add dosage considerations
        if 'myrcene' in profiles:
            recommendations['dosage_considerations'].append('Lower doses may be more effective due to myrcene\'s potency')
        
        if 'linalool' in profiles:
            recommendations['dosage_considerations'].append('Very small amounts of linalool can be effective')
        
        # Add contraindications
        if sedating_terpenes >= 2:
            recommendations['contraindications'].append('Avoid before driving or operating machinery')
        
        if 'humulene' in profiles:
            recommendations['contraindications'].append('May suppress appetite - consider if weight gain is desired')
        
        return recommendations
    
    def create_terpene_research_paper(self, terpene_name: str) -> Optional[ResearchPaper]:
        """Create a research paper-like summary for a terpene"""
        
        profile = self.get_terpene_profile(terpene_name)
        if not profile:
            return None
        
        try:
            title = f"Terpene Profile: {profile['name']} - Chemical Properties and Therapeutic Applications"
            
            # Build comprehensive abstract
            abstract_parts = []
            
            # Chemical information
            chem_info = f"Chemical Formula: {profile['formula']}, Molecular Weight: {profile['molecular_weight']} g/mol, Boiling Point: {profile['boiling_point']}°C"
            abstract_parts.append(chem_info)
            
            # Effects and mechanisms
            primary_effects = ', '.join(profile['effects']['primary'])
            mechanisms = ', '.join(profile['therapeutic']['mechanisms'])
            effects_info = f"Primary Effects: {primary_effects}. Mechanisms of Action: {mechanisms}"
            abstract_parts.append(effects_info)
            
            # Therapeutic applications
            conditions = ', '.join(profile['therapeutic']['conditions'])
            therapeutic_info = f"Therapeutic Applications: {conditions}"
            abstract_parts.append(therapeutic_info)
            
            # Aroma and sources
            aroma_desc = f"{profile['aroma']['primary']} with {', '.join(profile['aroma']['secondary'])} notes"
            sources = ', '.join(profile['sources'])
            sensory_info = f"Aroma Profile: {aroma_desc}. Natural Sources: {sources}"
            abstract_parts.append(sensory_info)
            
            abstract = ". ".join(abstract_parts)
            
            return ResearchPaper(
                id=f"terpene_profile_{terpene_name.lower()}",
                title=title,
                authors=["Sage Terpene Database"],
                year=datetime.now().year,
                journal="Cannabis Terpene Research Compendium",
                abstract=abstract,
                doi="",
                pubmed_id="",
                url=f"https://sage.budguide.com/terpenes/{terpene_name.lower()}",
                source="terpene_database",
                study_type="terpene-profile",
                credibility_score=7.0,  # Medium-high credibility for curated data
                relevance_score=0.0,    # Will be scored based on query
                citation_count=0
            )
            
        except Exception as e:
            logger.warning(f"Failed to create terpene research paper: {e}")
            return None
    
    def search_by_effects(self, desired_effects: List[str]) -> List[Dict[str, Any]]:
        """Find terpenes that produce desired effects"""
        
        matching_terpenes = []
        
        for terpene_name, profile in self.terpene_database.items():
            terpene_effects = profile['effects']['primary'] + profile['effects']['secondary']
            
            # Check if any desired effects match terpene effects
            effect_matches = []
            for desired in desired_effects:
                for terpene_effect in terpene_effects:
                    if desired.lower() in terpene_effect.lower() or terpene_effect.lower() in desired.lower():
                        effect_matches.append((desired, terpene_effect))
            
            if effect_matches:
                matching_terpenes.append({
                    'terpene': terpene_name,
                    'profile': profile,
                    'matched_effects': effect_matches,
                    'relevance_score': len(effect_matches) / len(desired_effects)
                })
        
        # Sort by relevance
        matching_terpenes.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return matching_terpenes
    
    def search_by_conditions(self, medical_conditions: List[str]) -> List[Dict[str, Any]]:
        """Find terpenes that may help with medical conditions"""
        
        matching_terpenes = []
        
        for terpene_name, profile in self.terpene_database.items():
            terpene_conditions = profile['therapeutic']['conditions']
            
            # Check for condition matches
            condition_matches = []
            for desired_condition in medical_conditions:
                for terpene_condition in terpene_conditions:
                    if (desired_condition.lower() in terpene_condition.lower() or 
                        terpene_condition.lower() in desired_condition.lower()):
                        condition_matches.append((desired_condition, terpene_condition))
            
            if condition_matches:
                matching_terpenes.append({
                    'terpene': terpene_name,
                    'profile': profile,
                    'matched_conditions': condition_matches,
                    'therapeutic_relevance': len(condition_matches) / len(medical_conditions)
                })
        
        # Sort by therapeutic relevance
        matching_terpenes.sort(key=lambda x: x['therapeutic_relevance'], reverse=True)
        
        return matching_terpenes
    
    def get_all_terpenes(self) -> List[str]:
        """Get list of all available terpenes"""
        return list(self.terpene_database.keys())
    
    def get_terpene_summary_stats(self) -> Dict[str, Any]:
        """Get summary statistics about the terpene database"""
        
        total_terpenes = len(self.terpene_database)
        
        # Count effects
        all_effects = []
        for profile in self.terpene_database.values():
            all_effects.extend(profile['effects']['primary'])
            all_effects.extend(profile['effects']['secondary'])
        
        unique_effects = len(set(all_effects))
        
        # Count therapeutic conditions
        all_conditions = []
        for profile in self.terpene_database.values():
            all_conditions.extend(profile['therapeutic']['conditions'])
        
        unique_conditions = len(set(all_conditions))
        
        # Count interactions
        total_interactions = len(self.terpene_interactions)
        
        return {
            'total_terpenes': total_terpenes,
            'unique_effects': unique_effects,
            'unique_therapeutic_conditions': unique_conditions,
            'documented_interactions': total_interactions,
            'database_version': '1.0',
            'last_updated': datetime.now().isoformat()
        }