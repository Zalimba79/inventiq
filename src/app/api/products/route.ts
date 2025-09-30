import { NextRequest, NextResponse } from 'next/server'
import { ProductStatus } from '@prisma/client'

import prisma from '@/lib/prisma'

// Helper function to transform URLs for HTTPS contexts
function transformImageUrls(products: any[], request: NextRequest) {
  const isHTTPS = request.headers.get('x-forwarded-proto') === 'https' || 
                   request.nextUrl.protocol === 'https:'
  
  if (!isHTTPS) return products
  
  return products.map(product => ({
    ...product,
    photos: product.photos?.map((photo: any) => {
      // Transform HTTP MinIO URLs to use proxy when on HTTPS
      const transformUrl = (url: string | null) => {
        if (!url || url.startsWith('https://')) return url
        if (url.includes('10.2.200.102:9000')) {
          // Use the proxy endpoint for HTTP images
          const origin = request.headers.get('origin') || 
                        `${request.nextUrl.protocol}//${request.headers.get('host')}`
          return `${origin}/api/proxy/image?url=${encodeURIComponent(url)}`
        }
        return url
      }
      
      return {
        ...photo,
        url: transformUrl(photo.url),
        thumbnailUrl: transformUrl(photo.thumbnailUrl)
      }
    })
  }))
}

// GET /api/products - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as ProductStatus | null
    const userId = searchParams.get('userId') || 'default-user'

    const products = await prisma.product.findMany({
      where: {
        ...(status && { status }),
        userId,
      },
      include: {
        photos: {
          orderBy: [
            { isPrimary: 'desc' },  // Primary photos first
            { createdAt: 'asc' }    // Then by creation time
          ]
        },
        tags: true,
        _count: {
          select: { analyses: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform image URLs for HTTPS contexts
    const transformedProducts = transformImageUrls(products, request)

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { photos, tags, ...productData } = body

    const product = await prisma.product.create({
      data: {
        ...productData,
        photos: {
          create: photos || []
        },
        tags: {
          connectOrCreate: tags?.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
          })) || []
        }
      },
      include: {
        photos: {
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        tags: true
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}