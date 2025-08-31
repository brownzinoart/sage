const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ZenLeaf Neptune product data (subset for Netlify function)
const zenleafProducts = [
  {
    id: "zln_001",
    name: "Mag Landrace",
    brand: "Verano Reserve",
    category: "flower",
    strain_type: "indica",
    thc_percentage: 26.8,
    cbd_percentage: 0.4,
    dominant_terpene: "myrcene",
    effects: ["deeply-relaxing", "sedating", "pain-relief", "sleep-aid", "body-high"],
    price: 65.00,
    size: "3.5g (eighth)",
    description: "Premium indica landrace strain with deep relaxation effects."
  },
  {
    id: "zln_002", 
    name: "Super Lemon Haze",
    brand: "(the) Essence",
    category: "flower",
    strain_type: "sativa",
    thc_percentage: 22.3,
    cbd_percentage: 0.2,
    dominant_terpene: "limonene",
    effects: ["energizing", "creative", "uplifting", "focused", "euphoric"],
    price: 52.00,
    size: "3.5g (eighth)",
    description: "Energizing sativa with bright citrus flavors."
  },
  {
    id: "zln_003",
    name: "Wedding Cake", 
    brand: "Verano Reserve",
    category: "flower",
    strain_type: "hybrid",
    thc_percentage: 28.4,
    cbd_percentage: 0.3,
    dominant_terpene: "caryophyllene",
    effects: ["balanced", "euphoric", "relaxed", "happy", "creative"],
    price: 68.00,
    size: "3.5g (eighth)",
    description: "Premium hybrid with sweet vanilla notes."
  },
  {
    id: "zln_006",
    name: "Berry Bliss Gummies",
    brand: "Encore", 
    category: "edibles",
    strain_type: "hybrid",
    thc_mg: 10,
    cbd_mg: 2,
    effects: ["balanced", "euphoric", "relaxed", "happy", "social"],
    price: 32.00,
    size: "10 count (100mg total)",
    description: "Delicious berry-flavored gummies with balanced hybrid effects."
  }
];

// Cannabis knowledge base for ZenLeaf Neptune
const CANNABIS_KNOWLEDGE = `
ZEN LEAF NEPTUNE CANNABIS KNOWLEDGE:

LOCATION: 2100 NJ-66, Neptune City, NJ • (908) 676-5936
HOURS: Mon 10AM-9PM, Tue 9AM-9PM, Wed-Sun 8AM-10PM

STRAIN EFFECTS:
• INDICA: Body relaxation, sedation, sleep aid, pain relief, evening use
• SATIVA: Mental energy, creativity, focus, mood elevation, daytime use  
• HYBRID: Balanced mind-body effects, versatile timing

THC POTENCY:
• 15-20%: Moderate effects, good for casual users
• 20-25%: Standard recreational potency 
• 25%+: High potency, experienced users only

TERPENES:
• MYRCENE: Sedating, muscle relaxant, sleep aid
• LIMONENE: Mood boost, stress relief, citrus aroma
• CARYOPHYLLENE: Pain relief, anti-inflammatory
• LINALOOL: Calming, anxiety reduction

PRODUCT TYPES:
• FLOWER: $52-68/eighth, immediate effects, 1-3 hours
• EDIBLES: $32, 30-120min onset, 4-8 hour duration
• VAPES: $45-62, immediate onset, discreet use
`;

