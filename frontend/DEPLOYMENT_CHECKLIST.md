# Netlify Deployment Checklist

## Pre-Deployment Checks

### 1. Code Quality
- [ ] Run `npm run build` locally - MUST pass without errors
- [ ] Run `npm run typecheck` if available
- [ ] Run `npm run lint` if configured
- [ ] Check all imports use correct syntax (default vs named exports)

### 2. Environment Variables
- [ ] Verify `.env.production` has correct values
- [ ] Ensure Netlify has all required env vars set:
  - `GEMINI_API_KEY`
  - `NEXT_PUBLIC_API_URL` 
  - Any other API keys

### 3. Dependencies
- [ ] Run `npm ci` to ensure clean install works
- [ ] Check no missing dependencies in package.json
- [ ] Verify all imports resolve correctly

### 4. Testing Steps
```bash
# Always run these before pushing:
npm ci                # Clean install
npm run build        # Build must succeed
npm run start        # Test production build locally
```

### 5. Common Issues & Fixes

#### Import Errors
- Check if using default export: `import Component from './Component'`
- Check if using named export: `import { Component } from './Component'`
- Match the export style in the source file

#### Type Errors
- Ensure TypeScript types are defined
- Check for missing type definitions
- Run `npm run typecheck` locally

#### Build Cache Issues
- Clear Netlify cache if needed (in deploy settings)
- Update dependencies if stale

### 6. Git Workflow
```bash
# Before pushing to production:
git status           # Check what's being committed
npm run build       # Ensure build passes
git add -A
git commit -m "descriptive message"
git push origin master
```

### 7. Post-Deployment
- [ ] Check Netlify dashboard for deploy status
- [ ] Verify site loads correctly
- [ ] Test key functionality
- [ ] Check browser console for errors

## Quick Command Reference
```bash
# Development
npm run dev         # Start dev server

# Production Testing
npm run build      # Build for production
npm run start      # Test production build

# Deployment
git add -A
git commit -m "message"
git push origin master
```

## Netlify Settings
- Build command: `npm ci && npm run build`
- Publish directory: `.next` or `out`
- Node version: 18+ (set in netlify.toml)

## Emergency Rollback
If deployment fails:
1. Check deploy logs in Netlify dashboard
2. Revert to previous deploy if needed
3. Fix locally, test thoroughly, redeploy