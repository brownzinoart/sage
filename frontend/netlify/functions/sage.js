const { GoogleGenerativeAI } = require('@google/generative-ai');

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
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const prompt = `You are Sage, an AI assistant specializing in hemp, CBD, and cannabis wellness education. 
        User's experience level: ${experience_level}
        User query: ${query}
        
        IMPORTANT: For queries about common wellness concerns (sleep, anxiety, pain, stress, etc.), present MULTIPLE solution pathways instead of just one approach.
        
        Structure your response as follows:
        
        1. Natural language overview paragraph that acknowledges their concern and introduces that there are different approaches available
        
        2. If the query benefits from multiple approaches, add:
        🎯 **Your Options** (or "Pathways to Relief" or similar)
        Present 2-3 distinct approaches, each with:
        - **Approach Name** - Brief description
        • Key products/cannabinoids for this path
        • Best for: [specific situations]
        
        For example, for sleep issues:
        **Quick Relief Tonight** - Fast-acting options
        • Delta-8, CBN tinctures (15-30 min onset)
        • Best for: Immediate need, occasional use
        
        **Natural Sleep Support** - Gentle, sustainable
        • CBD with calming terpenes, full-spectrum
        • Best for: Ongoing support, sensitive users
        
        **Comprehensive Approach** - Long-term wellness
        • Morning CBD + evening CBN routine
        • Best for: Chronic issues, lifestyle integration
        
        3. Then continue with:
        📚 **Key Benefits** (organize by pathway if multiple)
        🔬 **Research Insights** 
        💡 **How to Use** (pathway-specific if applicable)
        ⚠️ **Important Notes**
        
        Match complexity to experience level: simpler for new users, more detailed for experienced.
        Focus on wellness and educational information only.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        explanation = response.text();
      } catch (geminiError) {
        console.error('Gemini API error, falling back to local response:', geminiError);
        explanation = generateExplanation(query, experience_level);
      }
    } else {
      // Fallback to local response generation
      explanation = generateExplanation(query, experience_level);
    }
    
    // Get matching products
    const products = getMatchingProducts(queryLower);
    
    // Mock educational resources
    const educational_resources = getMockEducationalResources(queryLower);
    const educational_summary = generateEducationalSummary(queryLower, educational_resources);

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
    return `I understand how frustrating sleep issues can be. The good news is there are several different approaches to finding relief through hemp and cannabinoids, depending on whether you need something fast-acting tonight or you're looking for a more sustainable, long-term solution.\n\n🎯 **Your Sleep Solution Options**\n\n**Quick Relief Tonight** - Fast-acting for immediate needs\n• CBN tinctures or Delta-8 gummies (15-30 min onset)\n• THC-alternative options like HHC for deeper sedation\n• Best for: Occasional sleeplessness, need help right away\n\n**Natural Sleep Support** - Gentle, non-drowsy approach\n• CBD with calming terpenes (myrcene, linalool)\n• Full-spectrum hemp extracts for entourage effect\n• Best for: Sensitive users, daily use without grogginess\n\n**Indica-Inspired Blends** - Traditional cannabis-like effects\n• High-CBN formulas with indica terpene profiles\n• Delta-8 + CBN combinations for deep relaxation\n• Best for: Those seeking classic "couch-lock" effects\n\n📚 **Key Benefits**\n• Multiple pathways target different sleep issues\n• CBN promotes deep, restful sleep phases\n• Terpenes enhance natural drowsiness\n• Options for both immediate and long-term support\n\n🔬 **Research Insights**\n• CBN shows strongest sedative properties of all cannabinoids\n• Combining cannabinoids increases effectiveness (entourage effect)\n• Indica terpene profiles contribute to sedation beyond cannabinoids alone\n\n💡 **How to Use**\n• Fast-acting: 30-60 minutes before bed\n• Daily support: Consistent timing each evening\n• Start with 5-10mg CBN or 2.5-5mg Delta-8\n• Adjust based on your response\n\n⚠️ **Important Notes**\n• Different approaches work for different people\n• Avoid driving after taking any sleep products\n• May interact with other sleep medications`;
  }
  
  if (queryLower.includes('anxiety') || queryLower.includes('stress') || queryLower.includes('calm')) {
    return `I can definitely help you explore anxiety and stress relief options. Everyone's anxiety manifests differently - whether it's racing thoughts, physical tension, or social nervousness - so having multiple approaches to choose from can help you find what works best for your specific situation.\n\n🎯 **Your Anxiety Relief Pathways**\n\n**Pure CBD Approach** - Non-psychoactive, clear-headed calm\n• CBD isolate or broad-spectrum products (no THC)\n• CBG for focus with anxiety relief\n• Best for: Daytime use, work stress, zero tolerance for THC\n\n**Mild Euphoria Path** - Gentle mood lift with relaxation\n• Delta-8 THC for calm without paranoia\n• HHC for balanced relaxation and mood boost\n• Best for: Social anxiety, evening unwinding, mood support\n\n**Natural Botanical Blend** - Plant-powered stress relief\n• Full-spectrum CBD with calming terpenes\n• Adaptogen-enhanced formulas (ashwagandha, L-theanine)\n• Best for: Holistic wellness, daily maintenance, sensitive users\n\n📚 **Key Benefits**\n• Multiple mechanisms target different anxiety types\n• Options for both acute relief and daily management\n• Non-habit forming alternatives to traditional medications\n• Can be combined for personalized relief\n\n🔬 **Research Insights**\n• CBD reduces cortisol and inflammatory markers linked to stress\n• Delta-8 activates CB1 receptors with less anxiety than Delta-9\n• Terpenes like limonene and linalool have proven anxiolytic effects\n\n💡 **How to Use**\n• CBD: 10-25mg for mild anxiety, up to 50mg for acute stress\n• Delta-8: Start with 2.5-5mg, increase gradually\n• Best timing varies: morning for all-day support, as-needed for acute episodes\n\n⚠️ **Important Notes**\n• Start with one approach before combining\n• Some options may cause drowsiness\n• Consult healthcare provider if on anxiety medications`;
  }

  if (queryLower.includes('pain') || queryLower.includes('inflammation')) {
    return `Dealing with pain can really impact your quality of life, and I'm here to help you find relief. CBD, CBG, and CBC are three cannabinoids that work wonderfully for inflammation and pain management. CBD is the most studied and provides broad anti-inflammatory effects, while CBG targets specific pain pathways and CBC enhances the effects of other cannabinoids. For localized pain, topicals can provide targeted relief, while tinctures or edibles work systemically throughout your body.\n\n📚 **Key Benefits**\n• CBD reduces inflammation and chronic pain\n• CBG targets specific pain pathways\n• CBC works synergistically with other cannabinoids\n• Topicals provide targeted relief\n\n🔬 **Research Insights**\n• Studies show CBD effective for arthritis pain\n• Cannabinoids interact with pain receptors\n• Entourage effect enhances pain relief\n\n💡 **How to Use**\n• Start with 15-25mg CBD twice daily\n• Apply topicals directly to affected areas\n• Consider micro-dosing THC for severe cases\n\n⚠️ **Important Notes**\n• Chronic pain requires medical supervision\n• May take several weeks to see full effects\n• Track symptoms to optimize dosing`;
  }

  if (queryLower.includes('high') || queryLower.includes('euphoria') || queryLower.includes('buzz')) {
    return `If you're looking for a legal way to experience euphoria, there are several hemp-derived options available. Delta-8 is the most popular choice - it provides a smooth, mellow high that's about 60-70% as potent as traditional THC but with less anxiety. HHC offers similar effects with a bit more energy, while Delta-10 is known for its uplifting, creative effects. All of these are federally legal when derived from hemp, though you should always check your local laws.\n\n📚 **Key Benefits**\n• Delta-8: Smooth, mellow high with less anxiety\n• HHC: THC-like effects with longer shelf life\n• Delta-10: Energizing, creative effects\n• All federally legal when hemp-derived\n\n🔬 **Research Insights**\n• Delta-8 binds differently to CB1 receptors\n• Users report clearer headspace than Delta-9\n• Onset time varies by consumption method\n\n💡 **How to Use**\n• Start with 2.5-5mg for edibles\n• Wait 2 hours before taking more\n• Vapes provide faster onset (5-15 minutes)\n\n⚠️ **Important Notes**\n• Must be 21+ for psychoactive products\n• Don't drive or operate machinery\n• Check local laws before purchasing`;
  }

  // Default response
  return `I'd love to help you explore the world of hemp and cannabinoids! There are over 100 different cannabinoids in hemp, each with unique properties that can support various aspects of wellness. Whether you're looking for relaxation, better sleep, pain relief, or just general wellness support, there's likely a cannabinoid or combination that can help. The key is finding what works best for your specific needs and starting with appropriate doses.\n\n📚 **Key Benefits**\n• CBD: Non-psychoactive, anti-inflammatory, calming\n• CBG: Focus and energy, "mother cannabinoid"\n• CBN: Sleep support, relaxation\n• Delta-8/HHC: Legal euphoria, mild psychoactive effects\n\n🔬 **Research Insights**\n• Over 100 cannabinoids identified in hemp\n• Entourage effect enhances individual benefits\n• Terpenes contribute to effects and flavors\n\n💡 **How to Use**\n• Start with low doses and increase gradually\n• Different methods have different onset times\n• Consistency is key for therapeutic benefits\n\n⚠️ **Important Notes**\n• Consult healthcare provider before starting\n• Quality varies between manufacturers\n• Third-party lab testing ensures purity`;
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
  // Generate research papers based on query content
  const papers = generateRelevantPapers(queryLower);
  
  return {
    research_studies: {
      papers: papers,
      total_found: papers.length,
      query: queryLower,
      intent: "general"
    },
    source_credibility: {
      average_credibility: papers.reduce((sum, paper) => sum + paper.credibility_score, 0) / papers.length,
      total_papers: papers.length,
      high_credibility_count: papers.filter(p => p.credibility_score >= 8).length
    },
    safety_information: {
      general_warnings: [
        "Start with low doses and increase gradually",
        "Consult healthcare provider if taking medications",
        "May cause drowsiness - avoid driving after use",
        "Keep out of reach of children and pets"
      ],
      drug_interactions: [
        "May interact with blood thinners",
        "Potential interactions with seizure medications",
        "Consult doctor before surgical procedures"
      ]
    },
    dosage_guidelines: {
      recommendation: "Start with 2.5-5mg for beginners, wait 2 hours before taking more. Effects may take 30-90 minutes to appear.",
      safety_considerations: [
        "Individual responses vary significantly",
        "Take with food to improve absorption",
        "Maintain consistent timing for best results",
        "Keep a dosage journal to track effects"
      ]
    },
    mechanism_of_action: "Cannabinoids interact with the body's endocannabinoid system, binding to CB1 and CB2 receptors to promote homeostasis and wellness.",
    legal_status: "Hemp-derived products with less than 0.3% THC are federally legal in the US, but state laws may vary."
  };
}

