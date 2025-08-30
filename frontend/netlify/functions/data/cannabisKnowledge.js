// Cannabis Knowledge Base for Premo Cannabis
// CommonJS version for Netlify Functions

const cannabisKnowledge = {
  cannabinoids: {
    thc: {
      name: 'Tetrahydrocannabinol (THC)',
      description: 'The primary psychoactive compound in cannabis. Produces the "high" sensation.',
      effects: ['euphoria', 'relaxation', 'increased appetite', 'altered perception', 'pain relief'],
      medicalUses: ['chronic pain', 'nausea', 'muscle spasms', 'insomnia', 'appetite loss'],
      onsetTime: {
        smoking: '2-10 minutes',
        edibles: '30-120 minutes',
        tinctures: '15-45 minutes'
      }
    },
    cbd: {
      name: 'Cannabidiol (CBD)',
      description: 'Non-psychoactive compound with therapeutic benefits.',
      effects: ['anxiety relief', 'anti-inflammatory', 'pain relief', 'mental clarity', 'seizure reduction'],
      medicalUses: ['anxiety', 'epilepsy', 'inflammation', 'chronic pain', 'insomnia'],
      onsetTime: {
        smoking: '2-10 minutes',
        edibles: '30-120 minutes',
        tinctures: '15-45 minutes'
      }
    },
    cbn: {
      name: 'Cannabinol (CBN)',
      description: 'Mildly psychoactive, forms when THC ages. Known for sedative effects.',
      effects: ['sedation', 'pain relief', 'anti-bacterial', 'appetite stimulation'],
      medicalUses: ['insomnia', 'pain', 'inflammation']
    },
    cbg: {
      name: 'Cannabigerol (CBG)',
      description: 'Non-psychoactive, potential neuroprotective properties.',
      effects: ['anti-inflammatory', 'anti-bacterial', 'mood enhancement'],
      medicalUses: ['glaucoma', 'inflammatory bowel disease', 'anxiety']
    }
  },

  terpenes: {
    myrcene: {
      aroma: 'Earthy, musky, herbal',
      effects: 'Sedating, relaxing, muscle relaxant',
      alsoFoundIn: 'Mangoes, hops, thyme',
      boilingPoint: '168°C (334°F)',
      strains: ['Blue Dream', 'Granddaddy Purple', 'OG Kush']
    },
    limonene: {
      aroma: 'Citrus, lemon, orange',
      effects: 'Mood elevation, stress relief, anti-anxiety',
      alsoFoundIn: 'Citrus fruits, juniper, peppermint',
      boilingPoint: '176°C (349°F)',
      strains: ['Sour Diesel', 'Super Lemon Haze', 'Jack Herer']
    },
    caryophyllene: {
      aroma: 'Peppery, spicy, woody',
      effects: 'Anti-inflammatory, pain relief, anti-anxiety',
      alsoFoundIn: 'Black pepper, cloves, cinnamon',
      boilingPoint: '160°C (320°F)',
      strains: ['GSC', 'Gorilla Glue', 'Chemdog']
    },
    pinene: {
      aroma: 'Pine, fresh, sharp',
      effects: 'Alertness, memory retention, counteracts THC effects',
      alsoFoundIn: 'Pine needles, rosemary, basil',
      boilingPoint: '155°C (311°F)',
      strains: ['Jack Herer', 'Blue Dream', 'Trainwreck']
    },
    linalool: {
      aroma: 'Floral, lavender, sweet',
      effects: 'Calming, anti-anxiety, sedative',
      alsoFoundIn: 'Lavender, coriander, birch',
      boilingPoint: '198°C (388°F)',
      strains: ['Lavender', 'LA Confidential', 'Zkittlez']
    },
    terpinolene: {
      aroma: 'Piney, floral, herbal',
      effects: 'Uplifting, antioxidant, antibacterial',
      alsoFoundIn: 'Nutmeg, tea tree, apples',
      boilingPoint: '186°C (367°F)',
      strains: ['Jack Herer', 'Ghost Train Haze', 'Dutch Treat']
    }
  },

  strainTypes: {
    indica: {
      description: 'Typically produces relaxing, sedating effects. Best for evening use.',
      effects: ['body high', 'relaxation', 'sedation', 'appetite stimulation', 'pain relief'],
      appearance: 'Short, bushy plants with broad leaves',
      bestFor: ['insomnia', 'pain', 'anxiety', 'muscle spasms', 'appetite loss']
    },
    sativa: {
      description: 'Generally provides energizing, uplifting effects. Good for daytime use.',
      effects: ['cerebral high', 'energy', 'creativity', 'focus', 'euphoria'],
      appearance: 'Tall plants with narrow leaves',
      bestFor: ['depression', 'fatigue', 'ADHD', 'mood disorders', 'social activities']
    },
    hybrid: {
      description: 'Combination of indica and sativa. Effects vary based on dominant strain.',
      effects: ['balanced', 'versatile', 'customizable experience'],
      appearance: 'Varies based on genetics',
      bestFor: ['versatile use', 'balanced effects', 'specific combinations of symptoms']
    }
  },

  consumptionMethods: {
    smoking: {
      onset: '2-10 minutes',
      duration: '1-3 hours',
      bioavailability: '10-35%',
      pros: ['fast onset', 'easy dose control', 'traditional method'],
      cons: ['lung irritation', 'smell', 'shorter duration']
    },
    vaping: {
      onset: '2-10 minutes',
      duration: '2-4 hours',
      bioavailability: '30-50%',
      pros: ['fast onset', 'less harmful than smoking', 'discrete'],
      cons: ['requires device', 'battery dependent', 'potential additives']
    },
    edibles: {
      onset: '30-120 minutes',
      duration: '4-8 hours',
      bioavailability: '4-20%',
      pros: ['long lasting', 'discrete', 'no lung irritation'],
      cons: ['delayed onset', 'harder to dose', 'can be too intense']
    },
    tinctures: {
      onset: '15-45 minutes',
      duration: '4-6 hours',
      bioavailability: '12-35%',
      pros: ['precise dosing', 'discrete', 'versatile use'],
      cons: ['alcohol taste', 'requires holding under tongue']
    },
    topicals: {
      onset: '15-30 minutes',
      duration: '2-4 hours',
      bioavailability: '0% (no psychoactive effects)',
      pros: ['localized relief', 'no high', 'good for skin conditions'],
      cons: ['no psychoactive effects', 'limited to surface relief']
    }
  },

  dosageGuidelines: {
    beginners: {
      flower: '0.25-0.5 grams',
      edibles: '2.5-5mg THC',
      tinctures: '2.5-5mg THC',
      vapes: '1-2 small puffs',
      advice: 'Start low and go slow. Wait at least 2 hours before taking more edibles.'
    },
    intermediate: {
      flower: '0.5-1 gram',
      edibles: '5-15mg THC',
      tinctures: '5-15mg THC',
      vapes: '2-4 puffs',
      advice: 'You know your tolerance. Adjust based on desired effects.'
    },
    experienced: {
      flower: '1+ grams',
      edibles: '15-50mg+ THC',
      tinctures: '15-50mg+ THC',
      vapes: 'As desired',
      advice: 'High tolerance users. Be mindful of diminishing returns.'
    }
  },

  medicalConditions: {
    anxiety: {
      recommendedCannabinoids: ['CBD', 'low THC'],
      recommendedTerpenes: ['linalool', 'limonene'],
      avoidance: 'High THC strains may increase anxiety',
      suggestedRatio: '2:1 or 1:1 CBD:THC'
    },
    chronicPain: {
      recommendedCannabinoids: ['THC', 'CBD', 'CBG'],
      recommendedTerpenes: ['caryophyllene', 'myrcene'],
      consumptionMethod: 'Edibles for long-lasting relief, vaping for quick onset',
      suggestedProducts: 'Indica strains, high-THC products'
    },
    insomnia: {
      recommendedCannabinoids: ['CBN', 'THC'],
      recommendedTerpenes: ['myrcene', 'linalool'],
      timing: '30-60 minutes before bed',
      suggestedProducts: 'Indica strains, edibles for all-night relief'
    },
    appetite: {
      recommendedCannabinoids: ['THC', 'CBG'],
      recommendedTerpenes: ['myrcene', 'limonene'],
      strainTypes: 'Indica or indica-dominant hybrids',
      timing: '30 minutes before meals'
    },
    inflammation: {
      recommendedCannabinoids: ['CBD', 'CBG'],
      recommendedTerpenes: ['caryophyllene', 'pinene'],
      consumptionMethod: 'Topicals for localized, systemic for widespread',
      suggestedRatio: 'High CBD products'
    }
  },

  newJerseyLaws: {
    legalAge: 21,
    possessionLimit: '1 ounce for recreational use',
    publicConsumption: 'Prohibited - private property only',
    drivingLaws: 'DUI laws apply - never drive impaired',
    homeGrowing: 'Not permitted for recreational use',
    dispensaryHours: 'Varies by location - Premo: Mon-Sat 9AM-10PM, Sun 10AM-9PM',
    purchaseLimit: '1 ounce flower or equivalent per day',
    outOfState: 'Valid ID from any state accepted',
    medicalProgram: 'Separate medical program with higher limits'
  },

  safetyGuidelines: {
    storage: [
      'Keep in original child-resistant packaging',
      'Store in cool, dry place away from light',
      'Lock up products away from children and pets',
      'Label homemade edibles clearly'
    ],
    consumption: [
      'Never drive or operate machinery while impaired',
      'Start with low doses, especially with edibles',
      'Stay hydrated',
      'Have CBD on hand to counteract too much THC',
      'Don\'t mix with alcohol or other substances'
    ],
    emergencies: {
      tooHigh: [
        'Remember: no one has died from cannabis overdose',
        'Find a calm, safe space',
        'Stay hydrated with water',
        'Try CBD to counteract THC',
        'Sleep it off if possible',
        'Call 911 if experiencing chest pain or severe symptoms'
      ]
    }
  }
};

module.exports = cannabisKnowledge;