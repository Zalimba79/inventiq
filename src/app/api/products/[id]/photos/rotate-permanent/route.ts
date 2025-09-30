import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

import prisma from '@/lib/prisma'
import { s3Client } from '@/lib/s3-client'

// POST /api/products/[id]/photos/rotate-permanent - Permanently rotate image in MinIO
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { photoId, rotation } = await request.json()
    
    if (!photoId || rotation === undefined) {
      return NextResponse.json(
        { error: 'Photo ID and rotation are required' },
        { status: 400 }
      )
    }

    // Skip if no rotation needed
    if (rotation === 0) {
      // Reset rotation in database
      await prisma.productPhoto.update({
        where: { id: photoId },
        data: { angle: '0' }
      })
      
      return NextResponse.json({
        success: true,
        message: 'No rotation needed'
      })
    }

    // Get photo details from database
    const photo = await prisma.productPhoto.findUnique({
      where: { id: photoId }
    })

    if (!photo || !photo.url) {
      return NextResponse.json(
        { error: 'Photo not found or has no URL' },
        { status: 404 }
      )
    }

    // Extract bucket and key from MinIO URL
    // URL format: http://10.2.200.102:9000/inventiq-assets/products/...
    const urlParts = photo.url.split('/')
    const bucket = urlParts[3] // inventiq-assets
    const key = urlParts.slice(4).join('/') // products/...
    
    // Download image from MinIO
    console.log('📥 Downloading image from MinIO:', key)
    const getObjectResponse = await s3Client.getObject({
      Bucket: bucket,
      Key: key
    })

    if (!getObjectResponse.Body) {
      throw new Error('Failed to download image from MinIO')
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of getObjectResponse.Body as any) {
      chunks.push(chunk)
    }
    const imageBuffer = Buffer.concat(chunks)

    // Rotate image using Sharp
    console.log(`🔄 Rotating image by ${rotation} degrees`)
    const rotatedBuffer = await sharp(imageBuffer)
      .rotate(rotation)
      .toBuffer()

    // Upload rotated image back to MinIO (replace original)
    console.log('📤 Uploading rotated image to MinIO')
    await s3Client.putObject({
      Bucket: bucket,
      Key: key,
      Body: rotatedBuffer,
      ContentType: photo.mimeType || 'image/jpeg',
      Metadata: {
        'x-amz-meta-rotated': rotation.toString(),
        'x-amz-meta-rotation-date': new Date().toISOString()
      }
    })

    // Also update thumbnail if it exists
    if (photo.thumbnailUrl) {
      const thumbUrlParts = photo.thumbnailUrl.split('/')
      const thumbBucket = thumbUrlParts[3]
      const thumbKey = thumbUrlParts.slice(4).join('/')
      
      console.log('📥 Processing thumbnail:', thumbKey)
      
      // Download thumbnail
      const getThumbResponse = await s3Client.getObject({
        Bucket: thumbBucket,
        Key: thumbKey
      })

      if (getThumbResponse.Body) {
        const thumbChunks: Uint8Array[] = []
        for await (const chunk of getThumbResponse.Body as any) {
          thumbChunks.push(chunk)
        }
        const thumbBuffer = Buffer.concat(thumbChunks)

        // Rotate thumbnail
        const rotatedThumb = await sharp(thumbBuffer)
          .rotate(rotation)
          .toBuffer()

        // Upload rotated thumbnail
        await s3Client.putObject({
          Bucket: thumbBucket,
          Key: thumbKey,
          Body: rotatedThumb,
          ContentType: 'image/jpeg',
          Metadata: {
            'x-amz-meta-rotated': rotation.toString(),
            'x-amz-meta-rotation-date': new Date().toISOString()
          }
        })
        
        console.log('✅ Thumbnail rotated successfully')
      }
    }

    // Reset rotation angle in database since image is now permanently rotated
    await prisma.productPhoto.update({
      where: { id: photoId },
      data: { angle: '0' }
    })

    console.log('✅ Image permanently rotated in MinIO')
    
    return NextResponse.json({
      success: true,
      message: 'Image rotated permanently in MinIO',
      photo: {
        ...photo,
        angle: '0'
      }
    })
  } catch (error) {
    console.error('Error rotating image permanently:', error)
    return NextResponse.json(
      { error: 'Failed to rotate image permanently' },
      { status: 500 }
    )
  }
}