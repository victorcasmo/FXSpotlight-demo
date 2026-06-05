# FXSpotlight Deployment Guide

## ✅ Deployment Status: PRODUCTION READY

The FXSpotlight application is now fully configured for deployment to any domain or web platform.

---

## Quick Deployment Checklist

- ✅ Production build successful (`npm run build`)
- ✅ No hardcoded localhost references
- ✅ API endpoints use relative paths (`/api/audit`)
- ✅ Vite configured for all domains
- ✅ Environment variables properly configured
- ✅ CORS headers enabled for API endpoints
- ✅ Vercel configuration ready (`vercel.json`)
- ✅ `.vercelignore` excludes dev files

---

## Required Environment Variables

Before deploying, ensure these environment variables are set in your deployment platform:

```
GEMINI_API_KEY=your_google_gemini_api_key_here
```

**Get your API key:**
1. Visit https://aistudio.google.com
2. Create a free Google account if needed
3. Click "Create API Key" and select a Google Cloud project
4. Copy the API key
5. Add it to your deployment platform's environment variables

---

## Deployment Platforms

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set `GEMINI_API_KEY` in Environment Variables
3. Deploy automatically on push
4. API routes automatically handled at `/api/audit`

**Command:**
```bash
vercel deploy
```

### Other Platforms (Docker, Node.js hosting, etc.)

1. Build the static frontend:
```bash
npm run build
```

2. Set environment variables in your platform

3. Serve the `/dist` folder as static content

4. Ensure `/api/audit` requests route to the serverless function

---

## Development

### Local Development
```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

### Production Build
```bash
npm run build
npm run preview
```

---

## Architecture

### Frontend
- React + Vite
- Static SPA built to `/dist`
- Relative API endpoints for cross-domain compatibility

### Backend
- Serverless function at `/api/audit.js`
- Uses Google Gemini API for trade decision analysis
- Handles CORS for cross-domain requests

### Configuration Files

- **vite.config.js** - Vite configuration with allowedHosts for all domains
- **vercel.json** - Vercel deployment configuration with rewrites and CORS headers
- **.vercelignore** - Excludes development files from Vercel builds
- **package.json** - NPM scripts for dev/build/preview

---

## Troubleshooting

### "API key not configured" Error
- Ensure `GEMINI_API_KEY` is set in your deployment environment
- Check that the value is not empty or a placeholder
- Restart your deployment after updating the environment variable

### CORS Errors
- Verify CORS headers are enabled (see vercel.json)
- Ensure API endpoint is at `/api/audit` path
- Check that `Access-Control-Allow-Origin` includes your domain

### Build Failures
- Clear cache: `rm -rf dist node_modules`
- Reinstall: `npm install`
- Rebuild: `npm run build`
- Check Node version compatibility (v16+)

### Form Not Submitting
- Check browser console for errors
- Verify API endpoint is reachable at `/api/audit`
- Ensure GEMINI_API_KEY is set correctly
- Check network tab for API response

---

## Performance

**Build Output:**
- Frontend bundle: ~55KB gzipped
- Total assets: <300KB
- Lightning fast load times

**Optimization:**
- Vite builds optimized production bundles
- Code splitting for faster loading
- Minimal dependencies (React only)

---

## Security

✅ No hardcoded API keys in code
✅ Environment variables used for sensitive data
✅ CORS properly configured
✅ No sensitive data in frontend bundle
✅ API key only used on backend

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error messages in browser console
3. Check deployment platform logs
4. Verify environment variables are set correctly

---

## Version Info

- React: 18.2.0
- Vite: 4.5.14
- Node: 16+ recommended
- Built: 2026-06-05
