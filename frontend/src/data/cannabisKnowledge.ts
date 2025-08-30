// Cannabis Knowledge Base for NJ Legal Market
// Educational content about THC, CBD, terpenes, and cannabis science

export interface CannabinoidInfo {
  name: string
  abbreviation: string
  description: string
  effects: string[]
  medicalBenefits: string[]
  legalStatus: string
}

export interface TerpeneInfo {
  name: string
  aroma: string
  effects: string[]
  alsoFoundIn: string[]
  boilingPoint: string
}

export interface StrainInfo {
  type: 'indica' | 'sativa' | 'hybrid'
  characteristics: string[]
  bestFor: string[]
  typicalTime: string
}

// Cannabinoid Information
export const cannabinoids: CannabinoidInfo[] = [
  {
    name: 'Tetrahydrocannabinol',
    abbreviation: 'THC',
    description: 'The primary psychoactive compound in cannabis. Binds to CB1 receptors in the brain.',
    effects: ['euphoria', 'relaxation', 'altered perception', 'increased appetite', 'pain relief'],
    medicalBenefits: ['pain management', 'nausea reduction', 'appetite stimulation', 'muscle spasm relief'],
    legalStatus: 'Legal for adults 21+ in NJ with purchase limits'
  },
  {
    name: 'Cannabidiol',
    abbreviation: 'CBD',
    description: 'Non-psychoactive compound with therapeutic benefits. Modulates THC effects.',
    effects: ['relaxation', 'anxiety reduction', 'anti-inflammatory', 'mental clarity'],
    medicalBenefits: ['anxiety relief', 'seizure reduction', 'inflammation control', 'neuroprotection'],
    legalStatus: 'Federally legal when derived from hemp (<0.3% THC)'
  },
  {
    name: 'Cannabinol',
    abbreviation: 'CBN',
    description: 'Mildly psychoactive cannabinoid formed when THC ages. Known for sedative effects.',
    effects: ['sedation', 'relaxation', 'mild psychoactivity'],
    medicalBenefits: ['sleep aid', 'pain relief', 'anti-bacterial', 'appetite stimulation'],
    legalStatus: 'Legal in NJ as cannabis derivative'
  },
  {
    name: 'Cannabigerol',
    abbreviation: 'CBG',
    description: 'Non-psychoactive precursor to other cannabinoids. Potential neuroprotective properties.',
    effects: ['focus', 'mood enhancement', 'anti-inflammatory'],
    medicalBenefits: ['glaucoma treatment', 'inflammatory bowel disease', 'Huntingtons disease', 'bacterial infections'],
    legalStatus: 'Legal in NJ as cannabis derivative'
  },
  {
    name: 'Cannabichromene',
    abbreviation: 'CBC',
    description: 'Non-psychoactive cannabinoid that may enhance the effects of other cannabinoids.',
    effects: ['mood enhancement', 'anti-inflammatory', 'neuroprotective'],
    medicalBenefits: ['depression management', 'pain relief', 'acne treatment', 'brain health'],
    legalStatus: 'Legal in NJ as cannabis derivative'
  }
]

// Terpene Information
export const terpenes: TerpeneInfo[] = [
  {
    name: 'Myrcene',
    aroma: 'Earthy, musky, fruity',
    effects: ['sedating', 'relaxing', 'muscle relaxant'],
    alsoFoundIn: ['mango', 'hops', 'thyme', 'lemongrass'],
    boilingPoint: '334°F'
  },
  {
    name: 'Limonene',
    aroma: 'Citrus, lemon, orange',
    effects: ['mood elevation', 'stress relief', 'antibacterial'],
    alsoFoundIn: ['citrus fruits', 'rosemary', 'juniper', 'peppermint'],
    boilingPoint: '348°F'
  },
  {
    name: 'Caryophyllene',
    aroma: 'Spicy, peppery, woody',
    effects: ['anti-inflammatory', 'pain relief', 'anxiety reduction'],
    alsoFoundIn: ['black pepper', 'cloves', 'cinnamon', 'oregano'],
    boilingPoint: '320°F'
  },
  {
    name: 'Linalool',
    aroma: 'Floral, lavender, sweet',
    effects: ['calming', 'anti-anxiety', 'sedative'],
    alsoFoundIn: ['lavender', 'mint', 'cinnamon', 'birch'],
    boilingPoint: '388°F'
  },
  {
    name: 'Pinene',
    aroma: 'Pine, forest, sharp',
    effects: ['alertness', 'memory retention', 'counteracts THC'],
    alsoFoundIn: ['pine needles', 'rosemary', 'basil', 'parsley'],
    boilingPoint: '311°F'
  },
  {
    name: 'Terpinolene',
    aroma: 'Fruity, floral, herbal',
    effects: ['uplifting', 'creative', 'antibacterial'],
    alsoFoundIn: ['nutmeg', 'tea tree', 'conifers', 'apples'],
    boilingPoint: '366°F'
  },
  {
    name: 'Humulene',
    aroma: 'Hoppy, woody, earthy',
    effects: ['appetite suppressant', 'anti-inflammatory', 'antibacterial'],
    alsoFoundIn: ['hops', 'coriander', 'cloves', 'basil'],
    boilingPoint: '222°F'
  }
]