function generateRelevantPapers(queryLower) {
  const basePapers = [
    {
      id: "study_cbd_sleep_2024",
      title: "CBD and Sleep Quality: A Randomized Controlled Trial",
      authors: "Johnson, M.D., Smith, P.h.D., Wilson, R.N.",
      journal: "Journal of Sleep Medicine",
      year: 2024,
      abstract: "This randomized controlled trial examined the effects of CBD on sleep quality in 150 adults with sleep difficulties. Participants receiving 25mg CBD showed significant improvements in sleep latency and overall sleep quality compared to placebo.",
      credibility_score: 9.2,
      url: "https://pubmed.ncbi.nlm.nih.gov/mock-study-1"
    },
    {
      id: "study_hemp_anxiety_2023",
      title: "Hemp-Derived Cannabinoids for Anxiety Management: Clinical Evidence",
      authors: "Roberts, Dr., Chen, Ph.D., Martinez, M.D.",
      journal: "Anxiety and Stress Research",
      year: 2023,
      abstract: "A comprehensive review of clinical trials investigating hemp-derived cannabinoids for anxiety disorders. Analysis of 12 studies involving 1,200 participants demonstrated significant anxiety reduction with minimal side effects.",
      credibility_score: 8.7,
      url: "https://pubmed.ncbi.nlm.nih.gov/mock-study-2"
    }
  ];

  // Add query-specific papers
  if (queryLower.includes('sleep') || queryLower.includes('insomnia')) {
    basePapers.push({
      id: "study_cbn_sleep_2024",
      title: "CBN as a Natural Sleep Aid: Comparative Analysis with Traditional Sleep Medications",
      authors: "Thompson, M.D., Lee, Ph.D.",
      journal: "Natural Sleep Research",
      year: 2024,
      abstract: "This study compared CBN effectiveness to traditional sleep aids in 200 participants over 8 weeks. CBN showed comparable efficacy with significantly fewer side effects and no dependency issues.",
      credibility_score: 8.9,
      url: "https://pubmed.ncbi.nlm.nih.gov/mock-study-3"
    });
  }

  if (queryLower.includes('pain') || queryLower.includes('inflammation')) {
    basePapers.push({
      id: "study_cbd_pain_2023",
      title: "Anti-inflammatory Properties of CBD: Mechanisms and Clinical Applications",
      authors: "Davis, Ph.D., Kumar, M.D., Wilson, D.Sc.",
      journal: "Pain Management Research",
      year: 2023,
      abstract: "Investigation of CBD's anti-inflammatory mechanisms and efficacy in chronic pain conditions. Results show CBD significantly reduced inflammatory markers and pain scores in arthritis patients.",
      credibility_score: 9.1,
      url: "https://pubmed.ncbi.nlm.nih.gov/mock-study-4"
    });
  }

  if (queryLower.includes('anxiety') || queryLower.includes('stress')) {
    basePapers.push({
      id: "study_delta8_anxiety_2024",
      title: "Delta-8 THC for Anxiety: Safety and Efficacy Profile",
      authors: "Miller, Ph.D., Garcia, M.D.",
      journal: "Cannabinoid Medicine Journal",
      year: 2024,
      abstract: "First large-scale study on Delta-8 THC for anxiety management. 300 participants showed reduced anxiety scores with minimal psychoactive effects and no reported adverse events.",
      credibility_score: 8.4,
      url: "https://pubmed.ncbi.nlm.nih.gov/mock-study-5"
    });
  }

  return basePapers.slice(0, 4); // Return up to 4 relevant papers
}

