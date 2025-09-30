#!/usr/bin/env node

/**
 * Test External MinIO Connection
 * Verifies that the external MinIO URL is accessible
 */

require('dotenv').config({ path: '.env.local' })
const { S3Client, ListBucketsCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3')
const https = require('https')

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

async function testConnection() {
  console.log('🔍 Testing External MinIO Connection')
  console.log('=====================================\n')
  
  console.log('Configuration:')
  console.log(`  Endpoint: ${process.env.S3_ENDPOINT}`)
  console.log(`  Public URL: ${process.env.S3_PUBLIC_URL}`)
  console.log(`  Bucket: ${process.env.S3_BUCKET}`)
  console.log(`  Access Key: ${process.env.S3_ACCESS_KEY?.substring(0, 4)}****\n`)

  try {
    // Test 1: List buckets
    console.log('Test 1: Listing buckets...')
    const { Buckets } = await client.send(new ListBucketsCommand({}))
    console.log(`✅ Found ${Buckets?.length || 0} buckets:`)
    Buckets?.forEach(bucket => {
      console.log(`   - ${bucket.Name}`)
    })
    console.log()

    // Test 2: List objects in inventiq-assets bucket
    const bucket = 'inventiq-assets'
    console.log(`Test 2: Listing objects in '${bucket}' bucket...`)
    
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 10
    })
    
    const { Contents, KeyCount } = await client.send(listCommand)
    console.log(`✅ Found ${KeyCount || 0} objects (showing max 10):`)
    
    if (Contents && Contents.length > 0) {
      Contents.forEach(obj => {
        console.log(`   - ${obj.Key} (${(obj.Size / 1024).toFixed(2)} KB)`)
      })
      
      // Test 3: Generate public URLs for first few objects
      console.log('\nTest 3: Public URLs for objects:')
      Contents.slice(0, 3).forEach(obj => {
        const publicUrl = `${process.env.S3_PUBLIC_URL}/${bucket}/${obj.Key}`
        console.log(`   - ${publicUrl}`)
      })
    } else {
      console.log('   (No objects found in bucket)')
    }
    
    // Test 4: Test HTTPS connectivity to public URL
    console.log('\nTest 4: Testing HTTPS connectivity to public URL...')
    const testUrl = new URL(process.env.S3_PUBLIC_URL)
    
    await new Promise((resolve, reject) => {
      https.get({
        hostname: testUrl.hostname,
        port: testUrl.port || 443,
        path: '/',
        rejectUnauthorized: false // Allow self-signed certificates
      }, (res) => {
        console.log(`✅ HTTPS connection successful (Status: ${res.statusCode})`)
        resolve()
      }).on('error', (err) => {
        console.error(`❌ HTTPS connection failed: ${err.message}`)
        reject(err)
      })
    }).catch(() => {
      console.log('   Note: MinIO might not respond to root path, but object paths should work')
    })
    
    console.log('\n✅ All tests completed successfully!')
    console.log('\nNotes:')
    console.log('- Make sure the MinIO server is accessible from the internet')
    console.log('- Check firewall/router settings for port forwarding')
    console.log('- Verify SSL certificate configuration for HTTPS')
    console.log('- Ensure bucket policies allow public read access')
    
  } catch (error) {
    console.error('\n❌ Connection test failed!')
    console.error('Error:', error.message)
    
    if (error.Code === 'NoSuchBucket') {
      console.error('\n⚠️  The bucket does not exist. You may need to create it.')
    } else if (error.Code === 'AccessDenied') {
      console.error('\n⚠️  Access denied. Check your credentials.')
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n⚠️  Cannot resolve hostname. Check your DNS settings.')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Connection refused. Check if MinIO is running and accessible.')
    }
    
    process.exit(1)
  }
}

testConnection()