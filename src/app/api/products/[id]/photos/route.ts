import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

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