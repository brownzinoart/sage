// LLM selection: prefer OpenAI if OPENAI_API_KEY is present; otherwise fallback to Gemini
const useOpenAI = !!process.env.OPENAI_API_KEY;
let GoogleGenerativeAI;
let genAI;
if (!useOpenAI) {
  try {
    GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (e) {
    // Gemini not available; will rely on fallback text if OpenAI also missing
  }
}

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

// ZenLeaf Neptune CANNABIS knowledge base (NOT HEMP)
const CANNABIS_KNOWLEDGE = `
ZEN LEAF NEPTUNE - NEW JERSEY'S PREMIER CANNABIS DISPENSARY

LOCATION: 2100 NJ-66, Neptune City, NJ • (908) 676-5936
ADULT USE RECREATIONAL CANNABIS • 21+ ONLY
HOURS: Mon 10AM-9PM, Tue 9AM-9PM, Wed-Sun 8AM-10PM

IMPORTANT: You are a cannabis consultant for ZenLeaf Neptune dispensary. Focus EXCLUSIVELY on cannabis (THC) products and education, NOT hemp or CBD-only products. This is a legal New Jersey cannabis dispensary serving adult recreational customers.

CANNABIS STRAIN EFFECTS:
• INDICA: Deep body relaxation, sedation, sleep aid, pain relief, evening/nighttime use
• SATIVA: Mental energy, creativity, focus, mood elevation, daytime/social use  
• HYBRID: Balanced mind-body effects, versatile for any time of day

THC POTENCY GUIDANCE:
• BEGINNER (10-18% THC): New to cannabis, start low and go slow
• CASUAL (18-25% THC): Some experience, standard recreational potency 
• EXPERIENCED (25%+ THC): High tolerance, premium potency strains

KEY CANNABIS TERPENES:
• MYRCENE: Sedating, muscle relaxant, couch-lock, sleep aid (indica dominant)
• LIMONENE: Mood elevation, stress relief, citrus aroma, energy (sativa common)
• CARYOPHYLLENE: Pain relief, anti-inflammatory, spicy aroma
• LINALOOL: Calming, anxiety reduction, lavender scent
• PINENE: Alertness, memory, focus, pine aroma

ZENLEAF PRODUCT CATEGORIES:
• PREMIUM FLOWER: $52-68/eighth, immediate effects, 1-3 hours, smoking/vaping
• GUMMIES: $32, precise 10mg doses, 30-120min onset, 4-8 hour duration
• VAPE CARTRIDGES: $45-62, immediate onset, discreet, portable
• CONCENTRATES: $65-78, high potency 70%+ THC, intense effects
• TINCTURES: $58, sublingual, 15-45min onset, precise dosing
• PRE-ROLLS: $18-24, convenient, ready-to-use

DISPENSARY BRANDS:
• VERANO RESERVE: Premium craft cannabis, highest quality
• (THE) ESSENCE: Reliable, consistent, great value  
• ON THE ROCKS: Premium vape products
• ENCORE: Precisely dosed edibles
• SAVVY: Wellness-focused tinctures and topicals
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
    'relax': ['indica', 'hybrid', 'myrcene', 'relaxed'],
    'social': ['hybrid', 'sativa', 'euphoric', 'happy', 'social'],
    'wedding': ['hybrid', 'sativa', 'euphoric', 'happy', 'social'],
    'event': ['hybrid', 'sativa', 'euphoric', 'happy', 'social'],
    'party': ['hybrid', 'sativa', 'euphoric', 'happy', 'social'],
    'nervous': ['hybrid', 'cbd', 'linalool', 'calming'],
    'stress': ['indica', 'hybrid', 'myrcene', 'relaxed', 'calming']
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

// Generate AI explanation using OpenAI Responses API (preferred) or Gemini fallback
async function generateExplanation(userQuery, experienceLevel = 'casual') {
  const prompt = `${CANNABIS_KNOWLEDGE}

User Experience Level: ${experienceLevel}
User Query: "${userQuery}"

You are ZenLeaf Neptune's expert cannabis consultant. Provide premium dispensary-level guidance about our cannabis products and strains. Focus EXCLUSIVELY on cannabis (THC products), NOT hemp or CBD-only products. Do NOT recommend hemp-only or CBD-only products.

Format your response with these exact sections:

🎯 **Your Cannabis Options at ZenLeaf**
• Specific strain type recommendations (indica/sativa/hybrid) with THC percentages
• Why these strains work for their specific needs  

🧬 **Cannabis Science & Effects**
• THC and terpene profiles relevant to their request
• Expected onset times and duration of effects
• Scientific backing for strain selection

💡 **Consumption & Dosing**
• Best consumption methods (flower, edibles, vapes)
• Precise dosing guidance for their experience level
• Optimal timing for desired effects

⚠️ **ZenLeaf Safety & Compliance**
• New Jersey 21+ adult use legal requirements
• "Start low, go slow" guidance for new users
• Visit our expert budtenders for personalized selection

Keep response under 200 words. Emphasize ZenLeaf Neptune as New Jersey's premier cannabis dispensary. Be professional and educational.`;

  if (useOpenAI && process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'o4-mini',
          reasoning: { effort: 'medium' },
          input: prompt,
          max_output_tokens: 512,
          temperature: 0.7
        })
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('OpenAI error:', res.status, text);
        throw new Error(`OpenAI ${res.status}`);
      }
      const data = await res.json();
      const text = (data?.output?.[0]?.content?.[0]?.text) || data?.output_text || '';
      if (text) return text.trim();
    } catch (e) {
      console.error('OpenAI API error:', e);
      // fall through to Gemini or fallback
    }
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini API error:', error);
    }
  }

  return generateFallbackExplanation(userQuery);
}

