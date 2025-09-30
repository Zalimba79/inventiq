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

// POST /api/products/[id]/photos - Add photo to product
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const photo = await prisma.productPhoto.create({
      data: {
        productId: params.id,
        ...body
      }
    })

    // If this is set as primary, unset other primary photos
    if (body.isPrimary) {
      await prisma.productPhoto.updateMany({
        where: {
          productId: params.id,
          id: { not: photo.id }
        },
        data: { isPrimary: false }
      })
    }

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error('Error adding photo:', error)
    return NextResponse.json(
      { error: 'Failed to add photo' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id]/photos/[photoId] - Delete photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const photoId = searchParams.get('photoId')
    
    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID required' },
        { status: 400 }
      )
    }

    // First, get the photo to find the MinIO URLs
    const photo = await prisma.productPhoto.findUnique({
      where: { 
        id: photoId
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Delete from MinIO if URLs exist
    if (photo.url || photo.thumbnailUrl) {
      const deletePromises = []
      
      // Extract the key from the URL for main image
      if (photo.url) {
        const urlParts = photo.url.split('/')
        const bucket = urlParts[3] // inventiq-assets
        const key = urlParts.slice(4).join('/') // products/product-xxx/xxx.jpg
        
        deletePromises.push(
          client.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
          })).catch(err => {
            console.error('Error deleting main image from MinIO:', err)
          })
        )
      }
      
      // Extract the key from the URL for thumbnail
      if (photo.thumbnailUrl) {
        const urlParts = photo.thumbnailUrl.split('/')
        const bucket = urlParts[3] // inventiq-assets
        const key = urlParts.slice(4).join('/') // thumbnails/product-xxx/xxx.jpg
        
        deletePromises.push(
          client.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
          })).catch(err => {
            console.error('Error deleting thumbnail from MinIO:', err)
          })
        )
      }
      
      // Wait for MinIO deletions to complete
      await Promise.all(deletePromises)
      console.log(`Deleted MinIO objects for photo ${photoId}`)
    }

    // Now delete from database
    await prisma.productPhoto.delete({
      where: { 
        id: photoId,
        productId: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}