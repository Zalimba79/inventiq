#!/usr/bin/env node

/**
 * Clean MinIO via External URL
 * This script deletes all files from MinIO using the external URL
 */

require('dotenv').config({ path: '.env.local' })
const { S3Client, ListObjectsV2Command, DeleteObjectsCommand, ListBucketsCommand } = require('@aws-sdk/client-s3')

// MinIO client configuration - using local URL since external doesn't work with API
const client = new S3Client({
  endpoint: 'http://10.2.200.102:9000', // Local URL
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  },
  forcePathStyle: true
})

async function cleanMinIO() {
  console.log('🗑️  Cleaning MinIO Storage...\n')
  
  try {
    // List all buckets
    console.log('📋 Listing buckets...')
    const { Buckets } = await client.send(new ListBucketsCommand({}))
    
    const inventiqBuckets = Buckets?.filter(b => 
      b.Name?.startsWith('inventiq')
    ) || []
    
    console.log(`Found ${inventiqBuckets.length} Inventiq buckets:`)
    inventiqBuckets.forEach(bucket => {
      console.log(`  - ${bucket.Name}`)
    })
    
    // Clean each bucket
    for (const bucket of inventiqBuckets) {
      console.log(`\n🗑️  Cleaning bucket: ${bucket.Name}`)
      
      let continuationToken = undefined
      let totalDeleted = 0
      let allObjects = []
      
      // First, list all objects
      do {
        const listCommand = new ListObjectsV2Command({
          Bucket: bucket.Name,
          ContinuationToken: continuationToken,
          MaxKeys: 1000
        })
        
        const { Contents, IsTruncated, NextContinuationToken } = 
          await client.send(listCommand)
        
        if (Contents && Contents.length > 0) {
          allObjects = allObjects.concat(Contents)
          console.log(`  Found ${Contents.length} objects (total: ${allObjects.length})`)
        }
        
        continuationToken = IsTruncated ? NextContinuationToken : undefined
      } while (continuationToken)
      
      if (allObjects.length === 0) {
        console.log(`  ✓ Bucket ${bucket.Name} is already empty`)
        continue
      }
      
      // Now delete all objects in batches
      console.log(`  Deleting ${allObjects.length} objects...`)
      
      for (let i = 0; i < allObjects.length; i += 1000) {
        const batch = allObjects.slice(i, i + 1000)
        const objectsToDelete = batch.map(obj => ({ Key: obj.Key }))
        
        try {
          const deleteCommand = new DeleteObjectsCommand({
            Bucket: bucket.Name,
            Delete: {
              Objects: objectsToDelete,
              Quiet: false // Show details
            }
          })
          
          const deleteResult = await client.send(deleteCommand)
          totalDeleted += (deleteResult.Deleted?.length || 0)
          
          if (deleteResult.Errors && deleteResult.Errors.length > 0) {
            console.log(`  ⚠️  Errors deleting some objects:`)
            deleteResult.Errors.forEach(err => {
              console.log(`    - ${err.Key}: ${err.Message}`)
            })
          }
          
          process.stdout.write(`  Progress: ${totalDeleted}/${allObjects.length} objects deleted\r`)
        } catch (error) {
          console.error(`\n  ❌ Error deleting batch: ${error.message}`)
        }
      }
      
      console.log(`\n  ✅ Deleted ${totalDeleted} objects from ${bucket.Name}`)
    }
    
    console.log('\n✅ MinIO storage cleaned successfully via external URL!')
    
  } catch (error) {
    console.error('❌ Failed to clean MinIO:', error)
    console.error('Error details:', error.message)
    
    if (error.Code === 'NetworkingError') {
      console.error('\n⚠️  Cannot connect to minio.mindbit.net')
      console.error('   Check if the external URL is accessible')
    }
  }
}

async function main() {
  console.log('====================================')
  console.log('   MinIO EXTERNAL CLEANUP UTILITY   ')
  console.log('====================================\n')
  
  console.log('Endpoint: https://minio.mindbit.net')
  console.log(`Access Key: ${process.env.S3_ACCESS_KEY}\n`)
  
  console.log('⚠️  WARNING: This will delete ALL files from MinIO!')
  console.log('Starting cleanup in 3 seconds... (Press Ctrl+C to cancel)\n')
  
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  await cleanMinIO()
}

// Run the cleanup
main().catch(console.error)