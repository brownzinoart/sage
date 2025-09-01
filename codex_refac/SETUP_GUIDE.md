# ZenLeaf Neptune Demo Setup Guide

Welcome to the ZenLeaf Neptune cannabis dispensary demo! This guide will help you get the demo running locally.

## Quick Setup

### 1. Install Dependencies
```bash
# Install root dependencies (for Gemini MCP server)
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies  
cd backend && pip install -r requirements.txt && cd ..
```

### 2. Configure API Keys
```bash
# Copy the environment template
cp .env.local .env

# Edit .env and add your Gemini API key
# Get your key from: https://makersuite.google.com/app/apikey
```

Replace `your_gemini_api_key_here` with your actual Gemini API key in the `.env` file.

### 3. Start the Demo
```bash
# Terminal 1: Start backend server
cd backend && source venv/bin/activate && python -m uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend development server  
cd frontend && npm run dev

# Optional Terminal 3: Test Gemini MCP server
npm run mcp
```

### 4. Access the Demo
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Features Included

### 🏪 **ZenLeaf Neptune Branding**
- Authentic ZenLeaf Neptune location branding
- Store hours, location, and contact information
- "Relax. Recharge. Refresh." messaging

### 🌿 **Authentic Product Catalog**
- 12 real cannabis products from top NJ brands:
  - **Verano Reserve**: Mag Landrace, Wedding Cake, Purple Punch, OG Kush Live Resin
  - **(the) Essence**: Super Lemon Haze, Grape Ape Pre-Rolls, Sour Diesel
  - **On The Rocks**: Lemon Skunk Cartridge, Green Crack Disposable
  - **Encore**: Berry Bliss Gummies
  - **Savvy**: Calm Tincture, Relief Balm

### 🤖 **AI-Powered Cannabis Consultation**
- Gemini AI with specialized cannabis knowledge
- Strain recommendations based on effects needed
- THC potency guidance by experience level
- Terpene education and effect matching

### 🔧 **MCP Integration**
- Custom Gemini MCP server for Claude Code integration
- 5 specialized tools: chat, recommend, generate, analyze, strain_lookup
- Real-time access to ZenLeaf product database
- Cannabis-specific knowledge base

## Testing the Demo

### Search Products
Try searching for:
- "sleep" → Returns indica strains like Mag Landrace and Calm Tincture
- "energy" → Returns sativa strains like Super Lemon Haze
- "Verano" → Returns Verano Reserve premium products

### AI Consultation
Ask questions like:
- "What's good for sleep?"
- "I'm new to cannabis, what should I try?"
- "Highest THC flower available?"
- "Best edibles for beginners?"

### Product Categories
Browse by:
- **Strain Type**: Indica, Sativa, Hybrid
- **Product Type**: Flower, Vapes, Edibles, Concentrates
- **THC Level**: Low (15-20%), Medium (20-25%), High (25%+)

## Deployment Ready

The demo is configured for easy deployment to:
- **Netlify** (frontend) - builds automatically from git
- **Railway/Heroku** (backend) - containerized FastAPI
- **Vercel** (full-stack) - serverless functions

## Architecture

```
ZenLeaf Neptune Demo
├── Frontend (Next.js + Tailwind)
│   ├── AI-powered cannabis consultation
│   ├── Product search and filtering  
│   ├── ZenLeaf Neptune branding
│   └── Responsive design
├── Backend (FastAPI + Python)
│   ├── Cannabis product database
│   ├── AI consultation endpoints
│   ├── Search and recommendation engine
│   └── NJ compliance features
└── MCP Server (Node.js)
    ├── Gemini AI integration
    ├── Cannabis knowledge base
    ├── Product recommendations
    └── Claude Code integration
```

## Support

For questions or issues:
1. Check the API documentation at http://localhost:8000/docs
2. Review the console logs for error messages
3. Ensure your Gemini API key is valid and has quota

## License

Built for ZenLeaf Neptune demonstration purposes. 
Cannabis compliance for New Jersey adult use recreational market.