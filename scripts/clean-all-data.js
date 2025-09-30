#!/usr/bin/env node

/**
 * Clean All Data - Database and MinIO
 * This script removes all data to start fresh
 */

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const { S3Client, ListObjectsV2Command, DeleteObjectsCommand, ListBucketsCommand } = require('@aws-sdk/client-s3')

const prisma = new PrismaClient()

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

async function cleanDatabase() {
  console.log('🗑️  Cleaning PostgreSQL Database...\n')
  
  try {
    // Delete in correct order due to foreign key constraints
    console.log('  Deleting analyses...')
    await prisma.analysis.deleteMany({})
    
    console.log('  Deleting product photos...')
    await prisma.productPhoto.deleteMany({})
    
    console.log('  Deleting product-tag relationships...')
    await prisma.$executeRaw`DELETE FROM "_ProductToTag"`
    
    console.log('  Deleting tags...')
    await prisma.tag.deleteMany({})
    
    console.log('  Deleting products...')
    await prisma.product.deleteMany({})
    
    console.log('  Deleting users...')
    await prisma.user.deleteMany({})
    
    console.log('\n✅ Database cleaned successfully!\n')
    
    // Show counts to verify
    const counts = {
      products: await prisma.product.count(),
      photos: await prisma.productPhoto.count(),
      analyses: await prisma.analysis.count(),
      tags: await prisma.tag.count(),
      users: await prisma.user.count()
    }
    
    console.log('  Verification:')
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`    ${table}: ${count} records`)
    })
    
  } catch (error) {
    console.error('❌ Failed to clean database:', error.message)
    throw error
  }
}

async function cleanMinIO() {
  console.log('\n🗑️  Cleaning MinIO Storage...\n')
  
  try {
    // List all buckets
    const { Buckets } = await client.send(new ListBucketsCommand({}))
    
    const inventiqBuckets = Buckets?.filter(b => 
      b.Name?.startsWith('inventiq')
    ) || []
    
    console.log(`  Found ${inventiqBuckets.length} Inventiq buckets:`)
    inventiqBuckets.forEach(bucket => {
      console.log(`    - ${bucket.Name}`)
    })
    
    // Clean each bucket
    for (const bucket of inventiqBuckets) {
      console.log(`\n  Cleaning bucket: ${bucket.Name}`)
      
      let continuationToken = undefined
      let totalDeleted = 0
      
      do {
        // List objects in bucket
        const listCommand = new ListObjectsV2Command({
          Bucket: bucket.Name,
          ContinuationToken: continuationToken
        })
        
        const { Contents, IsTruncated, NextContinuationToken } = 
          await client.send(listCommand)
        
        if (Contents && Contents.length > 0) {
          // Prepare objects for deletion
          const objectsToDelete = Contents.map(obj => ({ Key: obj.Key }))
          
          // Delete objects in batches of 1000 (S3 limit)
          for (let i = 0; i < objectsToDelete.length; i += 1000) {
            const batch = objectsToDelete.slice(i, i + 1000)
            
            const deleteCommand = new DeleteObjectsCommand({
              Bucket: bucket.Name,
              Delete: {
                Objects: batch,
                Quiet: true
              }
            })
            
            await client.send(deleteCommand)
            totalDeleted += batch.length
            process.stdout.write(`    Deleted ${totalDeleted} objects\r`)
          }
        }
        
        continuationToken = IsTruncated ? NextContinuationToken : undefined
      } while (continuationToken)
      
      if (totalDeleted > 0) {
        console.log(`    ✓ Deleted ${totalDeleted} objects from ${bucket.Name}`)
      } else {
        console.log(`    ✓ Bucket ${bucket.Name} was already empty`)
      }
    }
    
    console.log('\n✅ MinIO storage cleaned successfully!')
    
  } catch (error) {
    console.error('❌ Failed to clean MinIO:', error.message)
    throw error
  }
}

async function main() {
  console.log('====================================')
  console.log('   INVENTIQ DATA CLEANUP UTILITY   ')
  console.log('====================================\n')
  
  console.log('⚠️  WARNING: This will delete ALL data!')
  console.log('   - All products and photos')
  console.log('   - All analyses and tags')
  console.log('   - All MinIO stored images')
  console.log('   - All user data\n')
  
  // Give user a chance to cancel
  console.log('Starting cleanup in 5 seconds... (Press Ctrl+C to cancel)\n')
  await new Promise(resolve => setTimeout(resolve, 5000))
  
  try {
    // Clean database first
    await cleanDatabase()
    
    // Then clean MinIO
    await cleanMinIO()
    
    console.log('\n====================================')
    console.log('   ✅ ALL DATA CLEANED SUCCESSFULLY')
    console.log('====================================\n')
    
    console.log('Next steps:')
    console.log('1. Clear your browser localStorage:')
    console.log('   - Open Developer Tools (F12)')
    console.log('   - Go to Application/Storage tab')
    console.log('   - Clear Local Storage for localhost:3000')
    console.log('\n2. Or use the "Clear All Data" button on the dashboard')
    console.log('\n3. Refresh the application to start fresh!')
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
main().catch(console.error)