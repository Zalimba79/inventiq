import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

// POST /api/migrate - Migrate data from localStorage to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { products } = body
    
    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Invalid products data' },
        { status: 400 }
      )
    }

    const migrationResults = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const product of products) {
      try {
        // Extract photos and tags
        const { photos, tags, id, createdAt, updatedAt, ...productData } = product
        
        // Create product with relations
        await prisma.product.create({
          data: {
            ...productData,
            createdAt: new Date(createdAt),
            updatedAt: new Date(updatedAt),
            photos: {
              create: photos?.map((photo: any) => ({
                url: photo.url,
                thumbnailUrl: photo.thumbnailUrl,
                dataUrl: photo.dataUrl,
                mimeType: photo.mimeType || 'image/jpeg',
                size: photo.size || 0,
                isPrimary: photo.isPrimary || false,
                angle: photo.angle,
                timestamp: photo.timestamp ? new Date(photo.timestamp) : new Date()
              })) || []
            },
            tags: {
              connectOrCreate: tags?.map((tagName: string) => ({
                where: { name: tagName },
                create: { name: tagName }
              })) || []
            }
          }
        })
        
        migrationResults.success++
      } catch (error) {
        migrationResults.failed++
        migrationResults.errors.push(`Failed to migrate product: ${product.name || product.id}`)
        console.error('Migration error for product:', error)
      }
    }

    return NextResponse.json({
      message: 'Migration completed',
      results: migrationResults
    })
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    )
  }
}