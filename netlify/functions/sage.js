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

// Generate AI explanation and select products using Gemini
async function generateEnhancedResponse(userQuery, experienceLevel = 'casual', products) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    const productList = JSON.stringify(
      products.map(({ id, name, strain_type, thc_percentage, dominant_terpene, effects, description }) =>
        ({ id, name, strain_type, thc_percentage, dominant_terpene, effects, description })
      ),
      null,
      2
    );

    const prompt = `${CANNABIS_KNOWLEDGE}

AVAILABLE CANNABIS PRODUCTS:
${productList}

User Experience Level: ${experienceLevel}
User Query: "${userQuery}"

You are ZenLeaf Neptune's expert cannabis consultant. Your task is to provide a premium, personalized cannabis consultation based on the user's query and experience level, using ONLY the products from the AVAILABLE CANNABIS PRODUCTS list.

**CRITICAL INSTRUCTIONS:**
1.  **Analyze the User Query:** Understand the user's needs (e.g., sleep, energy, social anxiety).
2.  **Select 1-3 Products:** Choose the most suitable products from the list.
3.  **Generate Explanation:** Write a detailed explanation formatted with the exact sections below.
4.  **Embed Product IDs:** At the very end of your response, you MUST include a line with the chosen product IDs in this exact format:
    RECOMMENDED_PRODUCTS=[id_1,id_2,...]

**RESPONSE FORMAT:**

🎯 **Your Cannabis Options at ZenLeaf**
• Recommend the specific strains you selected from the list.
• Explain WHY these specific products are ideal for the user's needs, referencing their effects, THC, and terpenes.

🧬 **Cannabis Science & Effects**
• Explain the science behind your recommendations (e.g., "The myrcene in Mag Landrace promotes relaxation...").
• Detail the expected onset and duration for the recommended product types (flower, edibles).

💡 **Consumption & Dosing**
• Provide specific dosing advice for the selected products and user's experience level.
• Suggest the best time and method to consume the recommended products.

⚠️ **ZenLeaf Safety & Compliance**
• Remind users of the "start low, go slow" principle.
• State the NJ 21+ adult use requirement.
• Encourage a visit to ZenLeaf Neptune for more expert advice.

Keep the tone professional, educational, and focused on customer care. Emphasize ZenLeaf's premium quality.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback explanation should still be cannabis-focused
    return `Welcome to ZenLeaf Neptune! We're currently experiencing high demand. Based on your query for "${userQuery}", we generally recommend exploring our indica strains for relaxation or sativa strains for energy. Please visit our dispensary at 2100 NJ-66, Neptune City, where our expert budtenders can provide a personalized consultation. RECOMMENDED_PRODUCTS=[]`;
  }
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
    const user_query = body.user_query || body.query;
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

    // Generate AI explanation and get product recommendations in one call
    const rawResponse = await generateEnhancedResponse(user_query, experience_level, zenleafProducts);

    // Extract explanation and product IDs
    let explanation = rawResponse;
    let recommendedIds = [];

    const match = rawResponse.match(/RECOMMENDED_PRODUCTS=\[(.*?)\]/);
    if (match && match[1]) {
      recommendedIds = match[1].split(',').map(id => id.trim()).filter(id => id);
      // Clean the recommendation line from the user-facing explanation
      explanation = rawResponse.replace(/RECOMMENDED_PRODUCTS=\[(.*?)\]/, '').trim();
    }

    // Filter products based on AI recommendations
    const recommendedProducts = zenleafProducts.filter(p => recommendedIds.includes(p.id));
    
    // If AI fails to recommend specific products, fall back to showing the top 3 products
    const productsToDisplay = recommendedProducts.length > 0 ? recommendedProducts : zenleafProducts.slice(0, 3);

    // Transform products to the format expected by the frontend
    const transformedProducts = productsToDisplay.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: `$${product.price.toFixed(2)}`, // Ensure price is a string with two decimals
      category: product.strain_type ?
        product.strain_type.charAt(0).toUpperCase() + product.strain_type.slice(1) :
        'Cannabis',
      thc_percentage: product.thc_percentage,
      cbd_percentage: product.cbd_percentage,
      dominant_terpene: product.dominant_terpene,
      effects: product.effects,
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
        // Mocked educational resources as before
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