import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const url = request.nextUrl
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'

  // Remove all problematic headers first (including Cloudflare's and deprecated headers)
  response.headers.delete('Cache-Control')
  response.headers.delete('X-Nextjs-Cache')
  response.headers.delete('X-Middleware-Cache')
  response.headers.delete('CF-Cache-Status')
  response.headers.delete('Expires')
  response.headers.delete('Pragma')
  
  // Force override Cloudflare cache headers in production
  if (isProduction) {
    response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=1, stale-while-revalidate=59')
    response.headers.set('CDN-Cache-Control', 'max-age=60')
    response.headers.set('Cloudflare-CDN-Cache-Control', 'max-age=60')
  }
  
  // Handle Next.js Image Optimization API - force better headers
  if (url.pathname.startsWith('/_next/image')) {
    // Use private cache without must-revalidate
    response.headers.set('Cache-Control', 'private, max-age=3600')
    return response
  }

  // In development, use simpler cache headers to avoid warnings
  if (isDevelopment) {
    // For HTML pages and routes, use private cache
    if (url.pathname.startsWith('/products') || 
        url.pathname === '/' || 
        !url.pathname.includes('.')) {
      response.headers.set('Cache-Control', 'private, max-age=0')
    }
    // For API routes
    else if (url.pathname.startsWith('/api/')) {
      response.headers.set('Cache-Control', 'private, no-cache')
    }
    // For static assets
    else if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp|css|js)$/i)) {
      response.headers.set('Cache-Control', 'public, max-age=3600')
    }
    // For Next.js static files
    else if (url.pathname.startsWith('/_next/static')) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    }
    // Default for other files
    else {
      response.headers.set('Cache-Control', 'private, max-age=0')
    }
    return response
  }

  // Production-specific caching
  if (isProduction) {
    // Static files (logo, favicon, etc.)
    if (url.pathname.match(/\/(logo\.png|favicon\.ico|manifest\.json|robots\.txt)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200')
      // Explicitly remove Expires header for static assets
      response.headers.delete('Expires')
    }
    // API routes
    else if (url.pathname.startsWith('/api/')) {
      if (url.pathname.startsWith('/api/ai/') || url.pathname.startsWith('/api/products/')) {
        // Dynamic API endpoints - no cache but without problematic directives
        response.headers.set('Cache-Control', 'private, max-age=0')
      } else if (url.pathname.startsWith('/api/health')) {
        // Health check - short cache
        response.headers.set('Cache-Control', 'public, max-age=60')
      } else {
        // Other API endpoints
        response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=600')
      }
    }
    // Static CSS and JS files
    else if (url.pathname.includes('/_next/static/')) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    }
    // Images and other static assets
    else if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) {
      response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
    }
    // HTML pages
    else if (!url.pathname.includes('.')) {
      response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=1, stale-while-revalidate=59')
    }
    return response
  }

  // API routes - appropriate caching (development)
  if (url.pathname.startsWith('/api/')) {
    if (url.pathname.startsWith('/api/ai/') || url.pathname.startsWith('/api/products/')) {
      // Dynamic API endpoints - private, no cache
      response.headers.set('Cache-Control', 'private, no-cache')
    } else if (url.pathname.startsWith('/api/health')) {
      // Health check - short cache
      response.headers.set('Cache-Control', 'public, max-age=60')
    } else {
      // Other API endpoints - private cache with revalidation
      response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=600')
    }
  }
  // Static JSON data (like manifest.json)
  else if (url.pathname.endsWith('.json')) {
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  }
  // Images and static assets
  else if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp)$/i)) {
    response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
  }
  // CSS and JS files
  else if (url.pathname.match(/\.(css|js)$/i)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  // HTML pages - use stale-while-revalidate for better performance
  else if (!url.pathname.includes('_next')) {
    response.headers.set('Cache-Control', 'public, max-age=0, stale-while-revalidate=60')
  }

  // Static assets from MinIO - longer cache
  if (url.pathname.includes('/inventiq-assets/')) {
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  }

  // Remove problematic headers
  response.headers.delete('X-Powered-By')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths including image optimization
     * to fix cache headers
     */
    '/(.*)',
  ],
}