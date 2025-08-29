#!/bin/bash

echo "🚀 Sage Deployment Script"
echo "========================"

# Backend Deployment
echo ""
echo "📦 BACKEND DEPLOYMENT (Railway)"
echo "------------------------------"
echo "1. First, login to Railway:"
echo "   railway login"
echo ""
echo "2. Deploy backend:"
cd backend
railway link
railway up
cd ..

echo ""
echo "✅ Backend deployed! Note your Railway URL."
echo ""

# Frontend Deployment  
echo "📦 FRONTEND DEPLOYMENT (Vercel)"
echo "-------------------------------"
echo "1. Update .env.production with your Railway URL"
echo "2. Deploy to Vercel:"
cd frontend
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set GEMINI_API_KEY in Railway dashboard"
echo "2. Update NEXT_PUBLIC_API_URL in Vercel dashboard"
echo "3. Test your endpoints"