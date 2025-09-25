import { deleteImage, isMinIOConfigured } from '@/lib/storage/minio'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    // Check if MinIO is configured
    if (!isMinIOConfigured()) {
      return NextResponse.json(
        { error: 'Storage service not configured' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL parameter' },
        { status: 400 }
      )
    }
    
    await deleteImage(url)
    
    return NextResponse.json({ 
      success: true,
      message: 'Image deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { 
        error: 'Delete failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if MinIO is configured
    if (!isMinIOConfigured()) {
      return NextResponse.json(
        { error: 'Storage service not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { url } = body
    
    console.log('Delete request received for URL:', url)
    
    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL in request body' },
        { status: 400 }
      )
    }
    
    await deleteImage(url)
    
    console.log('Successfully deleted from MinIO:', url)
    
    return NextResponse.json({ 
      success: true,
      message: 'Image deleted successfully',
      deletedUrl: url
    })
    
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { 
        error: 'Delete failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}