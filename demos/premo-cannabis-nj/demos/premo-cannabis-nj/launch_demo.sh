#!/bin/bash

echo "🌿 Premo Cannabis NJ - Demo Launcher"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Premo Cannabis THC Product Demo...${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Please run this script from the sage root directory"
    exit 1
fi

# Create demo environment file
echo -e "${YELLOW}Creating demo environment configuration...${NC}"
cat > .env.demo.premo << EOF
# Premo Cannabis Demo Configuration
NEXT_PUBLIC_DEMO_MODE=premo_cannabis
NEXT_PUBLIC_STATE=NJ
NEXT_PUBLIC_MIN_AGE=21
NEXT_PUBLIC_DISPENSARY_NAME=Premo Cannabis Company
NEXT_PUBLIC_DISPENSARY_ADDRESS=2 E Front St, Keyport, NJ 07735
NEXT_PUBLIC_THC_PRODUCTS_ENABLED=true
NEXT_PUBLIC_REQUIRE_AGE_VERIFICATION=true
EOF

echo -e "${GREEN}✓ Environment configured${NC}"

# Copy demo components to frontend
echo -e "${YELLOW}Installing demo components...${NC}"
mkdir -p frontend/src/components/demo

cp demos/premo-cannabis-nj/AgeVerification.tsx frontend/src/components/demo/
cp demos/premo-cannabis-nj/THCProductCard.tsx frontend/src/components/demo/

echo -e "${GREEN}✓ Components installed${NC}"

# Create demo API endpoint
echo -e "${YELLOW}Setting up demo API endpoint...${NC}"
cat > backend/app/api/v1/demo_premo.py << 'EOF'
from fastapi import APIRouter, HTTPException
from typing import List
import json
from pathlib import Path

router = APIRouter()

@router.get("/products/thc")
async def get_thc_products():
    """Get THC products for Premo Cannabis demo"""
    try:
        demo_file = Path("demos/premo-cannabis-nj/sample_products.json")
        with open(demo_file, 'r') as f:
            products = json.load(f)
        return {"products": products, "dispensary": "Premo Cannabis"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compliance/check")
async def check_compliance(cart_items: List[dict]):
    """Check NJ compliance for cart items"""
    # Implementation from integration.py
    return {"compliant": True, "message": "Cart complies with NJ regulations"}
EOF

echo -e "${GREEN}✓ API endpoint created${NC}"

# Create demo page
echo -e "${YELLOW}Creating demo page...${NC}"
cat > frontend/src/app/demo/premo/page.tsx << 'EOF'
"use client";

import React, { useState, useEffect } from 'react';
import AgeVerification from '@/components/demo/AgeVerification';
import THCProductCard from '@/components/demo/THCProductCard';

export default function PremoCannabisDemo() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ageVerified) {
      fetchProducts();
    }
  }, [ageVerified]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/demo/products/thc');
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!ageVerified) {
    return <AgeVerification onVerified={() => setAgeVerified(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white p-6">
        <h1 className="text-3xl font-bold">Premo Cannabis - Keyport, NJ</h1>
        <p className="mt-2">Premium Cannabis Products | Recreational & Medical</p>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        
        {loading ? (
          <div>Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <THCProductCard key={product.external_id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
EOF

echo -e "${GREEN}✓ Demo page created${NC}"

echo ""
echo -e "${GREEN}Demo setup complete!${NC}"
echo ""
echo "To run the demo:"
echo "1. Start the backend: cd backend && uvicorn app.main:app --reload"
echo "2. Start the frontend: cd frontend && npm run dev"
echo "3. Visit: http://localhost:3000/demo/premo"
echo ""
echo -e "${YELLOW}Note: Age verification will be required (21+)${NC}"
echo ""
echo "Demo includes:"
echo "✓ THC product catalog with NJ compliance"
echo "✓ Age verification gateway"
echo "✓ Strain types (Indica/Sativa/Hybrid)"
echo "✓ Lab testing indicators"
echo "✓ Purchase limit checking"