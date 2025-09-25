import { 
  S3Client, 
  CreateBucketCommand, 
  HeadBucketCommand, 
  PutBucketPolicyCommand,
  PutBucketLifecycleConfigurationCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand
} from '@aws-sdk/client-s3'

import { BUCKET_CONFIG, BucketType } from './bucket-config'

// MinIO Client
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
 * Create a bucket if it doesn't exist
 */
async function ensureBucket(bucketName: string): Promise<boolean> {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }))
    console.log(`✅ Bucket '${bucketName}' exists`)
    return true
  } catch (error: any) {
    if (error?.$metadata?.httpStatusCode === 404) {
      try {
        await client.send(new CreateBucketCommand({ Bucket: bucketName }))
        console.log(`✅ Created bucket '${bucketName}'`)
        return true
      } catch (createError: any) {
        console.error(`❌ Failed to create bucket '${bucketName}':`, createError.message)
        return false
      }
    }
    console.error(`❌ Error checking bucket '${bucketName}':`, error.message)
    return false
  }
}

/**
 * Set public read policy for assets bucket
 */
async function setPublicReadPolicy(bucketName: string): Promise<void> {
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`]
      }
    ]
  }
  
  try {
    await client.send(new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(policy)
    }))
    console.log(`🌐 Set public read policy for '${bucketName}'`)
  } catch (error: any) {
    console.warn(`⚠️  Could not set public policy for '${bucketName}':`, error.message)
  }
}

/**
 * Set lifecycle policy for automatic deletion
 */
async function setLifecyclePolicy(bucketName: string, expirationDays: number): Promise<void> {
  const configuration = {
    Rules: [
      {
        Id: 'auto-delete-old-files',
        Status: 'Enabled' as const,
        Expiration: {
          Days: expirationDays
        },
        Filter: {} // Apply to all objects
      }
    ]
  }
  
  try {
    await client.send(new PutBucketLifecycleConfigurationCommand({
      Bucket: bucketName,
      LifecycleConfiguration: configuration
    }))
    console.log(`⏳ Set ${expirationDays} day expiration for '${bucketName}'`)
  } catch (error: any) {
    console.warn(`⚠️  Could not set lifecycle policy for '${bucketName}':`, error.message)
  }
}

/**
 * Initialize all MinIO buckets with proper permissions
 */
export async function initializeMinIO(): Promise<{
  success: boolean
  results: Record<string, boolean>
  errors: string[]
}> {
  console.log('🚀 Initializing MinIO Multi-Project Bucket Structure...')
  
  const results: Record<string, boolean> = {}
  const errors: string[] = []
  
  // Process each bucket configuration
  for (const [key, config] of Object.entries(BUCKET_CONFIG)) {
    const bucketName = config.name
    console.log(`\n📁 Setting up ${bucketName}...`)
    
    // Create bucket
    const created = await ensureBucket(bucketName)
    results[bucketName] = created
    
    if (created) {
      // Set public read policy if needed
      if (config.public) {
        await setPublicReadPolicy(bucketName)
      }
      
      // Set lifecycle policy for temp buckets
      if (config.retention && bucketName.includes('temp')) {
        const days = Math.ceil(config.retention / 24) // Convert hours to days
        await setLifecyclePolicy(bucketName, days)
      }
      
      console.log(`   ${config.description}`)
      console.log(`   Folders: ${Object.values(config.folders).join(', ')}`)
    } else {
      errors.push(`Failed to create bucket: ${bucketName}`)
    }
  }
  
  const allSuccess = Object.values(results).every(r => r)
  
  console.log(`\n${  allSuccess 
    ? '✅ MinIO initialization complete! All buckets ready.' 
    : '⚠️  MinIO initialization completed with errors'}`
  )
  
  return {
    success: allSuccess,
    results,
    errors
  }
}

/**
 * Clean up temporary files in temp bucket
 */
export async function cleanupTempBucket(): Promise<{
  deleted: number
  errors: string[]
}> {
  const bucketName = BUCKET_CONFIG.TEMP.name
  const hoursOld = BUCKET_CONFIG.TEMP.retention || 24
  const cutoffTime = Date.now() - (hoursOld * 60 * 60 * 1000)
  
  console.log(`🧹 Cleaning up temp files older than ${hoursOld} hours...`)
  
  let deleted = 0
  const errors: string[] = []
  
  try {
    // List objects in temp bucket
    const listResponse = await client.send(new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1000
    }))
    
    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log('No files to clean up')
      return { deleted: 0, errors: [] }
    }
    
    // Filter old files
    const oldFiles = listResponse.Contents.filter(obj => {
      if (!obj.LastModified || !obj.Key) return false
      return obj.LastModified.getTime() < cutoffTime
    })
    
    if (oldFiles.length === 0) {
      console.log('No old files to clean up')
      return { deleted: 0, errors: [] }
    }
    
    // Delete old files in batches
    const deleteObjects = oldFiles.map(obj => ({ Key: obj.Key! }))
    
    await client.send(new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: { Objects: deleteObjects }
    }))
    
    deleted = deleteObjects.length
    console.log(`✅ Deleted ${deleted} old temp files`)
    
  } catch (error: any) {
    const errorMsg = `Failed to cleanup temp bucket: ${error.message}`
    console.error(errorMsg)
    errors.push(errorMsg)
  }
  
  return { deleted, errors }
}

/**
 * Get bucket statistics
 */
export async function getBucketStats(): Promise<Record<string, {
  exists: boolean
  objectCount?: number
  totalSize?: number
  error?: string
}>> {
  const stats: Record<string, any> = {}
  
  for (const [key, config] of Object.entries(BUCKET_CONFIG)) {
    const bucketName = config.name
    
    try {
      await client.send(new HeadBucketCommand({ Bucket: bucketName }))
      
      // Get object count and size
      const listResponse = await client.send(new ListObjectsV2Command({
        Bucket: bucketName
      }))
      
      const objects = listResponse.Contents || []
      const totalSize = objects.reduce((sum, obj) => sum + (obj.Size || 0), 0)
      
      stats[bucketName] = {
        exists: true,
        objectCount: objects.length,
        totalSize,
        description: config.description
      }
    } catch (error: any) {
      stats[bucketName] = {
        exists: false,
        error: error.message
      }
    }
  }
  
  return stats
}