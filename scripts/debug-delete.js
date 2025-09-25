#!/usr/bin/env node

/**
 * Debug script for MinIO delete functionality
 * Tests direct MinIO deletion to verify the delete operations work
 */

import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
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
    const response = await client.send(new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 100
    }))
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('   Bucket is empty')
      return []
    }
    
    console.log(`   Found ${response.Contents.length} objects:`)
    response.Contents.forEach(obj => {
      console.log(`   - ${obj.Key} (${(obj.Size / 1024).toFixed(2)} KB)`)
    })
    
    return response.Contents.map(obj => obj.Key)
  } catch (error) {
    console.error(`   Error listing bucket: ${error.message}`)
    return []
  }
}

async function deleteObject(bucketName, key) {
  try {
    console.log(`\n🗑️  Attempting to delete: ${bucketName}/${key}`)
    
    const deleteParams = {
      Bucket: bucketName,
      Key: key
    }
    
    console.log('   Delete params:', JSON.stringify(deleteParams, null, 2))
    
    const response = await client.send(new DeleteObjectCommand(deleteParams))
    
    console.log('   ✅ Delete successful!')
    console.log('   Response:', {
      statusCode: response.$metadata.httpStatusCode,
      requestId: response.$metadata.requestId
    })
    
    return true
  } catch (error) {
    console.error(`   ❌ Delete failed: ${error.message}`)
    if (error.$metadata) {
      console.error('   Error metadata:', error.$metadata)
    }
    return false
  }
}

async function testDeleteFromURL(url) {
  try {
    console.log(`\n🔍 Testing delete from URL: ${url}`)
    
    // Parse URL to extract bucket and key
    const urlParts = new URL(url)
    const pathParts = urlParts.pathname.split('/')
    
    if (pathParts.length < 3) {
      console.error('   Invalid URL format - cannot extract bucket and key')
      return false
    }
    
    // First part is empty, second is bucket, rest is key
    const bucket = pathParts[1]
    const key = pathParts.slice(2).join('/')
    
    console.log(`   Extracted bucket: ${bucket}`)
    console.log(`   Extracted key: ${key}`)
    
    // Try to delete
    return await deleteObject(bucket, key)
  } catch (error) {
    console.error(`   Error parsing URL: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 MinIO Delete Debug Script')
  console.log('================================')
  console.log('Configuration:')
  console.log(`  Endpoint: ${process.env.S3_ENDPOINT}`)
  console.log(`  Access Key: ${process.env.S3_ACCESS_KEY ? '***' + process.env.S3_ACCESS_KEY.slice(-4) : 'NOT SET'}`)
  console.log(`  Public URL: ${process.env.S3_PUBLIC_URL}`)
  
  // List contents of inventiq-assets bucket
  const assetsBucket = 'inventiq-assets'
  const assets = await listBucketContents(assetsBucket)
  
  // List contents of inventiq-private bucket  
  const privateBucket = 'inventiq-private'
  const privateFiles = await listBucketContents(privateBucket)
  
  // Test delete with a sample URL if any objects exist
  if (assets.length > 0) {
    console.log('\n🧪 Test Delete Operation')
    console.log('========================')
    
    // Build a test URL for the first asset
    const testKey = assets[0]
    const testUrl = `${process.env.S3_PUBLIC_URL}/${assetsBucket}/${testKey}`
    
    console.log(`Testing with URL: ${testUrl}`)
    const deleteResult = await testDeleteFromURL(testUrl)
    
    if (deleteResult) {
      // Verify deletion by listing again
      console.log('\n📋 Verifying deletion...')
      const assetsAfter = await listBucketContents(assetsBucket)
      
      if (!assetsAfter.includes(testKey)) {
        console.log('✅ Deletion verified - object no longer exists!')
      } else {
        console.log('⚠️  Object still exists after delete operation')
      }
    }
  } else {
    console.log('\n⚠️  No objects found to test deletion')
    console.log('   Upload some test images first')
  }
  
  // Test API endpoint
  console.log('\n🌐 Testing API Endpoint')
  console.log('========================')
  
  if (assets.length > 1) {
    const testKey = assets[1]
    const testUrl = `${process.env.S3_PUBLIC_URL}/${assetsBucket}/${testKey}`
    
    console.log(`Testing API delete with: ${testUrl}`)
    
    try {
      const response = await fetch('http://localhost:3001/api/upload/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl })
      })
      
      const result = await response.json()
      console.log('API Response:', result)
      
      if (response.ok) {
        console.log('✅ API delete successful!')
      } else {
        console.log('❌ API delete failed:', result.error)
      }
    } catch (error) {
      console.error('API call error:', error.message)
    }
  }
}

main().catch(console.error)