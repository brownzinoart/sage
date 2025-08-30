// Premo Cannabis Company Product Catalog
// CommonJS version for Netlify Functions

const premoProducts = [
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
    name: 'Northern Lights',
    category: 'flower',
    type: 'indica',
    thc: 21,
    cbd: 0.3,
    price: 50,
    description: 'Pure indica strain famous for its resinous buds and fast flowering.',
    effects: ['relaxed', 'sleepy', 'happy', 'euphoric'],
    terpenes: ['myrcene', 'caryophyllene', 'limonene'],
    inStock: true
  },
  {
    id: 'fl-004',
    name: 'Sour Diesel',
    category: 'flower',
    type: 'sativa',
    thc: 24,
    cbd: 0.2,
    price: 60,
    description: 'Energizing sativa with a pungent diesel-like aroma.',
    effects: ['energetic', 'happy', 'uplifted', 'creative'],
    terpenes: ['limonene', 'caryophyllene', 'myrcene'],
    inStock: true
  },
  {
    id: 'fl-005',
    name: 'Wedding Cake',
    category: 'flower',
    type: 'hybrid',
    thc: 25,
    cbd: 0.1,
    price: 65,
    description: 'Sweet and tangy with earthy pepper undertones.',
    effects: ['relaxed', 'euphoric', 'happy', 'uplifted'],
    terpenes: ['limonene', 'caryophyllene', 'linalool'],
    inStock: true
  },

  // EDIBLES
  {
    id: 'ed-001',
    name: 'Premo Gummies - Mixed Berry',
    category: 'edibles',
    type: 'hybrid',
    thc: 10, // per piece
    cbd: 0,
    price: 25,
    description: '10mg THC per gummy, 10 pieces per pack. Lab-tested for potency.',
    effects: ['relaxed', 'happy', 'euphoric'],
    inStock: true
  },
  {
    id: 'ed-002',
    name: 'Dark Chocolate Bar',
    category: 'edibles',
    type: 'indica',
    thc: 100, // total
    cbd: 0,
    price: 35,
    description: '100mg THC total, 10 pieces. Rich dark chocolate infused with indica extract.',
    effects: ['relaxed', 'sleepy', 'happy'],
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
    description: '5mg THC / 5mg CBD per mint. Perfect for anxiety relief without strong high.',
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
    description: '0.5g live resin cartridge. Energizing sativa for daytime use.',
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
    price: 40,
    description: '0.3g disposable vape pen. Sweet and creamy flavor profile.',
    effects: ['relaxed', 'euphoric', 'creative'],
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
    description: 'Solventless extract with full terpene profile. Heavy indica effects.',
    effects: ['relaxed', 'sleepy', 'hungry'],
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
    price: 70,
    description: 'Glass-like concentrate with energizing sativa effects.',
    effects: ['energetic', 'focused', 'uplifted'],
    terpenes: ['myrcene', 'caryophyllene', 'ocimene'],
    inStock: true
  },

  // PREROLLS
  {
    id: 'pr-001',
    name: 'Indica Preroll Pack',
    category: 'prerolls',
    type: 'indica',
    thc: 20,
    cbd: 0.5,
    price: 15,
    description: '3x 0.5g prerolls. Perfect for evening relaxation.',
    effects: ['relaxed', 'sleepy', 'happy'],
    inStock: true
  },
  {
    id: 'pr-002',
    name: 'Sativa Morning Joint',
    category: 'prerolls',
    type: 'sativa',
    thc: 22,
    cbd: 0.2,
    price: 12,
    description: '1g preroll of premium sativa flower.',
    effects: ['energetic', 'creative', 'focused'],
    inStock: true
  }
];

module.exports = premoProducts;