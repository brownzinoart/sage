#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } = require('@modelcontextprotocol/sdk/types.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Load cannabis data
let cannabisProducts = [];
let cannabisResearch = {};

async function loadCannabisData() {
  try {
    // Try ZenLeaf Neptune products first
    const zenleafData = await fs.readFile(path.join(__dirname, 'data', 'zenleaf_neptune_products.json'), 'utf-8');
    cannabisProducts = JSON.parse(zenleafData);
    console.error('✅ ZenLeaf Neptune products loaded');
    
    const researchData = await fs.readFile(path.join(__dirname, 'data', 'nj_cannabis_research.json'), 'utf-8');
    cannabisResearch = JSON.parse(researchData);
    console.error('✅ Cannabis research data loaded');
  } catch (error) {
    console.error('⚠️  ZenLeaf data not found, trying fallback...');
    try {
      const productsData = await fs.readFile(path.join(__dirname, 'data', 'nj_sample_products.json'), 'utf-8');
      cannabisProducts = JSON.parse(productsData);
      console.error('✅ NJ cannabis products loaded as fallback');
    } catch (fallbackError) {
      console.error('⚠️  Cannabis data not found, using basic knowledge');
    }
  }
}

// Cannabis knowledge base for Gemini
const CANNABIS_KNOWLEDGE_BASE = `
ZEN LEAF NEPTUNE - SPECIALIZED CANNABIS KNOWLEDGE BASE

STORE LOCATION: 
• Zen Leaf Neptune - 2100 NJ-66, Neptune City, NJ 07753
• Phone: (908) 676-5936 • Adult Use Recreational
• Hours: Monday 10AM-9PM, Tue 9AM-9PM, Wed-Sun 8AM-10PM
• Parking: Free on-site • ADA accessible facility

BRAND PHILOSOPHY:
• "Relax. Recharge. Refresh." - Find Your Zen
• Premium quality cannabis with expert guidance
• Education-first approach, product recommendations second
• Safe, welcoming environment for all experience levels

FEATURED BRANDS:
• VERANO RESERVE: Premium cultivation, high-THC flower, live resin
• (THE) ESSENCE: Quality flower, classic strains, reliable potency
• ON THE ROCKS: Premium vape cartridges and disposables
• ENCORE: Precisely dosed gummies and edibles
• SAVVY: Wellness-focused tinctures and topicals

STRAIN TYPES & EFFECTS:
• INDICA: Body-focused effects, relaxation, sedation, evening use, higher myrcene
• SATIVA: Head-focused effects, energy, creativity, daytime use, higher limonene/pinene  
• HYBRID: Balanced effects combining indica and sativa traits, versatile timing

THC POTENCY LEVELS:
• LOW (15-20%): Moderate effects, good for casual users
• MEDIUM (20-25%): Standard recreational potency, balanced experience  
• HIGH (25%+): Premium potency, experienced users, careful dosing

TERPENE PROFILES:
• MYRCENE: Sedative, muscle relaxant, "couch-lock", sleep aid
• LIMONENE: Mood elevation, stress relief, citrus aroma, energy
• PINENE: Alertness, memory, focus, respiratory benefits
• LINALOOL: Calming, anxiety reduction, lavender aroma
• CARYOPHYLLENE: Pain relief, anti-inflammatory, spicy aroma

NJ LEGAL COMPLIANCE:
• 21+ Adult Use only • Valid ID required
• Purchase limit: 1 ounce flower per day, 5g concentrates
• Lab testing required • Batch tracking • Child-resistant packaging
• Universal warning symbols • No consumption on premises

PRODUCT CATEGORIES AT ZEN LEAF:
• FLOWER: Premium eighths $52-68, smoking/vaping, 1-3 hour effects
• VAPES: Cartridges $62, disposables $45, immediate onset, discreet
• EDIBLES: Gummies $32, 10mg doses, 30-120min onset, 4-8 hour duration
• CONCENTRATES: Live resin $78, high potency 74%+ THC, dabbing/vaping
• TINCTURES: Sublingual oils $58, precise dosing, 15-45min onset
• TOPICALS: Relief balms $42, localized treatment, non-psychoactive

CONSUMER GUIDANCE:
• New users: Start with lower potency, indica hybrids, precise dosing
• Casual users: Balanced hybrids, moderate THC, versatile timing
• Experienced users: High potency options, concentrates, premium flower
• Medical focus: CBD ratios, specific terpenes, targeted relief
`;

class GeminiMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'sage-gemini',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandlers();
  }

  setupErrorHandlers() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'gemini_chat',
          description: 'Chat with Gemini AI with cannabis expertise. Use for general questions, advice, and consultation.',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'The message to send to Gemini'
              },
              model: {
                type: 'string',
                description: 'Gemini model to use',
                default: 'gemini-1.5-flash'
              },
              temperature: {
                type: 'number',
                description: 'Temperature for response creativity (0-1)',
                default: 0.7
              }
            },
            required: ['message']
          }
        },
        {
          name: 'cannabis_recommend',
          description: 'Get specialized cannabis product recommendations based on user needs and experience level.',
          inputSchema: {
            type: 'object',
            properties: {
              need: {
                type: 'string',
                description: 'What the user needs help with (e.g., sleep, pain, energy, anxiety)'
              },
              experience: {
                type: 'string',
                description: 'User experience level',
                enum: ['new', 'casual', 'experienced'],
                default: 'casual'
              },
              preference: {
                type: 'string',
                description: 'Product type preference (optional)',
                enum: ['flower', 'edibles', 'vapes', 'concentrates', 'tinctures', 'topicals', 'any']
              }
            },
            required: ['need']
          }
        },
        {
          name: 'generate_content',
          description: 'Generate cannabis-focused content like product descriptions, educational material, or marketing copy.',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'Type of content to generate',
                enum: ['product-description', 'blog-post', 'email', 'education', 'strain-guide']
              },
              topic: {
                type: 'string',
                description: 'Specific topic or product name for content generation'
              },
              length: {
                type: 'string',
                description: 'Content length',
                enum: ['short', 'medium', 'long'],
                default: 'medium'
              }
            },
            required: ['type', 'topic']
          }
        },
        {
          name: 'analyze_code',
          description: 'Analyze code files with cannabis platform context and provide improvement suggestions.',
          inputSchema: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'The code to analyze'
              },
              filename: {
                type: 'string',
                description: 'Name of the file being analyzed'
              },
              feedback: {
                type: 'boolean',
                description: 'Whether to provide improvement suggestions',
                default: false
              }
            },
            required: ['code', 'filename']
          }
        },
        {
          name: 'strain_lookup',
          description: 'Look up specific strain information from the NJ cannabis database.',
          inputSchema: {
            type: 'object',
            properties: {
              strain_name: {
                type: 'string',
                description: 'Name of the strain to look up'
              },
              search_type: {
                type: 'string',
                description: 'Type of search',
                enum: ['exact', 'contains', 'effects', 'terpenes'],
                default: 'contains'
              }
            },
            required: ['strain_name']
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'gemini_chat':
            return await this.handleChat(args);
          case 'cannabis_recommend':
            return await this.handleRecommend(args);
          case 'generate_content':
            return await this.handleGenerate(args);
          case 'analyze_code':
            return await this.handleAnalyze(args);
          case 'strain_lookup':
            return await this.handleStrainLookup(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, error.message);
      }
    });
  }

  async handleChat(args) {
    const { message, model = 'gemini-1.5-flash', temperature = 0.7 } = args;

    const geminiModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: {
        temperature: parseFloat(temperature),
        maxOutputTokens: 2048,
      }
    });

    const prompt = `${CANNABIS_KNOWLEDGE_BASE}

User query: ${message}

Respond as a knowledgeable cannabis consultant for Sage platform. Provide accurate, helpful information while being mindful of legal compliance and safety.`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      content: [
        {
          type: 'text',
          text: `🌿 **Sage Cannabis AI**: ${text}`
        }
      ]
    };
  }

  async handleRecommend(args) {
    const { need, experience = 'casual', preference = 'any' } = args;

    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let availableProducts = '';
    if (cannabisProducts.length > 0) {
      availableProducts = `\n\nAVAILABLE NJ PRODUCTS:\n${cannabisProducts.map(p => 
        `• ${p.name} (${p.brand}) - ${p.strain_type} - ${p.thc_percentage}% THC - $${p.price} - ${p.size}`
      ).join('\n')}`;
    }

    const prompt = `${CANNABIS_KNOWLEDGE_BASE}${availableProducts}

RECOMMENDATION REQUEST:
Need help with: ${need}
Experience level: ${experience}
Product preference: ${preference}

As a cannabis consultant for Sage/ZenLeaf in NJ, provide 3 specific product recommendations:

1. **Product Details**: Name, type, strain classification
2. **Potency**: THC/CBD percentages or mg amounts  
3. **Why it helps**: Specific effects for their need
4. **Dosing guidance**: Start low/go slow advice
5. **Usage tips**: Best time of day, consumption method

Include NJ legal compliance reminder and safety notes.`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      content: [
        {
          type: 'text',
          text: `🌿 **Cannabis Recommendations for "${need}"**:\n\n${text}`
        }
      ]
    };
  }

  async handleGenerate(args) {
    const { type, topic, length = 'medium' } = args;

    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = `${CANNABIS_KNOWLEDGE_BASE}\n\n`;

    switch(type) {
      case 'product-description':
        prompt += `Write a ${length} product description for: ${topic}. Include effects, THC content, terpenes, and usage suggestions. Make it engaging and informative for customers.`;
        break;
      case 'blog-post':
        prompt += `Write a ${length} educational blog post about: ${topic}. Make it informative, engaging, and suitable for cannabis consumers. Include scientific backing where appropriate.`;
        break;
      case 'email':
        prompt += `Write a ${length} promotional email for Sage/ZenLeaf dispensary about: ${topic}. Include compelling copy and a clear call-to-action.`;
        break;
      case 'education':
        prompt += `Create ${length} educational content about: ${topic}. Focus on helping users understand cannabis better. Include safety and legal compliance information.`;
        break;
      case 'strain-guide':
        prompt += `Create a ${length} strain guide for: ${topic}. Include genetics, effects, terpene profile, ideal use cases, and user experience descriptions.`;
        break;
      default:
        prompt += `Generate ${type} content about: ${topic}`;
    }

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      content: [
        {
          type: 'text',
          text: `📝 **Generated ${type} for "${topic}"**:\n\n${text}`
        }
      ]
    };
  }

  async handleAnalyze(args) {
    const { code, filename, feedback = false } = args;

    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = feedback 
      ? `Analyze this ${filename} file from a cannabis platform and provide improvement suggestions. Focus on cannabis-specific functionality, user experience, and code quality:\n\n${code}`
      : `Explain what this ${filename} file does in the context of a cannabis platform:\n\n${code}`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      content: [
        {
          type: 'text',
          text: `🔍 **Code Analysis for ${filename}**:\n\n${text}`
        }
      ]
    };
  }

  async handleStrainLookup(args) {
    const { strain_name, search_type = 'contains' } = args;

    let results = [];

    if (cannabisProducts.length > 0) {
      switch(search_type) {
        case 'exact':
          results = cannabisProducts.filter(p => 
            p.name.toLowerCase() === strain_name.toLowerCase()
          );
          break;
        case 'contains':
          results = cannabisProducts.filter(p => 
            p.name.toLowerCase().includes(strain_name.toLowerCase())
          );
          break;
        case 'effects':
          results = cannabisProducts.filter(p => 
            p.effects && p.effects.some(effect => 
              effect.toLowerCase().includes(strain_name.toLowerCase())
            )
          );
          break;
        case 'terpenes':
          results = cannabisProducts.filter(p => 
            p.dominant_terpene && p.dominant_terpene.toLowerCase().includes(strain_name.toLowerCase())
          );
          break;
      }
    }

    let responseText = `🔍 **Strain Lookup Results for "${strain_name}"**:\n\n`;

    if (results.length === 0) {
      responseText += `No products found matching "${strain_name}" using ${search_type} search.\n\n`;
      responseText += `Available strains: ${cannabisProducts.map(p => p.name).join(', ')}`;
    } else {
      results.forEach(product => {
        responseText += `**${product.name}** by ${product.brand}\n`;
        responseText += `• Type: ${product.strain_type} ${product.product_type}\n`;
        responseText += `• THC: ${product.thc_percentage}% | CBD: ${product.cbd_percentage}%\n`;
        responseText += `• Dominant Terpene: ${product.dominant_terpene}\n`;
        responseText += `• Effects: ${product.effects.join(', ')}\n`;
        responseText += `• Price: $${product.price} (${product.size})\n`;
        responseText += `• Description: ${product.description}\n\n`;
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: responseText
        }
      ]
    };
  }

  async run() {
    // Load cannabis data first
    await loadCannabisData();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🌿 Sage Gemini MCP Server running');
  }
}

const server = new GeminiMCPServer();
server.run().catch(console.error);