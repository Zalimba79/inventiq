import 'dotenv/config'
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'

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

async function cleanupOrphanedThumbnails() {
  try {
    const bucket = process.env.S3_BUCKET || 'inventiq-assets'
    
    // List all files in thumbnails folder
    const thumbnailsResponse = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: 'thumbnails/'
    }))
    
    const thumbnails = thumbnailsResponse.Contents || []
    console.log(`Found ${thumbnails.length} thumbnails`)
    
    // List all files in products folder
    const productsResponse = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: 'products/'
    }))
    
    const products = productsResponse.Contents || []
    console.log(`Found ${products.length} product images`)
    
    // Create a set of expected thumbnail keys
    const expectedThumbnails = new Set()
    products.forEach(product => {
      // Transform product key to expected thumbnail key
      const thumbKey = product.Key
        .replace('products/', 'thumbnails/')
        .replace(/\/(\d+)-capture-/, '/$1-thumb-capture-')
      expectedThumbnails.add(thumbKey)
    })
    
    console.log(`
Expecting ${expectedThumbnails.size} thumbnails based on products`)
    
    // Find orphaned thumbnails
    const orphaned = thumbnails.filter(thumb => !expectedThumbnails.has(thumb.Key))
    
    if (orphaned.length === 0) {
      console.log('✅ No orphaned thumbnails found!')
      return
    }
    
    console.log(`
Found ${orphaned.length} orphaned thumbnails:`)
    orphaned.forEach(thumb => {
      console.log(`  - ${thumb.Key} (${(thumb.Size / 1024).toFixed(2)} KB)`)
    })
    
    // Delete orphaned thumbnails
    console.log('
Deleting orphaned thumbnails...')
    
    for (const thumb of orphaned) {
      try {
        await client.send(new DeleteObjectCommand({
          Bucket: bucket,
          Key: thumb.Key
        }))
        console.log(`✅ Deleted: ${thumb.Key}`)
      } catch (error) {
        console.error(`❌ Failed to delete ${thumb.Key}:`, error.message)
      }
    }
    
    console.log('
✅ Cleanup complete!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

cleanupOrphanedThumbnails()