// Strain Type Information
export const strainTypes: StrainInfo[] = [
  {
    type: 'indica',
    characteristics: [
      'Body-focused effects',
      'Deep relaxation',
      'Sedating qualities',
      'Muscle tension relief',
      'Couch-lock potential'
    ],
    bestFor: [
      'Evening/nighttime use',
      'Sleep issues',
      'Pain relief',
      'Anxiety reduction',
      'Muscle spasms'
    ],
    typicalTime: 'Evening/Night'
  },
  {
    type: 'sativa',
    characteristics: [
      'Mind-focused effects',
      'Energizing qualities',
      'Increased creativity',
      'Social enhancement',
      'Cerebral stimulation'
    ],
    bestFor: [
      'Daytime use',
      'Depression',
      'Focus and productivity',
      'Social activities',
      'Creative projects'
    ],
    typicalTime: 'Morning/Daytime'
  },
  {
    type: 'hybrid',
    characteristics: [
      'Balanced effects',
      'Versatile use',
      'Can lean indica or sativa',
      'Customizable experience',
      'Wide effect range'
    ],
    bestFor: [
      'Anytime use',
      'Balanced relief',
      'Mood management',
      'Flexible scheduling',
      'First-time users'
    ],
    typicalTime: 'Anytime'
  }
]

// NJ Cannabis Laws and Regulations
export const njCannabisLaws = {
  ageRequirement: 21,
  possessionLimit: '6 ounces of cannabis flower',
  purchaseLimit: '1 ounce per day',
  publicConsumption: 'Prohibited - private property only',
  drivingUnderInfluence: 'Illegal - DUI laws apply',
  workplaceRights: 'Employers may maintain drug-free workplace policies',
  homeCultivation: 'Currently not permitted for recreational use',
  medicalProgram: 'Separate medical marijuana program with different limits',
  dispensaryHours: 'Varies by location - Premo: Mon-Sat 9AM-10PM, Sun 10AM-9PM',
  taxation: '6.625% state sales tax + up to 2% local tax'
}

// Dosage Guidelines for New Users
export const dosageGuidelines = {
  flower: {
    beginner: '0.25-0.5 grams',
    intermediate: '0.5-1 gram',
    experienced: '1+ grams',
    note: 'Start low, wait 15-30 minutes between doses'
  },
  edibles: {
    beginner: '2.5-5mg THC',
    intermediate: '5-10mg THC',
    experienced: '10-20mg+ THC',
    note: 'Effects take 30-120 minutes to onset, last 4-8 hours'
  },
  vapes: {
    beginner: '1-2 small puffs',
    intermediate: '2-4 puffs',
    experienced: 'As desired',
    note: 'Effects felt within minutes, last 1-3 hours'
  },
  concentrates: {
    beginner: 'Not recommended',
    intermediate: 'Rice grain sized dose',
    experienced: 'As tolerated',
    note: 'Very potent - start extremely small'
  }
}

// Common Effects and Their Meanings
export const effectsGlossary = {
  euphoric: 'Intense happiness and well-being',
  relaxed: 'Physical and mental calmness',
  energetic: 'Increased energy and motivation',
  creative: 'Enhanced creativity and divergent thinking',
  focused: 'Improved concentration and attention',
  sleepy: 'Sedation and drowsiness',
  hungry: 'Increased appetite (munchies)',
  giggly: 'Increased tendency to laugh',
  uplifted: 'Mood elevation and positivity',
  tingly: 'Physical sensations throughout body',
  aroused: 'Enhanced sensory experiences',
  talkative: 'Increased sociability and conversation'
}

