// Premo Cannabis Company Product Catalog
// Real products and information for NJ dispensary

export interface PremoProduct {
  id: string
  name: string
  category: 'flower' | 'edibles' | 'vapes' | 'concentrates' | 'prerolls' | 'topicals'
  type: 'indica' | 'sativa' | 'hybrid' | 'cbd'
  thc: number // percentage for flower/concentrates, mg for edibles
  cbd: number
  price: number
  image?: string
  description: string
  effects: string[]
  terpenes?: string[]
  brand?: string
  inStock: boolean
}

// Sample Premo Cannabis products based on typical NJ dispensary offerings
export const premoProducts: PremoProduct[] = [
  // FLOWER PRODUCTS
  {
    id: 'fl-001',
    name: 'Blue Dream',
    category: 'flower',
    type: 'hybrid',
    thc: 22,
    cbd: 0.5,
    price: 55,
    description: 'Classic hybrid strain with balanced effects. Sweet berry aroma with hints of earthiness.',
    effects: ['relaxed', 'creative', 'euphoric', 'uplifted'],
    terpenes: ['myrcene', 'pinene', 'caryophyllene'],
    inStock: true
  },
  {
    id: 'fl-002',
    name: 'Gorilla Glue #4',
    category: 'flower',
    type: 'hybrid',
    thc: 28,
    cbd: 0.1,
    price: 65,
    description: 'Potent hybrid known for its heavy-handed euphoria and relaxation.',
    effects: ['relaxed', 'happy', 'euphoric', 'sleepy'],
    terpenes: ['caryophyllene', 'limonene', 'myrcene'],
    inStock: true
  },
  {
    id: 'fl-003',
    name: 'Sour Diesel',
    category: 'flower',
    type: 'sativa',
    thc: 24,
    cbd: 0.2,
    price: 60,
    description: 'Energizing sativa with a pungent diesel aroma. Great for daytime use.',
    effects: ['energetic', 'creative', 'focused', 'uplifted'],
    terpenes: ['limonene', 'caryophyllene', 'myrcene'],
    inStock: true
  },
  {
    id: 'fl-004',
    name: 'Northern Lights',
    category: 'flower',
    type: 'indica',
    thc: 21,
    cbd: 0.3,
    price: 50,
    description: 'Classic indica perfect for evening relaxation and sleep.',
    effects: ['relaxed', 'sleepy', 'happy', 'euphoric'],
    terpenes: ['myrcene', 'caryophyllene', 'limonene'],
    inStock: true
  },
  {
    id: 'fl-005',
    name: 'Wedding Cake',
    category: 'flower',
    type: 'indica',
    thc: 25,
    cbd: 0.1,
    price: 65,
    description: 'Premium indica with sweet, tangy flavors and potent relaxing effects.',
    effects: ['relaxed', 'euphoric', 'happy', 'sleepy'],
    terpenes: ['limonene', 'caryophyllene', 'linalool'],
    inStock: true
  },

  // EDIBLES
  {
    id: 'ed-001',
    name: 'Premo Gummies - Mixed Berry',
    category: 'edibles',
    type: 'hybrid',
    thc: 10, // mg per piece
    cbd: 0,
    price: 25,
    description: '10mg THC per gummy, 10 pieces per pack. Perfect for controlled dosing.',
    effects: ['relaxed', 'happy', 'euphoric'],
    inStock: true
  },
  {
    id: 'ed-002',
    name: 'Chocolate Bar - Dark',
    category: 'edibles',
    type: 'indica',
    thc: 100, // mg total
    cbd: 0,
    price: 35,
    description: 'Premium dark chocolate infused with 100mg THC. 10 pieces at 10mg each.',
    effects: ['relaxed', 'sleepy', 'euphoric'],
    inStock: true
  },
  {
    id: 'ed-003',
    name: 'CBD:THC Balanced Mints',
    category: 'edibles',
    type: 'cbd',
    thc: 5,
    cbd: 5,
    price: 20,
    description: 'Balanced 1:1 ratio mints for mild effects. 20 mints per tin.',
    effects: ['calm', 'focused', 'relaxed'],
    inStock: true
  },

  // VAPES
  {
    id: 'vp-001',
    name: 'Live Resin Cart - Jack Herer',
    category: 'vapes',
    type: 'sativa',
    thc: 85,
    cbd: 0,
    price: 55,
    description: '0.5g live resin cartridge. Premium extraction for full flavor.',
    effects: ['energetic', 'creative', 'focused', 'happy'],
    terpenes: ['terpinolene', 'caryophyllene', 'pinene'],
    inStock: true
  },
  {
    id: 'vp-002',
    name: 'Disposable Pen - Gelato',
    category: 'vapes',
    type: 'hybrid',
    thc: 82,
    cbd: 0,
    price: 45,
    description: '0.3g all-in-one disposable pen. Sweet, dessert-like flavor.',
    effects: ['relaxed', 'happy', 'euphoric', 'creative'],
    terpenes: ['limonene', 'caryophyllene', 'linalool'],
    inStock: true
  },

  // CONCENTRATES
  {
    id: 'cn-001',
    name: 'Live Rosin - GMO',
    category: 'concentrates',
    type: 'indica',
    thc: 78,
    cbd: 0,
    price: 80,
    description: 'Premium solventless extract. Full spectrum effects.',
    effects: ['relaxed', 'sleepy', 'euphoric', 'happy'],
    terpenes: ['myrcene', 'limonene', 'caryophyllene'],
    inStock: true
  },
  {
    id: 'cn-002',
    name: 'Shatter - Green Crack',
    category: 'concentrates',
    type: 'sativa',
    thc: 88,
    cbd: 0,
    price: 60,
    description: 'Glass-like consistency concentrate. Energizing daytime effects.',
    effects: ['energetic', 'focused', 'creative', 'uplifted'],
    terpenes: ['myrcene', 'caryophyllene', 'pinene'],
    inStock: true
  },

  // PREROLLS
  {
    id: 'pr-001',
    name: 'Premo Premium Preroll - OG Kush',
    category: 'prerolls',
    type: 'indica',
    thc: 23,
    cbd: 0,
    price: 15,
    description: '1g premium flower preroll. Classic OG effects.',
    effects: ['relaxed', 'happy', 'euphoric', 'sleepy'],
    terpenes: ['myrcene', 'limonene', 'caryophyllene'],
    inStock: true
  },
  {
    id: 'pr-002',
    name: 'Mini Prerolls 5-Pack',
    category: 'prerolls',
    type: 'hybrid',
    thc: 20,
    cbd: 0,
    price: 35,
    description: 'Five 0.5g prerolls. Perfect for sharing or controlled dosing.',
    effects: ['relaxed', 'happy', 'social', 'creative'],
    inStock: true
  }
]