// Cannabis-focused fallback when Gemini fails
function generateFallbackExplanation(userQuery) {
  const query = userQuery.toLowerCase();
  
  if (query.includes('never smoked') || query.includes('first time') || query.includes('beginner')) {
    return `🎯 **Your Cannabis Options at ZenLeaf**
• Start with indica-dominant hybrids (15-18% THC) for gentle relaxation
• Our budtenders recommend Northern Lights or Blue Dream for beginners
• ZenLeaf's premium quality ensures consistent, safe experience

🧬 **Cannabis Science & Effects**
• Lower THC percentages provide mild, manageable effects
• Indica strains offer body relaxation without overwhelming psychoactivity  
• Effects last 1-3 hours when smoked, 4-6 hours with edibles

💡 **Consumption & Dosing**
• Start with 1-2 small puffs if smoking flower
• Wait 15 minutes between doses to gauge effects
• Consider 2.5mg edibles as alternative option

⚠️ **ZenLeaf Safety & Compliance**
• New Jersey 21+ adult use - bring valid ID
• Our expert budtenders provide personalized guidance
• Visit ZenLeaf Neptune for premium cannabis selection`;
  }
  
  if (query.includes('wedding') || query.includes('social') || query.includes('event') || query.includes('nervous') || query.includes('party')) {
    return `🎯 **Your Cannabis Options at ZenLeaf**
• Wedding Cake hybrid strain (28.4% THC) - perfect name match for social confidence
• Berry Bliss Gummies for discreet, manageable social effects  
• Balanced hybrid strains that provide euphoric, happy effects without overwhelming sedation

🧬 **Cannabis Science & Effects**
• Caryophyllene terpene reduces social anxiety and stress
• Balanced THC/CBD ratios provide confidence without paranoia
• Hybrid effects offer social euphoria while maintaining mental clarity

💡 **Consumption & Dosing**
• Low-dose edibles (2.5-5mg) for controlled, long-lasting social comfort
• Small flower hits 1-2 hours before event for optimal timing
• Avoid high-THC sativas which may increase anxiety in social settings

⚠️ **ZenLeaf Safety & Compliance**
• Start with lower doses for social situations to avoid overconsumption
• New Jersey 21+ adult use - bring valid ID to ZenLeaf Neptune
• Our budtenders can recommend specific strains for social anxiety management`;
  }
  
  if (query.includes('sleep') || query.includes('insomnia')) {
    return `🎯 **Your Cannabis Options at ZenLeaf**
• Indica strains like Mag Landrace (26.8% THC) or Purple Punch for deep sleep
• High myrcene terpene content promotes sedation and relaxation

🧬 **Cannabis Science & Effects**
• Myrcene terpene creates "couch-lock" and muscle relaxation
• THC converts to CBN over time, enhancing sleep properties
• Effects begin within 5-15 minutes, lasting 2-4 hours

💡 **Consumption & Dosing**
• Consume 1-2 hours before bedtime for optimal timing
• Start with small amounts if new to cannabis
• Flower smoking or tinctures work well for sleep

⚠️ **ZenLeaf Safety & Compliance**  
• Visit our Neptune City location for expert strain selection
• 21+ adult use only - premium cannabis dispensary
• Our budtenders help match strains to your sleep needs`;
  }
  
  return `Welcome to ZenLeaf Neptune - New Jersey's premier cannabis dispensary! I can help you find the perfect cannabis strains and products for your needs. Visit us at 2100 NJ-66, Neptune City for expert guidance from our budtenders.`;
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
    const body = JSON.parse(event.body || '{}');
    const user_query = body.user_query || body.query; // Support both parameter names
    const experience_level = body.experience_level || 'casual';
    
    if (!user_query) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
      body: JSON.stringify({ error: 'user_query or query parameter is required' })
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
