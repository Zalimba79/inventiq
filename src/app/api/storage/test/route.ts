import { S3Client, ListBucketsCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Create client with MinIO configuration
    const client = new S3Client({
      endpoint: process.env.S3_ENDPOINT!,
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!
      },
      forcePathStyle: true
    })

    // Test connection by listing buckets
    const listResponse = await client.send(new ListBucketsCommand({}))
    const buckets = listResponse.Buckets?.map(b => b.Name) || []
    
    // Check if our bucket exists
    let bucketExists = false
    let bucketError = null
    
    try {
      await client.send(new HeadBucketCommand({
        Bucket: process.env.S3_BUCKET!
      }))
      bucketExists = true
    } catch (error: any) {
      if (error?.$metadata?.httpStatusCode === 404) {
        // Bucket doesn't exist, try to create it
        try {
          await client.send(new CreateBucketCommand({
            Bucket: process.env.S3_BUCKET!
          }))
          bucketExists = true
          bucketError = 'Bucket created successfully'
        } catch (createError: any) {
          bucketError = createError.message
        }
      } else {
        bucketError = error.message
      }
    }

    return NextResponse.json({
      success: true,
      connection: 'MinIO connection successful',
      endpoint: process.env.S3_ENDPOINT,
      bucket: process.env.S3_BUCKET,
      bucketExists,
      bucketError,
      availableBuckets: buckets,
      configuration: {
        endpoint: process.env.S3_ENDPOINT,
        bucket: process.env.S3_BUCKET,
        region: process.env.S3_REGION || 'us-east-1',
        publicUrl: process.env.S3_PUBLIC_URL
      }
    })
  } catch (error: any) {
    console.error('MinIO connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'MinIO connection failed',
      details: error.message,
      configuration: {
        endpoint: process.env.S3_ENDPOINT || 'Not configured',
        bucket: process.env.S3_BUCKET || 'Not configured',
        hasAccessKey: !!process.env.S3_ACCESS_KEY,
        hasSecretKey: !!process.env.S3_SECRET_KEY
      }
    }, { status: 500 })
  }
}