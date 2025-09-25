#!/usr/bin/env node

/**
 * Clean up orphaned thumbnails in MinIO
 */

import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

// MinIO client configuration
const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  },
  forcePathStyle: true
})

async function deleteOrphanedThumbnails() {
  const bucketName = 'inventiq-assets'
  
  console.log('🧹 Cleaning up orphaned thumbnails...')
  console.log('='.repeat(50))
  
  // List all objects
  const response = await client.send(new ListObjectsV2Command({
    Bucket: bucketName,
    MaxKeys: 1000
  }))
  
  if (!response.Contents || response.Contents.length === 0) {
    console.log('Bucket is empty')
    return
  }
  
  const thumbnails = []
  const products = []
  
  // Categorize files
  response.Contents.forEach(obj => {
    if (obj.Key.includes('thumbnails/')) {
      thumbnails.push(obj.Key)
    } else if (obj.Key.includes('products/')) {
      products.push(obj.Key)
    }
  })
  
  console.log(`Found ${thumbnails.length} thumbnails`)
  console.log(`Found ${products.length} product images`)
  
  // Find orphaned thumbnails
  const orphaned = []
  thumbnails.forEach(thumbKey => {
    // Extract product ID from thumbnail path
    const match = thumbKey.match(/thumbnails\/(product-\d+)\//)
    if (match) {
      const productId = match[1]
      // Check if there's a corresponding product image
      const hasProduct = products.some(p => p.includes(productId))
      if (!hasProduct) {
        orphaned.push(thumbKey)
      }
    }
  })
  
  if (orphaned.length === 0) {
    console.log('✅ No orphaned thumbnails found')
    return
  }
  
  console.log(`\n⚠️  Found ${orphaned.length} orphaned thumbnails:`)
  orphaned.forEach(key => console.log(`   - ${key}`))
  
  // Delete orphaned thumbnails
  console.log('\n🗑️  Deleting orphaned thumbnails...')
  
  for (const key of orphaned) {
    try {
      await client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      }))
      console.log(`   ✅ Deleted: ${key}`)
    } catch (error) {
      console.error(`   ❌ Failed to delete ${key}:`, error.message)
    }
  }
  
  console.log('\n✅ Cleanup complete!')
}

deleteOrphanedThumbnails().catch(console.error)