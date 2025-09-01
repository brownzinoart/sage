# Sage Deployment Guide

## Backend Deployment (Railway)

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up

2. **Install Railway CLI** (if not already installed):
   ```bash
   npm install -g @railway/cli
   ```

3. **Deploy Backend**:
   ```bash
   cd backend
   railway login
   railway link  # Create new project or link existing
   railway up    # Deploy your backend
   ```

4. **Set Environment Variables** in Railway Dashboard:
   - Go to your project in Railway
   - Click on Variables tab
   - Add these variables:
     ```
     GEMINI_API_KEY=your-gemini-api-key-here
     SECRET_KEY=your-secret-key-here
     DEBUG=False
     ```

5. **Note Your Backend URL**: Railway will provide a URL like `https://your-app.railway.app`

## Frontend Deployment (Vercel)

### Step 2: Deploy Frontend to Vercel

1. **Push to GitHub** (if not already):
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Frontend ready for deployment"
   gh repo create sage-frontend --public
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set environment variable:
     - `NEXT_PUBLIC_API_URL` = Your Railway backend URL from Step 1

3. **Alternative: Deploy via CLI**:
   ```bash
   cd frontend
   npm i -g vercel
   vercel
   # Follow prompts, set NEXT_PUBLIC_API_URL when asked
   ```

## Quick Deploy Commands

### Backend (Railway):
```bash
cd backend
railway up
```

### Frontend (Vercel):
```bash
cd frontend
vercel --prod
```

## Environment Variables Reference

### Backend (.env):
- `GEMINI_API_KEY`: Your Google Gemini API key
- `SECRET_KEY`: Secret for JWT tokens
- `DEBUG`: Set to False in production
- `PORT`: Railway sets this automatically

### Frontend (.env.production):
- `NEXT_PUBLIC_API_URL`: Your Railway backend URL

## Testing Your Deployment

1. **Test Backend**:
   ```bash
   curl https://your-backend.railway.app/health
   ```

2. **Test Frontend**: Visit your Vercel URL and check the Sage chat works

## Troubleshooting

### Backend Issues:
- Check Railway logs: `railway logs`
- Ensure all environment variables are set
- Verify Python version matches runtime.txt (3.11.5)

### Frontend Issues:
- Check Vercel build logs
- Ensure NEXT_PUBLIC_API_URL is set correctly
- Verify CORS settings allow your Vercel domain

### CORS Configuration:
If you get CORS errors, update backend/main_simple.py to include your Vercel domain:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Next Steps

1. Set up custom domains
2. Configure monitoring (Railway provides basic metrics)
3. Set up error tracking (Sentry)
4. Configure auto-deploy on git push