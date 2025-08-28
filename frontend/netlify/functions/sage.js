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

    // Smart cannabinoid matching
    const queryLower = query.toLowerCase();
    
    // Generate experience-based explanation
    const explanation = generateExplanation(query, experience_level);
    
    // Get matching products
    const products = getMatchingProducts(queryLower);
    
    // Mock educational resources
    const educational_resources = getMockEducationalResources(queryLower);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        explanation,
        products,
        educational_resources,
        educational_summary: null
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

function generateExplanation(query, experienceLevel) {
  const queryLower = query.toLowerCase();
  
  // Tone based on experience level
  let tone = '';
  if (experienceLevel === 'new') {
    tone = 'As a beginner, here\'s what you should know: ';
  } else if (experienceLevel === 'experienced') {
    tone = 'For an experienced user: ';
  } else {
    tone = '';
  }

  // Smart response generation based on query content
  if (queryLower.includes('sleep') || queryLower.includes('insomnia')) {
    return `🌿 **Quick Answer**\n• CBN and Delta-8 are your best options for sleep support\n• Start with 5-10mg CBN about 30-60 minutes before bed\n\n📚 **Key Benefits**\n• CBN promotes deep, restful sleep\n• Delta-8 provides gentle relaxation without anxiety\n• CBD can help calm racing thoughts\n• Terpenes like myrcene enhance sleepiness\n\n🔬 **Research Insights**\n• Studies show CBN has sedative properties\n• Delta-8 users report better sleep quality\n• Full-spectrum products may be more effective\n\n💡 **How to Use**\n• Take 30-60 minutes before desired sleep time\n• Start with lowest dose and adjust as needed\n• Consider combining with good sleep hygiene\n\n⚠️ **Important Notes**\n• Avoid driving after taking sleep products\n• Consult healthcare provider if you have sleep disorders\n• Start low and go slow with any new cannabinoid`;
  }
  
  if (queryLower.includes('anxiety') || queryLower.includes('stress') || queryLower.includes('calm')) {
    return `🌿 **Quick Answer**\n• CBD and Delta-8 are excellent for anxiety and stress relief\n• Both are non-psychoactive at proper doses\n\n📚 **Key Benefits**\n• CBD reduces cortisol (stress hormone) levels\n• Delta-8 provides calm without paranoia\n• CBG offers clear-headed relaxation\n• Regular use may help manage chronic stress\n\n🔬 **Research Insights**\n• Clinical studies show CBD reduces anxiety markers\n• Delta-8 users report less anxiety than Delta-9\n• Terpenes like linalool enhance calming effects\n\n💡 **How to Use**\n• Start with 10-15mg CBD or 5mg Delta-8\n• Take during stressful periods or daily for maintenance\n• Sublingual tinctures work fastest (15-30 minutes)\n\n⚠️ **Important Notes**\n• Everyone responds differently to cannabinoids\n• Consult healthcare provider for severe anxiety\n• May interact with certain medications`;
  }

  if (queryLower.includes('pain') || queryLower.includes('inflammation')) {
    return `🌿 **Quick Answer**\n• CBD, CBG, and CBC are powerful anti-inflammatory cannabinoids\n• THC may be needed for severe pain management\n\n📚 **Key Benefits**\n• CBD reduces inflammation and chronic pain\n• CBG targets specific pain pathways\n• CBC works synergistically with other cannabinoids\n• Topicals provide targeted relief\n\n🔬 **Research Insights**\n• Studies show CBD effective for arthritis pain\n• Cannabinoids interact with pain receptors\n• Entourage effect enhances pain relief\n\n💡 **How to Use**\n• Start with 15-25mg CBD twice daily\n• Apply topicals directly to affected areas\n• Consider micro-dosing THC for severe cases\n\n⚠️ **Important Notes**\n• Chronic pain requires medical supervision\n• May take several weeks to see full effects\n• Track symptoms to optimize dosing`;
  }

  if (queryLower.includes('high') || queryLower.includes('euphoria') || queryLower.includes('buzz')) {
    return `🌿 **Quick Answer**\n• Delta-8, HHC, and Delta-10 offer legal euphoria options\n• Each provides different effects and intensity levels\n\n📚 **Key Benefits**\n• Delta-8: Smooth, mellow high with less anxiety\n• HHC: THC-like effects with longer shelf life\n• Delta-10: Energizing, creative effects\n• All federally legal when hemp-derived\n\n🔬 **Research Insights**\n• Delta-8 binds differently to CB1 receptors\n• Users report clearer headspace than Delta-9\n• Onset time varies by consumption method\n\n💡 **How to Use**\n• Start with 2.5-5mg for edibles\n• Wait 2 hours before taking more\n• Vapes provide faster onset (5-15 minutes)\n\n⚠️ **Important Notes**\n• Must be 21+ for psychoactive products\n• Don't drive or operate machinery\n• Check local laws before purchasing`;
  }

  // Default response
  return `🌿 **Quick Answer**\n• Hemp offers many wellness benefits through various cannabinoids\n• Each cannabinoid has unique properties and effects\n\n📚 **Key Benefits**\n• CBD: Non-psychoactive, anti-inflammatory, calming\n• CBG: Focus and energy, "mother cannabinoid"\n• CBN: Sleep support, relaxation\n• Delta-8/HHC: Legal euphoria, mild psychoactive effects\n\n🔬 **Research Insights**\n• Over 100 cannabinoids identified in hemp\n• Entourage effect enhances individual benefits\n• Terpenes contribute to effects and flavors\n\n💡 **How to Use**\n• Start with low doses and increase gradually\n• Different methods have different onset times\n• Consistency is key for therapeutic benefits\n\n⚠️ **Important Notes**\n• Consult healthcare provider before starting\n• Quality varies between manufacturers\n• Third-party lab testing ensures purity`;
}

