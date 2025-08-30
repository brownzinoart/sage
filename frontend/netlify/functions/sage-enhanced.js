const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import Premo products and cannabis knowledge
const premoProducts = require('./data/premoProducts');
const cannabisKnowledge = require('./data/cannabisKnowledge');

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { query, experience_level = 'casual' } = JSON.parse(event.body);
    
    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query is required' })
      };
    }

    // Try to use Gemini if API key is available
    let explanation;
    const queryLower = query.toLowerCase();
    
    if (process.env.GEMINI_API_KEY) {
      console.log('Using Gemini API for cannabis guidance');
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const prompt = `You are Sage, an AI assistant for Premo Cannabis Company, a legal cannabis dispensary in Keyport, NJ. 
        User's experience level: ${experience_level}
        User query: ${query}
        
        IMPORTANT: You are helping customers of a LEGAL cannabis dispensary in New Jersey. Provide accurate cannabis information including THC, CBD, and terpenes.
        
        Structure your response as follows:
        
        1. Natural language overview that acknowledges their needs
        
        2. For product queries, suggest specific cannabis products:
        🎯 **Recommended Products from Premo**
        - Mention specific strains, edibles, or concentrates
        - Include THC/CBD percentages
        - Describe effects and best use cases
        
        3. Educational content:
        📚 **Cannabis Knowledge**
        - Explain relevant cannabinoids (THC, CBD, CBN, etc.)
        - Discuss terpene profiles if relevant
        - Indica vs Sativa vs Hybrid differences
        
        4. Usage guidance:
        💡 **How to Use**
        - Dosage recommendations for their experience level
        - Onset times for different consumption methods
        - NJ legal consumption guidelines
        
        5. Safety notes:
        ⚠️ **Important Notes**
        - NJ legal requirements (21+, no public consumption)
        - Don't drive while impaired
        - Store safely away from children
        
        Remember: Premo Cannabis Company is located at 2 E Front St, Keyport, NJ. Open Mon-Sat 9AM-10PM, Sun 10AM-9PM.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        explanation = response.text();
      } catch (geminiError) {
        console.error('Gemini API error, falling back to local response:', geminiError);
        explanation = generateCannabisExplanation(query, experience_level);
      }
    } else {
      // Fallback to local response generation
      console.log('No Gemini API key, using fallback cannabis response');
      explanation = generateCannabisExplanation(query, experience_level);
    }
    
    console.log('Generated explanation preview:', explanation.substring(0, 200));
    
    // Get matching Premo products
    const products = getMatchingPremoProducts(queryLower);
    
    // Get cannabis education
    const educational_resources = getCannabisEducation(queryLower);
    const educational_summary = generateCannabisEducationalSummary(queryLower);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        explanation,
        products,
        educational_resources,
        educational_summary
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

function generateCannabisExplanation(query, experienceLevel) {
  const queryLower = query.toLowerCase();
  
  // Tone based on experience level
  let intro = '';
  if (experienceLevel === 'new') {
    intro = 'Welcome to Premo Cannabis! As someone new to cannabis, ';
  } else if (experienceLevel === 'experienced') {
    intro = 'As a cannabis connoisseur, ';
  } else {
    intro = 'Welcome to Premo Cannabis! ';
  }

  // Cannabis-specific responses
  if (queryLower.includes('sleep') || queryLower.includes('insomnia')) {
    return `${intro}I can help you find the perfect cannabis products for better sleep. At Premo Cannabis, we have several excellent options depending on your preferences and experience level.

🎯 **Recommended Products from Premo**

**Northern Lights (Indica Flower)** - Classic sleep strain
• 21% THC / 0.3% CBD
• Deep relaxation and sedation
• Best for: Evening use, 30-60 min before bed

**Dark Chocolate Edibles** - Long-lasting relief
• 100mg THC total (10mg pieces)
• 4-8 hours of effects
• Best for: All-night sleep support

**Live Rosin GMO (Concentrate)** - For experienced users
• 78% THC concentrate
• Powerful sedative effects
• Best for: Severe insomnia

📚 **Cannabis Knowledge**
• Indica strains like Northern Lights contain myrcene, a sedating terpene
• CBN (found in aged cannabis) is specifically sleep-promoting
• THC helps you fall asleep faster, CBD helps you stay asleep

💡 **How to Use**
• Beginners: Start with 2.5-5mg edibles or 0.25g flower
• Intermediate: 5-10mg edibles or 0.5g flower
• Timing: Smoke/vape 30 min before bed, edibles 2 hours before

⚠️ **Important Notes**
• Must be 21+ to purchase at Premo Cannabis
• Never drive after consuming cannabis
• NJ law: consumption on private property only
• Visit us: 2 E Front St, Keyport, NJ (Open until 10PM Mon-Sat)`;
  }
  
  if (queryLower.includes('anxiety') || queryLower.includes('stress')) {
    return `${intro}Let's find the right cannabis products to help manage your anxiety and stress. Premo Cannabis offers several options with different THC:CBD ratios.

🎯 **Recommended Products from Premo**

**CBD:THC Balanced Mints** - Gentle relief
• 5mg THC / 5mg CBD per mint
• Calm without overwhelming high
• Best for: Daytime anxiety management

**Blue Dream (Hybrid Flower)** - Balanced effects
• 22% THC / 0.5% CBD
• Euphoric and relaxing without sedation
• Best for: Social anxiety, creative activities

**Live Resin Jack Herer Cart** - Focused calm
• 85% THC sativa vape
• Clear-headed relief
• Best for: Work stress, daytime use

📚 **Cannabis Knowledge**
• CBD counteracts THC anxiety - balanced ratios work best
• Limonene terpene (citrus smell) reduces stress
• Low-dose THC can relieve anxiety; high doses may increase it

💡 **How to Use**
• Start low: 2.5mg THC for beginners
• 1:1 CBD:THC ratio recommended for anxiety
• Vaping provides fast relief (5-15 minutes)

⚠️ **Important Notes**
• Some people experience increased anxiety with THC
• Keep CBD products on hand to counteract if needed
• Premo Cannabis: (908) 676-7320 for product questions`;
  }

  if (queryLower.includes('pain') || queryLower.includes('inflammation')) {
    return `${intro}Cannabis can be very effective for pain management. Premo Cannabis has options ranging from mild to potent relief.

🎯 **Recommended Products from Premo**

**Gorilla Glue #4 (Hybrid)** - Heavy pain relief
• 28% THC / 0.1% CBD
• Full-body relaxation
• Best for: Chronic pain, muscle spasms

**100mg Chocolate Bar** - Extended relief
• Indica-leaning edible
• 6-8 hours of effects
• Best for: All-day pain management

**Live Rosin Concentrate** - Maximum potency
• 78% THC solventless extract
• Immediate, powerful relief
• Best for: Severe pain (experienced users)

📚 **Cannabis Knowledge**
• THC binds to pain receptors, reducing signal transmission
• Caryophyllene terpene has anti-inflammatory properties
• Indica strains typically better for body pain

💡 **How to Use**
• Topicals for localized pain (no high)
• Edibles for long-lasting systemic relief
• Smoking/vaping for immediate relief

⚠️ **Important Notes**
• High-THC products require tolerance
• May interact with pain medications
• Visit Premo: 2 E Front St, Keyport, NJ`;
  }

  // Default response for general queries
  return `${intro}I'm here to help you explore our premium cannabis selection at Premo Cannabis Company, NJ's premier dispensary.

🎯 **Popular Products at Premo**

**Flower Selection** - Fresh, potent strains
• Indica: Northern Lights (21% THC) - Relaxation
• Sativa: Sour Diesel (24% THC) - Energy  
• Hybrid: Blue Dream (22% THC) - Balanced

**Edibles** - Precise dosing
• Gummies: 10mg THC each
• Chocolates: 100mg bars
• Mints: 5mg THC/5mg CBD

**Vapes & Concentrates** - Fast-acting
• Live Resin Carts: 85% THC
• Disposable Pens: Convenient
• Concentrates: 78-88% THC

📚 **Cannabis Knowledge**
• THC: Psychoactive, euphoric effects
• CBD: Non-intoxicating, therapeutic
• Terpenes: Flavor and effect modifiers

💡 **Visit Premo Cannabis**
📍 2 E Front St, Keyport, NJ 07735
📞 (908) 676-7320
🕐 Mon-Sat: 9AM-10PM, Sun: 10AM-9PM

⚠️ **NJ Cannabis Laws**
• 21+ with valid ID required
• 1 oz purchase limit per day
• Private property consumption only
• No driving while impaired`;
}

function getMatchingPremoProducts(queryLower) {
  // Use the imported premoProducts data
  const products = premoProducts || [];

  // Smart matching based on query
  return products.filter(product => {
    const matchesEffect = product.effects && product.effects.some(effect => 
      queryLower.includes(effect.toLowerCase())
    );
    const matchesType = queryLower.includes(product.type);
    const matchesCategory = queryLower.includes(product.category.toLowerCase());
    const matchesName = product.name.toLowerCase().includes(queryLower);
    const matchesDescription = product.description.toLowerCase().includes(queryLower);
    
    return matchesEffect || matchesType || matchesCategory || matchesName || matchesDescription;
  }).slice(0, 3).map(product => ({
    ...product,
    price: `$${product.price}`, // Add dollar sign if not present
    in_stock: product.inStock // Map inStock to in_stock for consistency
  }));
}

function getCannabisEducation(queryLower) {
  // Use the imported cannabisKnowledge data
  const knowledge = cannabisKnowledge || {};
  
  return {
    cannabinoids: knowledge.cannabinoids || {
      thc: {
        name: "Tetrahydrocannabinol (THC)",
        description: "Primary psychoactive compound. Creates euphoric 'high' feeling.",
        effects: ["euphoria", "relaxation", "increased appetite", "altered perception"],
        legal_limit: "Products available up to 35% THC at Premo"
      },
      cbd: {
        name: "Cannabidiol (CBD)",  
        description: "Non-psychoactive. Therapeutic benefits without the high.",
        effects: ["anxiety relief", "anti-inflammatory", "pain relief", "mental clarity"],
        legal_status: "Fully legal in NJ"
      }
    },
    terpenes: knowledge.terpenes || {
      myrcene: {
        aroma: "Earthy, musky",
        effects: "Sedating, relaxing",
        found_in: "Mangoes, hops"
      },
      limonene: {
        aroma: "Citrus",
        effects: "Mood elevation, stress relief",
        found_in: "Lemons, oranges"
      }
    },
    nj_laws: knowledge.newJerseyLaws || {
      age_requirement: "21+ with valid ID",
      purchase_limit: "1 ounce per day",
      consumption: "Private property only",
      driving: "Illegal - DUI laws apply"
    },
    premo_info: {
      address: "2 E Front St, Keyport, NJ 07735",
      phone: "(908) 676-7320",
      hours: "Mon-Sat: 9AM-10PM, Sun: 10AM-9PM",
      website: "premocannabis.co"
    }
  };
}

function generateCannabisEducationalSummary(queryLower) {
  return {
    key_findings: [
      "Cannabis products at Premo are lab-tested for safety and potency",
      "Different strains and products suit different needs",
      "Start with low doses and increase gradually",
      "Effects vary by consumption method and individual tolerance"
    ],
    dosage_recommendations: {
      beginner: "2.5-5mg THC for edibles, 0.25g for flower",
      intermediate: "5-15mg THC for edibles, 0.5g for flower", 
      experienced: "15mg+ THC for edibles, 1g+ for flower"
    },
    safety_notes: [
      "Never drive or operate machinery while impaired",
      "Keep all cannabis products away from children and pets",
      "Store in a cool, dry place",
      "Effects can last 2-8 hours depending on method"
    ],
    legal_compliance: {
      valid_id_required: true,
      age_minimum: 21,
      public_consumption: "Prohibited",
      home_growing: "Not permitted for recreational use in NJ"
    }
  };
}