// Search products based on query intent
function searchProducts(query, limit = 3) {
  const results = [];
  const queryLower = query.toLowerCase();
  
  // Intent mapping for cannabis effects
  const intentMapping = {
    'sleep': ['indica', 'myrcene', 'linalool', 'sedating', 'relaxing'],
    'pain': ['indica', 'hybrid', 'caryophyllene', 'pain-relief'],
    'energy': ['sativa', 'limonene', 'energizing', 'uplifting'],
    'anxiety': ['hybrid', 'cbd', 'linalool', 'calming'],
    'focus': ['sativa', 'pinene', 'focused', 'creative'],
    'relax': ['indica', 'hybrid', 'myrcene', 'relaxed']
  };
  
  for (const product of zenleafProducts) {
    let score = 0;
    
    // Direct name matching
    if (queryLower.includes(product.name.toLowerCase())) {
      score += 15;
    }
    
    // Intent-based matching
    for (const [intent, keywords] of Object.entries(intentMapping)) {
      if (queryLower.includes(intent)) {
        // Check strain type
        if (keywords.includes(product.strain_type)) score += 30;
        // Check dominant terpene  
        if (keywords.includes(product.dominant_terpene)) score += 25;
        // Check effects
        const hasEffect = product.effects.some(effect => 
          keywords.some(keyword => effect.includes(keyword))
        );
        if (hasEffect) score += 20;
        break;
      }
    }
    
    // Category matching
    if (queryLower.includes('flower') && product.category === 'flower') score += 10;
    if (queryLower.includes('edible') && product.category === 'edibles') score += 10;
    
    if (score > 0) {
      results.push({ ...product, match_score: score });
    }
  }
  
  // Sort by score and return top results
  return results.sort((a, b) => b.match_score - a.match_score).slice(0, limit);
}

// Generate AI explanation using Gemini
async function generateExplanation(userQuery, experienceLevel = 'casual') {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    const prompt = `${CANNABIS_KNOWLEDGE}

User Experience Level: ${experienceLevel}
User Query: "${userQuery}"

As a cannabis consultant for Zen Leaf Neptune, provide a helpful response about cannabis products and recommendations. 

Format your response with these exact sections:

🌿 **Quick Answer**
• 1-2 sentences about strain type recommendation (indica/sativa/hybrid)  
• Include THC potency guidance for their experience level

🧬 **Science & Effects**
• Key cannabinoids (THC, CBD, terpenes) relevant to their needs
• Expected timeline and duration of effects
• Why this approach works for their specific request

💡 **How to Use** 
• Consumption method recommendations
• Dosing guidance by experience level  
• Best timing for desired effects

⚠️ **Important Notes**
• NJ legal compliance (21+ adult use)
• Safety considerations
• Start low guidance for new users

Keep response under 200 words total. Be direct and actionable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().strip();
    
  } catch (error) {
    console.error('Gemini API error:', error);
    return generateFallbackExplanation(userQuery);
  }
}

// Fallback explanation when Gemini fails
function generateFallbackExplanation(userQuery) {
  const query = userQuery.toLowerCase();
  
  if (query.includes('sleep') || query.includes('insomnia')) {
    return `🌿 **Quick Answer**
• Indica strains with myrcene terpene are ideal for sleep issues
• Look for 20-25% THC for effective nighttime relief

🧬 **Science & Effects** 
• Myrcene terpene promotes sedation and muscle relaxation
• Effects typically begin within 5-15 minutes, lasting 2-4 hours
• THC converts to CBN over time, enhancing sleep properties

💡 **How to Use**
• Consume 1-2 hours before desired bedtime
• Start with small amounts - cannabis affects sleep architecture
• Flower or tinctures work well for sleep applications

⚠️ **Important Notes**
• NJ legal compliance: 21+ adult use only
• May cause morning grogginess if used too close to wake time
• Consult budtender for personalized recommendations`;
  }
  
  return `I can help you find the right cannabis products for your needs. Let me search our ZenLeaf Neptune selection for you.`;
}

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { user_query, experience_level = 'casual' } = JSON.parse(event.body || '{}');
    
    if (!user_query) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'user_query is required' })
      };
    }

    // Generate AI explanation
    const explanation = await generateExplanation(user_query, experience_level);
    
    // Search matching products
    const products = searchProducts(user_query, 3);

    // Transform products to expected format
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: `$${product.price}`,
      category: product.strain_type ? 
        product.strain_type.charAt(0).toUpperCase() + product.strain_type.slice(1) : 
        'Cannabis',
      thc_percentage: product.thc_percentage,
      cbd_percentage: product.cbd_percentage,
      dominant_terpene: product.dominant_terpene,
      effects: product.effects,
      match_score: product.match_score,
      strain_type: product.strain_type,
      product_type: product.category
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        explanation,
        products: transformedProducts,
        educational_resources: {
          studies: [],
          papers: []
        },
        educational_summary: {
          key_findings: [],
          research_confidence: 'medium'
        }
      })
    };

  } catch (error) {
    console.error('Sage function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};