function getMatchingProducts(queryLower) {
  const allProducts = [
    {
      id: "1",
      name: "Sleep Support CBN Tincture",
      description: "High-CBN formula specifically designed for deep, restful sleep. Combines CBN with melatonin for enhanced sleep support.",
      price: "$58.99",
      category: "Sleep",
      cbd_mg: 15,
      thc_mg: 0,
      cbg_mg: 0,
      cbn_mg: 20,
      cbc_mg: 0,
      effects: ["sleep", "sedating", "deep-rest", "nighttime"],
      terpenes: { myrcene: 3.1, linalool: 1.8 },
      lab_tested: true,
      in_stock: true,
      brand: "Hemp Generation",
      product_type: "tincture"
    },
    {
      id: "2", 
      name: "Delta-8 Relaxation Gummies",
      description: "Hemp-derived Delta-8 THC gummies for mild euphoria and relaxation. Legal alternative with smooth, mellow effects.",
      price: "$34.99",
      category: "Edibles",
      cbd_mg: 2,
      thc_mg: 0,
      cbg_mg: 1,
      cbn_mg: 3,
      cbc_mg: 0,
      effects: ["relaxation", "mild-euphoria", "stress-relief", "mood-enhancement", "legal-high"],
      terpenes: { myrcene: 1.2, limonene: 1.8, linalool: 0.9 },
      lab_tested: true,
      in_stock: true,
      brand: "Hemp Generation",
      product_type: "edible"
    },
    {
      id: "3",
      name: "CBD Wellness Tincture",
      description: "Premium full-spectrum CBD oil for daily wellness support. Contains beneficial terpenes and minor cannabinoids.",
      price: "$45.99",
      category: "Wellness",
      cbd_mg: 30,
      thc_mg: 0.3,
      cbg_mg: 2,
      cbn_mg: 1,
      cbc_mg: 1,
      effects: ["wellness", "balance", "calm", "daily-support"],
      terpenes: { limonene: 2.1, pinene: 1.5, linalool: 1.0 },
      lab_tested: true,
      in_stock: true,
      brand: "Hemp Generation", 
      product_type: "tincture"
    }
  ];

  // Smart matching logic
  let scored = allProducts.map(product => {
    let score = 0;
    
    // Match effects
    product.effects.forEach(effect => {
      if (queryLower.includes(effect.replace('-', ' ')) || queryLower.includes(effect.replace('_', ' '))) {
        score += 25;
      }
    });

    // Match cannabinoids mentioned in query
    if (queryLower.includes('cbd') && product.cbd_mg > 0) score += 20;
    if (queryLower.includes('cbn') && product.cbn_mg > 0) score += 20; 
    if (queryLower.includes('cbg') && product.cbg_mg > 0) score += 20;
    if (queryLower.includes('delta') && product.name.toLowerCase().includes('delta')) score += 20;

    // Match use case
    if (queryLower.includes('sleep') && product.category.toLowerCase() === 'sleep') score += 30;
    if (queryLower.includes('wellness') && product.category.toLowerCase() === 'wellness') score += 15;

    return { ...product, match_score: score };
  });

  // Sort by score and return top 3
  return scored
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3);
}

function getMockEducationalResources(queryLower) {
  return {
    query: queryLower,
    intent: "general", 
    total_found: 5,
    returned: 5,
    papers: [
      {
        id: "mock_study_1",
        title: "Cannabinoid Effects on Sleep and Wellness: A Clinical Review",
        authors: ["Dr. Hemp Research", "Dr. Sleep Science"],
        year: 2024,
        journal: "Journal of Cannabis Medicine", 
        abstract: "This study examines the effects of various cannabinoids on sleep quality and general wellness markers in adults...",
        doi: "10.1000/mock.study.1",
        url: "https://example.com/study1",
        source: "mock_research",
        study_type: "clinical-review",
        credibility_score: 8.5
      }
    ],
    summary: {
      study_types: { "clinical-review": 1 },
      average_credibility_score: 8.5,
      high_credibility_count: 1
    }
  };
}