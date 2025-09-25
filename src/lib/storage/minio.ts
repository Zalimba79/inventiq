import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand 
} from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { BUCKET_CONFIG, BucketType, getObjectPath } from './bucket-config'

// MinIO Client Configuration
const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!
  },
  forcePathStyle: true // Important for MinIO!
})

// Ensure bucket exists
async function ensureBucketExists(bucketName: string): Promise<void> {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }))
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      console.log(`Creating bucket: ${bucketName}`)
      try {
        await client.send(new CreateBucketCommand({ Bucket: bucketName }))
        console.log(`Bucket created: ${bucketName}`)
      } catch (createError: any) {
        if (createError.name !== 'BucketAlreadyOwnedByYou') {
          throw createError
        }
      }
    }
  }
}

/**
 * Upload a product image to MinIO (uses assets bucket for public access)
 */
export async function uploadProductImage(
  productId: string,
  file: Buffer,
  filename: string,
  options?: {
    optimize?: boolean
    maxWidth?: number
    quality?: number
    generateThumbnail?: boolean
  }
): Promise<{
  url: string
  thumbnailUrl?: string
}> {
  const { optimize = true, maxWidth = 1920, quality = 85, generateThumbnail = true } = options || {}
  
  let processedBuffer = file
  let contentType = 'image/jpeg'
  
  // Optimize main image with sharp if needed
  if (optimize) {
    try {
      processedBuffer = await sharp(file)
        .resize(maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality })
        .toBuffer()
    } catch (error) {
      console.warn('Image optimization failed, using original:', error)
      processedBuffer = file
    }
  }
  
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const bucket = BUCKET_CONFIG.ASSETS.name
  const folder = BUCKET_CONFIG.ASSETS.folders.PRODUCTS
  const key = `${folder}/${productId}/${timestamp}-${sanitizedFilename}`
  
  // Ensure bucket exists
  await ensureBucketExists(bucket)
  
  // Upload main image
  try {
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: processedBuffer,
      ContentType: contentType,
      Metadata: {
        productId,
        originalName: filename,
        uploadedAt: new Date().toISOString()
      }
    }))
    console.log('MinIO upload successful:', { bucket, key })
  } catch (error) {
    console.error('MinIO upload error:', error)
    throw error
  }
  
  const mainUrl = `${process.env.S3_PUBLIC_URL}/${bucket}/${key}`
  let thumbnailUrl: string | undefined
  
  // Generate and upload thumbnail if requested
  if (generateThumbnail) {
    try {
      const thumbnailBuffer = await sharp(file)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 70 })
        .toBuffer()
      
      const thumbFolder = BUCKET_CONFIG.ASSETS.folders.THUMBNAILS
      const thumbKey = `${thumbFolder}/${productId}/${timestamp}-thumb-${sanitizedFilename}`
      
      // Bucket already ensured above (same bucket)
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: thumbKey,
        Body: thumbnailBuffer,
        ContentType: contentType,
        Metadata: {
          productId,
          type: 'thumbnail',
          originalName: filename
        }
      }))
      
      thumbnailUrl = `${process.env.S3_PUBLIC_URL}/${bucket}/${thumbKey}`
    } catch (error) {
      console.warn('Thumbnail generation failed:', error)
    }
  }
  
  return { url: mainUrl, thumbnailUrl }
}

/**
 * Upload a base64 image to MinIO
 */
export async function uploadBase64Image(
  productId: string,
  base64Data: string,
  filename?: string
): Promise<{
  url: string
  thumbnailUrl?: string
}> {
  // Remove data URL prefix if present
  const base64Clean = base64Data.replace(/^data:image\/[a-z]+;base64,/, '')
  const buffer = Buffer.from(base64Clean, 'base64')
  
  return uploadProductImage(
    productId,
    buffer,
    filename || `image-${Date.now()}.jpg`
  )
}

/**
 * Delete an image from MinIO
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    // Extract bucket and key from URL
    // URL format: http://10.2.200.102:9000/inventiq-assets/products/...
    const urlParts = new URL(url)
    const pathParts = urlParts.pathname.split('/')
    
    if (pathParts.length < 3) {
      throw new Error('Invalid image URL format')
    }
    
    // First part is empty, second is bucket, rest is key
    const bucket = pathParts[1]
    const key = pathParts.slice(2).join('/')
    
    console.log('Deleting from MinIO:', { bucket, key })
    
    await client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    }))
    
    console.log('MinIO delete successful:', { bucket, key })
    
    // Also try to delete thumbnail if it exists
    if (key.includes('/products/')) {
      // Replace products folder with thumbnails and add thumb- prefix to filename
      const thumbKey = key
        .replace('products/', 'thumbnails/')
        .replace(/\/(\d+)-/, '/$1-thumb-') // Add thumb- after timestamp
      
      try {
        await client.send(new DeleteObjectCommand({
          Bucket: bucket,
          Key: thumbKey
        }))
        console.log('Thumbnail also deleted:', thumbKey)
      } catch (error) {
        // Thumbnail might not exist, that's ok - silent fail
      }
    }
  } catch (error) {
    console.error('MinIO delete error:', error)
    throw error
  }
}

/**
 * Get an image from MinIO
 */
export async function getImage(key: string): Promise<Buffer> {
  const response = await client.send(new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key
  }))
  
  const chunks: Uint8Array[] = []
  const stream = response.Body as any
  
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  
  return Buffer.concat(chunks)
}

/**
 * Check if MinIO is configured and accessible
 */
export function isMinIOConfigured(): boolean {
  const configured = !!(
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY &&
    process.env.S3_SECRET_KEY &&
    process.env.S3_PUBLIC_URL
  )
  
  if (!configured) {
    console.log('MinIO Configuration Check:', {
      hasEndpoint: !!process.env.S3_ENDPOINT,
      hasAccessKey: !!process.env.S3_ACCESS_KEY,
      hasSecretKey: !!process.env.S3_SECRET_KEY,
      hasPublicUrl: !!process.env.S3_PUBLIC_URL
    })
  }
  
  return configured
}

/**
 * Get the public URL for a MinIO object key
 */
export function getPublicUrl(key: string): string {
  return `${process.env.S3_PUBLIC_URL}/${process.env.S3_BUCKET}/${key}`
}