// Method of Consumption Information
export const consumptionMethods = {
  smoking: {
    onset: '1-10 minutes',
    duration: '1-3 hours',
    bioavailability: '10-35%',
    pros: ['Fast onset', 'Easy dose control', 'Traditional method'],
    cons: ['Lung irritation', 'Smell', 'Not discreet']
  },
  vaping: {
    onset: '1-10 minutes',
    duration: '1-3 hours',
    bioavailability: '30-50%',
    pros: ['Fast onset', 'Less harsh than smoking', 'More discreet'],
    cons: ['Battery dependent', 'Initial investment', 'Cartridge quality varies']
  },
  edibles: {
    onset: '30-120 minutes',
    duration: '4-8 hours',
    bioavailability: '4-20%',
    pros: ['Long lasting', 'Discreet', 'No lung irritation'],
    cons: ['Delayed onset', 'Easy to overconsume', 'Harder to control dose']
  },
  tinctures: {
    onset: '15-45 minutes',
    duration: '2-4 hours',
    bioavailability: '20-30%',
    pros: ['Precise dosing', 'Discreet', 'Versatile use'],
    cons: ['Alcohol taste', 'More expensive', 'May stain']
  },
  topicals: {
    onset: '15-30 minutes',
    duration: '1-4 hours',
    bioavailability: 'Localized only',
    pros: ['No psychoactive effects', 'Targeted relief', 'Easy application'],
    cons: ['Limited to external use', 'More expensive', 'Results vary']
  }
}

// Safety and Harm Reduction
export const safetyTips = [
  'Start with a low dose and go slow',
  'Never drive or operate machinery while impaired',
  'Keep products away from children and pets',
  'Store in a cool, dry place away from light',
  'Don\'t mix with alcohol or other substances',
  'Stay hydrated and have snacks available',
  'Use in a safe, comfortable environment',
  'Have CBD on hand to counteract THC if needed',
  'Know your source - buy from licensed dispensaries only',
  'Check expiration dates and lab testing results'
]

// Helper function to get relevant education based on user query
export function getRelevantEducation(query: string): any {
  const queryLower = query.toLowerCase()
  const education: any = {
    cannabinoids: [],
    terpenes: [],
    strainType: null,
    dosage: null,
    method: null,
    safety: []
  }
  
  // Check for cannabinoid mentions
  if (queryLower.includes('thc')) {
    education.cannabinoids.push(cannabinoids.find(c => c.abbreviation === 'THC'))
  }
  if (queryLower.includes('cbd')) {
    education.cannabinoids.push(cannabinoids.find(c => c.abbreviation === 'CBD'))
  }
  
  // Check for effect keywords
  if (queryLower.includes('sleep') || queryLower.includes('relax')) {
    education.terpenes.push(terpenes.find(t => t.name === 'Myrcene'))
    education.terpenes.push(terpenes.find(t => t.name === 'Linalool'))
    education.strainType = strainTypes.find(s => s.type === 'indica')
  }
  
  if (queryLower.includes('energy') || queryLower.includes('focus')) {
    education.terpenes.push(terpenes.find(t => t.name === 'Limonene'))
    education.terpenes.push(terpenes.find(t => t.name === 'Pinene'))
    education.strainType = strainTypes.find(s => s.type === 'sativa')
  }
  
  // Check for beginner keywords
  if (queryLower.includes('beginner') || queryLower.includes('first time') || queryLower.includes('new')) {
    education.dosage = dosageGuidelines
    education.safety = safetyTips.slice(0, 5)
  }
  
  // Check for consumption method mentions
  if (queryLower.includes('edible')) {
    education.method = consumptionMethods.edibles
    education.dosage = dosageGuidelines.edibles
  }
  if (queryLower.includes('vape') || queryLower.includes('cart')) {
    education.method = consumptionMethods.vaping
    education.dosage = dosageGuidelines.vapes
  }
  if (queryLower.includes('flower') || queryLower.includes('smoke')) {
    education.method = consumptionMethods.smoking
    education.dosage = dosageGuidelines.flower
  }
  
  return education
}