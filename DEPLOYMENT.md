# Deployment Guide - Cache Header Fixes

## Problem
The production site (inventoscan.mindbit.net) shows cache-control warnings with `must-revalidate` and `no-store` directives that are not recommended for performance.

## Solution Applied
We've implemented comprehensive fixes to eliminate these warnings:

### 1. Changes Made

#### Image Optimization (`next.config.js`)
- Set `unoptimized: true` to bypass Next.js image optimization
- Added `unoptimized` prop to all Image components
- Images now load directly without `/_next/image` processing

#### Cache Headers (`src/middleware.ts`)
- Production-specific cache rules without problematic directives
- Removes deprecated `Expires` and `Pragma` headers
- Removes Cloudflare's default headers
- Sets clean cache headers for all resource types:
  - APIs: `private, max-age=0` (no must-revalidate)
  - Static assets: `public, max-age=31536000, immutable`
  - HTML pages: `public, max-age=0, s-maxage=1, stale-while-revalidate=59`
  - Static files (logo.png): `public, max-age=86400` (no Expires header)

#### Accessibility (`src/app/layout.tsx`)
- Removed `maximumScale: 1` from viewport to allow zooming

### 2. Deployment Steps

```bash
# 1. Ensure all changes are committed
git add -A
git status  # Verify all changes are staged

# 2. Commit with descriptive message
git commit -m "fix: eliminate cache-control warnings and improve performance

- Remove must-revalidate and no-store directives
- Implement production-specific cache headers
- Bypass Next.js image optimization to avoid problematic headers
- Fix viewport for accessibility"

# 3. Push to your branch
git push origin develop  # or your current branch

# 4. Create pull request if needed
# 5. Deploy to production
```

### 3. Cloudflare Configuration (if applicable)

If you're using Cloudflare, you may also need to:

1. **Page Rules**: Create a page rule for `inventoscan.mindbit.net/*`
   - Cache Level: Standard
   - Edge Cache TTL: Respect Existing Headers

2. **Transform Rules**: Add a Response Header Modification rule
   - Remove headers: `must-revalidate`, `no-store`
   - This ensures Cloudflare doesn't add these back

### 4. Verification After Deployment

Once deployed, verify the fixes:

1. Open Chrome DevTools
2. Go to Network tab
3. Load https://inventoscan.mindbit.net/products/draft
4. Check Response Headers for:
   - No `must-revalidate` directive
   - No `no-store` directive
   - Clean cache headers as configured

### 5. Expected Results

After deployment, you should see:
- ✅ No cache-control warnings in browser console
- ✅ Images loading directly (not through /_next/image)
- ✅ Better performance with proper caching
- ✅ Zoom functionality enabled on mobile

## Important Notes

- The local development server (localhost:3000) already has these fixes
- Production warnings will persist until deployment
- Cloudflare may override headers - use Transform Rules if needed
- Monitor performance after deployment to ensure improvements

## Known Browser Compatibility Notes

- **Firefox**: 
  - The `fetchpriority` attribute on preload links is not supported but is safely ignored. This is a Next.js optimization that doesn't affect functionality.
  - The `theme-color` meta tag is not supported on desktop Firefox but works on mobile Firefox. It's used for PWA theming in supported browsers.
  - The `text-size-adjust` CSS property is not natively supported but vendor prefixes (`-webkit-text-size-adjust`, `-moz-text-size-adjust`) are used in globals.css.

## Rollback Plan

If issues occur after deployment:
```bash
git revert HEAD  # Revert the cache header changes
git push origin develop
# Redeploy
```

## Files Modified

- `/next.config.js` - Removed global `unoptimized: true` to fix hydration issues
- `/src/middleware.ts` - Comprehensive cache header configuration for production
- `/src/app/layout.tsx` - Removed `maximumScale: 1` for accessibility
- `/src/components/layout/Navigation.tsx` - Changed logo from `<Image>` to `<img>` tag
- Multiple components - Added `unoptimized` prop to individual `<Image>` components
- `/src/app/globals.css` - Browser compatibility with vendor prefixes

## Mixed Content Fix for MinIO Images

### Problem
Production site (HTTPS) cannot load MinIO images (HTTP) due to browser mixed content security restrictions.

### Solutions

#### Option 1: Use HTTPS Proxy for MinIO (Recommended)
Configure a reverse proxy (nginx/Cloudflare) to serve MinIO over HTTPS:
```nginx
server {
    listen 443 ssl;
    server_name minio.inventoscan.mindbit.net;
    
    location / {
        proxy_pass http://10.2.200.102:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Then update production environment:
```env
S3_PUBLIC_URL=https://minio.inventoscan.mindbit.net
```

#### Option 2: Use Cloudflare Tunnel
Set up Cloudflare tunnel to expose MinIO securely:
1. Install cloudflared on MinIO server
2. Create tunnel: `cloudflared tunnel create minio-inventiq`
3. Configure tunnel to point to localhost:9000
4. Update S3_PUBLIC_URL to use Cloudflare tunnel URL

#### Option 3: Configure MinIO with SSL Certificate
1. Generate SSL certificate for MinIO
2. Configure MinIO to use HTTPS
3. Update S3_ENDPOINT and S3_PUBLIC_URL to use https://

#### Option 4: Use Next.js API Proxy (Temporary)
Create an API route to proxy images through the Next.js server:
```typescript
// /api/proxy/image/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url)
  const imageUrl = url.searchParams.get('url')
  
  if (!imageUrl?.includes('10.2.200.102:9000')) {
    return new Response('Invalid URL', { status: 400 })
  }
  
  const response = await fetch(imageUrl)
  const buffer = await response.arrayBuffer()
  
  return new Response(buffer, {
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000'
    }
  })
}
```

## Current Status (2025-09-29)

### ✅ Fixed Locally
- Cache-control warnings eliminated through middleware configuration
- Viewport accessibility issue resolved
- Image hydration mismatches fixed
- Logo properly loading without Next.js Image optimization
- Browser compatibility warnings documented

### ⏳ Awaiting Production Deployment
The following issues will be resolved once changes are deployed to production:
1. Cache-control headers with `must-revalidate` and `no-store` directives
2. Deprecated `Expires` and `Pragma` headers
3. Proper cache headers for all resource types

### 🚨 Critical: Mixed Content Issue on Production
**Problem**: HTTPS site (inventoscan.mindbit.net) cannot load HTTP MinIO images (10.2.200.102:9000)

**Immediate Fix Applied**: 
- Created `/api/proxy/image` route to proxy HTTP images through HTTPS
- Added `getSecureImageUrl()` utility function
- Updated `DraftProductCard` component to use secure URLs

**Production Environment Variable Needed**:
```env
# For production, configure one of these:
# Option 1: HTTPS proxy for MinIO
S3_PUBLIC_URL=https://minio.inventoscan.mindbit.net

# Option 2: Use Cloudflare tunnel
S3_PUBLIC_URL=https://minio-tunnel.inventoscan.mindbit.net

# Current (causes mixed content):
# S3_PUBLIC_URL=http://10.2.200.102:9000
```

### 📝 Post-Deployment Checklist
- [ ] Deploy changes to production environment
- [ ] Clear Cloudflare cache if applicable
- [ ] Verify cache headers in Chrome DevTools Network tab
- [ ] Check for any remaining console warnings
- [ ] Monitor performance metrics
- [ ] Update Cloudflare Transform Rules if headers are still overridden