// Helper function to get products by effect
export function getProductsByEffect(effect: string): PremoProduct[] {
  return premoProducts.filter(product => 
    product.effects.includes(effect.toLowerCase())
  )
}

// Helper function to get products by category
export function getProductsByCategory(category: string): PremoProduct[] {
  return premoProducts.filter(product => 
    product.category === category
  )
}

// Helper function to recommend products based on user needs
export function recommendProducts(needs: string): PremoProduct[] {
  const needsLower = needs.toLowerCase()
  
  // Sleep-related keywords
  if (needsLower.includes('sleep') || needsLower.includes('insomnia')) {
    return premoProducts.filter(p => 
      p.type === 'indica' || p.effects.includes('sleepy')
    ).slice(0, 3)
  }
  
  // Energy/focus keywords
  if (needsLower.includes('energy') || needsLower.includes('focus') || needsLower.includes('creative')) {
    return premoProducts.filter(p => 
      p.type === 'sativa' || p.effects.includes('energetic') || p.effects.includes('focused')
    ).slice(0, 3)
  }
  
  // Anxiety/stress keywords
  if (needsLower.includes('anxiety') || needsLower.includes('stress') || needsLower.includes('relax')) {
    return premoProducts.filter(p => 
      p.cbd > 0 || p.effects.includes('relaxed') || p.effects.includes('calm')
    ).slice(0, 3)
  }
  
  // Pain keywords
  if (needsLower.includes('pain')) {
    return premoProducts.filter(p => 
      p.type === 'indica' || p.thc > 20 || p.cbd > 0
    ).slice(0, 3)
  }
  
  // Beginner keywords
  if (needsLower.includes('beginner') || needsLower.includes('first time') || needsLower.includes('new')) {
    return premoProducts.filter(p => 
      (p.category === 'edibles' && p.thc <= 10) || 
      (p.category === 'flower' && p.thc <= 20) ||
      p.cbd > 0
    ).slice(0, 3)
  }
  
  // Default: return variety
  return [
    premoProducts.find(p => p.type === 'indica'),
    premoProducts.find(p => p.type === 'sativa'),
    premoProducts.find(p => p.type === 'hybrid')
  ].filter(Boolean) as PremoProduct[]
}