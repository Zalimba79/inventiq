import { NextRequest, NextResponse } from 'next/server'

/**
 * API Proxy for MinIO images to avoid mixed content errors
 * This proxies HTTP MinIO images through the HTTPS Next.js server
 * 
 * Usage: /api/proxy/image?url=http://10.2.200.102:9000/inventiq-assets/...
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')
    
    if (!url) {
      return new NextResponse('Missing URL parameter', { status: 400 })
    }
    
    // Security: Only allow MinIO URLs
    if (!url.includes('10.2.200.102:9000') && !url.includes('inventiq-assets')) {
      return new NextResponse('Invalid URL', { status: 403 })
    }
    
    // Fetch the image from MinIO
    const response = await fetch(url, {
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { 
        status: response.status 
      })
    }
    
    const contentType = response.headers.get('Content-Type') || 'image/jpeg'
    const buffer = await response.arrayBuffer()
    
    // Return the image with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    
    if (error instanceof Error && error.name === 'AbortError') {
      return new NextResponse('Request timeout', { status: 504 })
    }
    
    return new NextResponse('Internal server error', { status: 500 })
  }
}

// Support preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}