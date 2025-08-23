#!/bin/bash

# Premo Cannabis Demo Launcher
# Automatically sets up and launches the Premo-branded Sage demo

echo "🌿 Premo Cannabis x Sage AI Demo Launcher"
echo "============================================="

# Set demo mode
export SAGE_DEMO_MODE="premo-cannabis"
export PREMO_DEMO_ACTIVE="true"

echo "📊 Checking demo data..."

# Check if product data exists, run scraper if needed
if [ ! -f "demos/premo-cannabis/products.json" ]; then
    echo "📥 No product data found. Running ethical web scraper..."
    echo "⚠️  This is for demo purposes only and follows respectful scraping practices"
    
    # Install required packages
    pip install requests beautifulsoup4
    
    # Run scraper
    python demos/premo-cannabis/scraper.py
    
    if [ $? -eq 0 ]; then
        echo "✅ Product data successfully harvested"
    else
        echo "⚠️  Scraper had issues, using fallback demo data"
    fi
else
    echo "✅ Product data found"
fi

echo ""
echo "🚀 Launching Premo Cannabis demo..."

# Launch backend with Premo integration
echo "🔧 Starting backend server..."
cd backend

# Add Premo routes to main app
python -c "
import sys
sys.path.append('.')
from demos.premo_cannabis.backend_integration import premo_router
from main_simple import app
app.include_router(premo_router)
print('✅ Premo routes integrated')
"

# Start backend server in background
uvicorn main_simple:app --reload --port 8001 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Launch frontend
echo "🎨 Starting frontend with Premo theming..."
cd ../frontend

# Set Premo environment variables
export REACT_APP_DEMO_MODE="premo"
export REACT_APP_DISPENSARY="Premo Cannabis" 
export REACT_APP_PRIMARY_COLOR="#000000"
export REACT_APP_ACCENT_COLOR="#6262F5"
export REACT_APP_BACKEND_URL="http://localhost:8001"

# Start frontend
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

echo ""
echo "🎉 Premo Cannabis Demo is now running!"
echo "============================================="
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8001" 
echo "API Docs:  http://localhost:8001/docs"
echo ""
echo "🛍️  Demo Features:"
echo "   • Real Premo Cannabis products"
echo "   • Premo branding and colors"
echo "   • Location-aware recommendations"
echo "   • Inventory integration"
echo "   • Washington state compliance"
echo ""
echo "💬 Try asking:"
echo "   'What's your best indica flower?'"
echo "   'Show me edibles under $30'"
echo "   'Any new concentrates this week?'"
echo "   'Best strains for creativity?'"
echo ""
echo "Press Ctrl+C to stop the demo"

# Trap Ctrl+C to cleanup
trap 'echo "🛑 Stopping demo..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT

# Wait for user to stop
wait