import { uploadProductImage, uploadBase64Image, isMinIOConfigured } from '@/lib/storage/minio'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Check if MinIO is configured
    if (!isMinIOConfigured()) {
      return NextResponse.json(
        { error: 'Storage service not configured' },
        { status: 503 }
      )
    }

    const contentType = request.headers.get('content-type') || ''
    
    // Handle FormData upload (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const productId = formData.get('productId') as string
      
      if (!file || !productId) {
        return NextResponse.json(
          { error: 'Missing file or productId' },
          { status: 400 }
        )
      }
      
      const buffer = Buffer.from(await file.arrayBuffer())
      const url = await uploadProductImage(productId, buffer, file.name)
      
      return NextResponse.json({ 
        success: true,
        url,
        filename: file.name,
        size: file.size
      })
    }
    
    // Handle JSON upload (base64 data)
    if (contentType.includes('application/json')) {
      const body = await request.json()
      const { productId, base64Data, filename } = body
      
      if (!productId || !base64Data) {
        return NextResponse.json(
          { error: 'Missing productId or base64Data' },
          { status: 400 }
        )
      }
      
      const result = await uploadBase64Image(productId, base64Data, filename)
      
      return NextResponse.json({ 
        success: true,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        filename: filename || 'image.jpg'
      })
    }
    
    return NextResponse.json(
      { error: 'Unsupported content type' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}