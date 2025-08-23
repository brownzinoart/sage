# Premo Cannabis Demo Integration

This demo branch showcases Sage AI integrated with **Premo Cannabis** products and branding.

## 🌿 Demo Overview

- **Dispensary**: [Premo Cannabis](https://premocannabis.co)
- **Location**: Multiple locations in Washington State
- **Products**: 10+ categories including flower, edibles, concentrates
- **Features**: Real product data, branded experience, inventory simulation

## 🚀 Quick Start

### 1. Run the Product Scraper (Optional)
```bash
cd demos/premo-cannabis
python scraper.py
```

### 2. Launch Premo-Branded Sage
```bash
# Set demo mode
export SAGE_DEMO_MODE=premo-cannabis

# Start backend with Premo products
cd ../../backend
python -m uvicorn main:app --reload --port 8001

# Start frontend with Premo branding  
cd ../frontend
npm run dev:premo
```

### 3. Access the Demo
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **Premo Products**: http://localhost:8001/api/v1/products/premo

## 🎯 Demo Features

### Sage AI Integration
- ✅ **Real Product Recommendations** from Premo's actual inventory
- ✅ **Branded Chat Experience** with Premo colors/styling
- ✅ **Location-Aware Responses** for Washington state laws
- ✅ **Inventory Integration** - "We have 247 products in stock"
- ✅ **Price-Aware Recommendations** with real pricing
- ✅ **Category Suggestions** based on Premo's actual categories

### Product Data
- **10 Categories**: Flower, Pre-Rolls, Edibles, Concentrates, etc.
- **Rich Metadata**: THC/CBD percentages, terpene profiles, lab results
- **Real Brands**: Actual brands sold at Premo Cannabis
- **Live Pricing**: Current pricing from their menu
- **Product Images**: Actual product photography

### Branding & UX
- **Premo Colors**: Black (#000000) primary, Purple (#6262F5) accents
- **Custom Styling**: Matches Premo's sophisticated, dark aesthetic
- **Location Context**: References Premo locations and Washington laws
- **Inventory Simulation**: Realistic stock levels and availability

## 📊 Data Structure

### Product Schema
```json
{
  "name": "Blue Dream - Flower",
  "category": "flower",
  "brand": "Premo House",
  "price": "$45.00",
  "thc_percentage": 22.5,
  "cbd_percentage": 0.8,
  "description": "Classic sativa-dominant hybrid...",
  "terpenes": [
    {"name": "Myrcene", "percentage": 1.2},
    {"name": "Limonene", "percentage": 0.8}
  ],
  "lab_tested": true,
  "in_stock": true,
  "rating": 4.7,
  "review_count": 89
}
```

### Demo Configuration
```json
{
  "dispensary": {
    "name": "Premo Cannabis",
    "branding": {
      "primaryColor": "#000000",
      "accentColor": "#6262F5"
    },
    "location": {
      "state": "Washington"
    }
  }
}
```

## 🎨 Visual Customization

### Premo Branding Applied
- **Header**: Premo Cannabis logo and colors
- **Chat Bubbles**: Dark theme with purple accents
- **Product Cards**: Premo-styled product displays
- **Loading Screens**: "Premo's AI budtender is thinking..."
- **Legal Disclaimers**: Washington-specific compliance text

## 🔧 Technical Architecture

### Frontend Integration
```typescript
// Premo-specific product service
import { premoProducts } from '@/data/premo-products.json'
import { premoConfig } from '@/config/premo-config.json'

// Dynamic theming
const premoTheme = {
  colors: premoConfig.branding,
  products: premoProducts
}
```

### Backend Integration  
```python
# Load Premo products
@app.get("/api/v1/products/premo")
async def get_premo_products():
    return load_demo_products("premo-cannabis")

# Premo-aware Sage responses
def generate_premo_response(query: str):
    # Reference actual Premo inventory
    # Apply Premo branding and voice
    # Include location-specific info
```

## 📈 Demo Script

### Sales Presentation Flow
1. **Introduction**: "This is Sage AI integrated with Premo Cannabis..."
2. **Product Query**: Ask about specific products Premo actually sells
3. **Inventory Demo**: "We have this in stock at our Seattle location"
4. **Brand Showcase**: Demonstrate knowledge of Premo's brand partners
5. **Legal Compliance**: Show Washington-specific guidance
6. **Analytics**: "Sage has processed 1,247 customer queries for Premo"

### Example Queries
- "What's your best flower under $40?"
- "Do you have any high-CBD edibles?"
- "What's in stock for delivery today?"
- "Tell me about your concentrate selection"

## ⚖️ Compliance & Ethics

- ✅ **Respectful Scraping**: 2-second delays, limited requests
- ✅ **Demo Purpose Only**: Not for production/commercial use
- ✅ **Data Privacy**: No personal customer information scraped
- ✅ **Robots.txt Compliant**: Follows website scraping guidelines
- ✅ **Fair Use**: Educational/demonstration purposes

## 🔄 Updating Demo Data

```bash
# Refresh Premo product data
python scraper.py

# Update branding/config
vim config.json

# Deploy updated demo
git add . && git commit -m "Update Premo demo data"
```

---

**Ready to showcase Sage AI with real dispensary integration!** 🚀

This demo proves that Sage can seamlessly integrate with any dispensary's existing inventory and provide customers with personalized, intelligent product recommendations.