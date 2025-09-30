import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand, ListBucketsCommand } from '@aws-sdk/client-s3'
import prisma from '@/lib/prisma'

// MinIO client configuration
const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!
  },
  forcePathStyle: true
})

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️  Starting complete data cleanup...')
    
    // 1. Clean Database
    console.log('Cleaning database...')
    
    // Delete in correct order due to foreign key constraints
    await prisma.analysis.deleteMany({})
    await prisma.productPhoto.deleteMany({})
    await prisma.$executeRaw`DELETE FROM "_ProductToTag"`
    await prisma.tag.deleteMany({})
    await prisma.product.deleteMany({})
    await prisma.analysisQueue.deleteMany({})
    
    const dbCounts = {
      products: await prisma.product.count(),
      photos: await prisma.productPhoto.count(),
      analyses: await prisma.analysis.count(),
      tags: await prisma.tag.count(),
      analysisQueue: await prisma.analysisQueue.count()
    }
    
    // 2. Clean MinIO Storage
    console.log('Cleaning MinIO storage...')
    
    const { Buckets } = await client.send(new ListBucketsCommand({}))
    const inventiqBuckets = Buckets?.filter(b => 
      b.Name?.startsWith('inventiq')
    ) || []
    
    let totalDeleted = 0
    const cleanedBuckets: Record<string, number> = {}
    
    for (const bucket of inventiqBuckets) {
      let bucketDeleted = 0
      let continuationToken: string | undefined = undefined
      
      do {
        const listCommand = new ListObjectsV2Command({
          Bucket: bucket.Name!,
          ContinuationToken: continuationToken
        })
        
        const { Contents, IsTruncated, NextContinuationToken } = 
          await client.send(listCommand)
        
        if (Contents && Contents.length > 0) {
          const objectsToDelete = Contents.map(obj => ({ Key: obj.Key! }))
          
          // Delete objects in batches
          for (let i = 0; i < objectsToDelete.length; i += 1000) {
            const batch = objectsToDelete.slice(i, i + 1000)
            
            const deleteCommand = new DeleteObjectsCommand({
              Bucket: bucket.Name!,
              Delete: {
                Objects: batch,
                Quiet: true
              }
            })
            
            await client.send(deleteCommand)
            bucketDeleted += batch.length
            totalDeleted += batch.length
          }
        }
        
        continuationToken = IsTruncated ? NextContinuationToken : undefined
      } while (continuationToken)
      
      cleanedBuckets[bucket.Name!] = bucketDeleted
    }
    
    return NextResponse.json({
      success: true,
      message: 'All data cleaned successfully',
      database: {
        message: 'Database cleaned',
        counts: dbCounts
      },
      storage: {
        message: `Cleaned ${totalDeleted} files from MinIO`,
        buckets: cleanedBuckets
      }
    })
    
  } catch (error) {
    console.error('Cleanup failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clean data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}