import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

// PUT /api/products/[id]/photos/rotation - Update photo rotation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { photoId, rotation } = await request.json()
    
    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }
    
    // Normalize rotation to 0-359 range
    const normalizedRotation = ((rotation % 360) + 360) % 360
    
    // Update the photo rotation in database
    const updatedPhoto = await prisma.productPhoto.update({
      where: {
        id: photoId
      },
      data: {
        angle: normalizedRotation.toString()
      }
    })
    
    return NextResponse.json({
      success: true,
      photo: updatedPhoto
    })
  } catch (error) {
    console.error('Error updating photo rotation:', error)
    return NextResponse.json(
      { error: 'Failed to update photo rotation' },
      { status: 500 }
    )
  }
}