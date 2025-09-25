import 'dotenv/config'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  },
  forcePathStyle: true,
  tls: false
})

async function deleteWithThumbnail(url) {
  try {
    // Extract bucket and key from URL
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
    if (key.includes('products/')) {
      // Transform the key to match thumbnail pattern
      // products/product-XXX/TIMESTAMP-capture-TIMESTAMP2.jpg 
      // -> thumbnails/product-XXX/TIMESTAMP-thumb-capture-TIMESTAMP2.jpg
      const thumbKey = key
        .replace('products/', 'thumbnails/')
        .replace(/\/(\d+)-capture-/, '/$1-thumb-capture-') // Insert thumb- before capture-
      
      console.log('Attempting to delete thumbnail:', { original: key, thumbnail: thumbKey })
      
      try {
        await client.send(new DeleteObjectCommand({
          Bucket: bucket,
          Key: thumbKey
        }))
        console.log('✅ Thumbnail also deleted:', thumbKey)
      } catch (error) {
        console.log('❌ Thumbnail not found or error:', error.message)
      }
    }
  } catch (error) {
    console.error('MinIO delete error:', error)
    throw error
  }
}

// Test with actual product image
const testUrl = 'http://10.2.200.102:9000/inventiq-assets/products/product-1758793187445/1758793200684-capture-1758793200606.jpg'

console.log('Testing thumbnail deletion...\n')
await deleteWithThumbnail(testUrl)