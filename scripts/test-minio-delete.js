#!/usr/bin/env node

/**
 * Test MinIO Delete
 * Tests the delete functionality
 */

const { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  },
  forcePathStyle: true
});

async function testDelete() {
  console.log('Testing MinIO Delete...\n');
  
  const bucket = 'inventiq-assets';
  const key = 'test/test-delete-image.txt';
  const content = 'This file will be deleted';
  
  try {
    // Upload test file
    console.log('1. Uploading test file...');
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(content),
      ContentType: 'text/plain'
    }));
    console.log(`✓ Upload successful: ${key}`);
    
    // Verify it exists
    console.log('\n2. Verifying file exists...');
    await client.send(new HeadObjectCommand({
      Bucket: bucket,
      Key: key
    }));
    console.log('✓ File exists');
    
    // Delete the file
    console.log('\n3. Deleting file...');
    await client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    }));
    console.log('✓ Delete successful');
    
    // Verify it's gone
    console.log('\n4. Verifying file is deleted...');
    try {
      await client.send(new HeadObjectCommand({
        Bucket: bucket,
        Key: key
      }));
      console.error('✗ File still exists!');
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        console.log('✓ File successfully deleted');
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ Delete functionality working correctly!');
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error('\nDetails:', error);
  }
}

testDelete().catch(console.error);