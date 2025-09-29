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

## Rollback Plan

If issues occur after deployment:
```bash
git revert HEAD  # Revert the cache header changes
git push origin develop
# Redeploy
```

## Files Modified

- `/next.config.js` - Image optimization settings
- `/src/middleware.ts` - Cache header configuration
- `/src/app/layout.tsx` - Viewport settings
- All components with `<Image>` tags - Added unoptimized prop