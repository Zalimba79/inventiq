import { S3Client, DeleteBucketCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'

const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!
  },
  forcePathStyle: true
})

/**
 * Delete old unused buckets
 * DELETE /api/storage/cleanup
 */
export async function DELETE() {
  try {
    const bucketToDelete = 'inventiq' // Old bucket name
    
    // First, check if bucket has any objects
    const listResponse = await client.send(new ListObjectsV2Command({
      Bucket: bucketToDelete
    }))
    
    // If bucket has objects, delete them first
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      const objects = listResponse.Contents.map(obj => ({ Key: obj.Key! }))
      
      await client.send(new DeleteObjectsCommand({
        Bucket: bucketToDelete,
        Delete: { Objects: objects }
      }))
      
      console.log(`Deleted ${objects.length} objects from ${bucketToDelete}`)
    }
    
    // Now delete the empty bucket
    await client.send(new DeleteBucketCommand({
      Bucket: bucketToDelete
    }))
    
    return NextResponse.json({
      success: true,
      message: `✅ Successfully deleted old bucket: ${bucketToDelete}`,
      deletedBucket: bucketToDelete,
      newStructure: [
        'inventiq-assets (public)',
        'inventiq-private (private)', 
        'inventiq-temp (temporary)',
        'inventiq-system (system)'
      ]
    })
    
  } catch (error: any) {
    // If bucket doesn't exist, that's fine
    if (error?.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({
        success: true,
        message: 'Old bucket already deleted or doesn\'t exist',
        newStructure: [
          'inventiq-assets (public)',
          'inventiq-private (private)', 
          'inventiq-temp (temporary)',
          'inventiq-system (system)'
        ]
      })
    }
    
    console.error('Cleanup failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cleanup old bucket',
      details: error.message
    }, { status: 500 })
  }
}