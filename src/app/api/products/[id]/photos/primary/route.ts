import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

// PUT /api/products/[id]/photos/primary - Set primary photo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { photoId } = await request.json()
    
    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }
    
    // First, set all photos for this product as non-primary
    await prisma.productPhoto.updateMany({
      where: {
        productId: params.id
      },
      data: {
        isPrimary: false
      }
    })
    
    // Then set the selected photo as primary
    const updatedPhoto = await prisma.productPhoto.update({
      where: {
        id: photoId
      },
      data: {
        isPrimary: true
      }
    })
    
    return NextResponse.json(updatedPhoto)
  } catch (error) {
    console.error('Error updating primary photo:', error)
    return NextResponse.json(
      { error: 'Failed to update primary photo' },
      { status: 500 }
    )
  }
}