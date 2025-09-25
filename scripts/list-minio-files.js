#!/usr/bin/env node

/**
 * List all files in MinIO buckets to see what's actually stored
 */

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
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

async function listBucketContents(bucketName) {
  try {
    console.log(`\n📂 Listing contents of bucket: ${bucketName}`)
    console.log('='.repeat(50))
    
    const response = await client.send(new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1000
    }))
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('   Bucket is empty')
      return { products: [], thumbnails: [], other: [] }
    }
    
    const products = []
    const thumbnails = []
    const other = []
    
    response.Contents.forEach(obj => {
      const key = obj.Key
      const size = (obj.Size / 1024).toFixed(2)
      
      if (key.includes('/products/')) {
        products.push({ key, size })
      } else if (key.includes('/thumbnails/')) {
        thumbnails.push({ key, size })
      } else {
        other.push({ key, size })
      }
    })
    
    console.log(`\n📸 Product Images (${products.length}):`)
    products.forEach(p => console.log(`   - ${p.key} (${p.size} KB)`))
    
    console.log(`\n🖼️  Thumbnails (${thumbnails.length}):`)
    thumbnails.forEach(t => console.log(`   - ${t.key} (${t.size} KB)`))
    
    if (other.length > 0) {
      console.log(`\n📁 Other Files (${other.length}):`)
      other.forEach(o => console.log(`   - ${o.key} (${o.size} KB)`))
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`   Total files: ${response.Contents.length}`)
    console.log(`   Product images: ${products.length}`)
    console.log(`   Thumbnails: ${thumbnails.length}`)
    console.log(`   Other: ${other.length}`)
    
    // Check for orphaned thumbnails
    const orphanedThumbs = []
    thumbnails.forEach(thumb => {
      // Extract product ID from thumbnail path
      const match = thumb.key.match(/thumbnails\/(product-\d+)\//)
      if (match) {
        const productId = match[1]
        // Check if there's a corresponding product image
        const hasProduct = products.some(p => p.key.includes(productId))
        if (!hasProduct) {
          orphanedThumbs.push(thumb.key)
        }
      }
    })
    
    if (orphanedThumbs.length > 0) {
      console.log(`\n⚠️  Orphaned Thumbnails (${orphanedThumbs.length}):`)
      orphanedThumbs.forEach(t => console.log(`   - ${t}`))
    }
    
    return { products, thumbnails, other }
  } catch (error) {
    console.error(`   Error listing bucket: ${error.message}`)
    return { products: [], thumbnails: [], other: [] }
  }
}

async function main() {
  console.log('🚀 MinIO File Listing')
  console.log('Configuration:')
  console.log(`  Endpoint: ${process.env.S3_ENDPOINT}`)
  console.log(`  Access Key: ${process.env.S3_ACCESS_KEY ? '***' + process.env.S3_ACCESS_KEY.slice(-4) : 'NOT SET'}`)
  
  // List contents of inventiq-assets bucket
  await listBucketContents('inventiq-assets')
  
  // List contents of inventiq-private bucket  
  await listBucketContents('inventiq-private')
}

main().catch(console.error)