function generateEducationalSummary(queryLower, educational_resources) {
  const papers = educational_resources.research_studies.papers;
  
  // Generate key findings based on query content
  let key_findings = [];
  let evidence_strength = 'moderate';
  let research_gaps = [];
  
  if (queryLower.includes('sleep') || queryLower.includes('insomnia')) {
    key_findings = [
      "CBD at 25mg doses significantly improves sleep onset time and overall sleep quality",
      "CBN shows comparable efficacy to traditional sleep aids with fewer side effects",
      "Hemp-derived cannabinoids do not create dependency issues unlike pharmaceutical sleep medications",
      "Optimal timing appears to be 30-60 minutes before desired sleep time"
    ];
    evidence_strength = 'strong';
    research_gaps = [
      "Long-term effects beyond 8 weeks need more research",
      "Optimal dosing for different age groups requires further study"
    ];
  } else if (queryLower.includes('anxiety') || queryLower.includes('stress')) {
    key_findings = [
      "CBD and Delta-8 THC show significant anxiety reduction in clinical trials",
      "Hemp cannabinoids effectively reduce cortisol (stress hormone) levels",
      "Minimal side effects reported compared to traditional anxiety medications",
      "Benefits appear within 30-60 minutes of administration"
    ];
    evidence_strength = 'strong';
    research_gaps = [
      "Effects on severe anxiety disorders need more comprehensive studies",
      "Drug interaction profiles require additional research"
    ];
  } else if (queryLower.includes('pain') || queryLower.includes('inflammation')) {
    key_findings = [
      "CBD demonstrates significant anti-inflammatory properties in clinical settings",
      "Cannabinoids effectively reduce chronic pain scores in arthritis patients",
      "Topical applications provide localized relief without systemic effects",
      "Combination therapy with multiple cannabinoids shows enhanced benefits"
    ];
    evidence_strength = 'strong';
    research_gaps = [
      "Optimal cannabinoid ratios for different pain conditions",
      "Long-term safety profiles in chronic pain management"
    ];
  } else {
    key_findings = [
      "Hemp-derived cannabinoids show promise for multiple wellness applications",
      "Safety profiles are generally favorable with minimal reported side effects",
      "Individual response varies significantly, requiring personalized approaches",
      "Quality and consistency of products greatly affects therapeutic outcomes"
    ];
    evidence_strength = 'moderate';
    research_gaps = [
      "Standardization of dosing across different conditions",
      "Long-term effects and optimal usage patterns need more research"
    ];
  }
  
  return {
    key_findings,
    evidence_strength,
    research_gaps,
    total_studies_analyzed: papers.length,
    quality_assessment: {
      high_quality: papers.filter(p => p.credibility_score >= 9).length,
      moderate_quality: papers.filter(p => p.credibility_score >= 7 && p.credibility_score < 9).length,
      lower_quality: papers.filter(p => p.credibility_score < 7).length
    },
    recommendations: [
      "Start with lowest effective dose and adjust gradually",
      "Consult healthcare provider before beginning any cannabinoid regimen",
      "Choose products from reputable manufacturers with third-party testing",
      "Keep a symptom and dosage journal to track individual responses"
    ]
  };
}