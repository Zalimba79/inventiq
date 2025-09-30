import { NextRequest, NextResponse } from 'next/server'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

import prisma from '@/lib/prisma'

// MinIO client configuration
const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!
  },
  forcePathStyle: true
})

// Helper function to transform URLs for HTTPS contexts
function transformImageUrls(product: any, request: NextRequest) {
  const isHTTPS = request.headers.get('x-forwarded-proto') === 'https' || 
                   request.nextUrl.protocol === 'https:'
  
  if (!isHTTPS || !product) return product
  
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
    ...product,
    photos: product.photos?.map((photo: any) => ({
      ...photo,
      url: transformUrl(photo.url),
      thumbnailUrl: transformUrl(photo.thumbnailUrl)
    }))
  }
}

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        photos: {
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        tags: true,
        analyses: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Transform image URLs for HTTPS contexts
    const transformedProduct = transformImageUrls(product, request)

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PATCH /api/products/[id] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { photos, tags, ...productData } = body

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...productData,
        updatedAt: new Date(),
        ...(tags && {
          tags: {
            set: [],
            connectOrCreate: tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag }
            }))
          }
        })
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

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First get all photos to delete from MinIO
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { 
        photos: {
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Delete all photos from MinIO
    if (product.photos.length > 0) {
      const deletePromises = []
      
      for (const photo of product.photos) {
        // Delete main image from MinIO
        if (photo.url) {
          const urlParts = photo.url.split('/')
          const bucket = urlParts[3] // inventiq-assets
          const key = urlParts.slice(4).join('/') // products/product-xxx/xxx.jpg
          
          deletePromises.push(
            client.send(new DeleteObjectCommand({
              Bucket: bucket,
              Key: key
            })).catch(err => {
              console.error(`Error deleting main image ${key} from MinIO:`, err)
            })
          )
        }
        
        // Delete thumbnail from MinIO
        if (photo.thumbnailUrl) {
          const urlParts = photo.thumbnailUrl.split('/')
          const bucket = urlParts[3] // inventiq-assets
          const key = urlParts.slice(4).join('/') // thumbnails/product-xxx/xxx.jpg
          
          deletePromises.push(
            client.send(new DeleteObjectCommand({
              Bucket: bucket,
              Key: key
            })).catch(err => {
              console.error(`Error deleting thumbnail ${key} from MinIO:`, err)
            })
          )
        }
      }
      
      // Wait for all MinIO deletions to complete
      await Promise.all(deletePromises)
      console.log(`Deleted ${deletePromises.length} MinIO objects for product ${params.id}`)
    }

    // Now delete from database (cascade will delete photos and other relations)
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}