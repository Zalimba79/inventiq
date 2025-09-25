#!/usr/bin/env node

/**
 * Test MinIO Upload
 * Tests the upload functionality directly
 */

const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

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

async function testUpload() {
  console.log('Testing MinIO Upload...\n');
  console.log(`Server: ${process.env.S3_ENDPOINT}`);
  console.log(`Access Key: ${process.env.S3_ACCESS_KEY}\n`);
  
  const bucket = 'inventiq-assets';
  const key = 'test/test-image.txt';
  const content = 'Hello from Inventiq test!';
  
  try {
    // Upload test file
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(content),
      ContentType: 'text/plain'
    }));
    
    console.log(`✓ Upload successful!`);
    console.log(`  Bucket: ${bucket}`);
    console.log(`  Key: ${key}`);
    console.log(`  URL: ${process.env.S3_PUBLIC_URL}/${bucket}/${key}\n`);
    
    // Try to read it back
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    const response = await client.send(getCommand);
    const bodyString = await streamToString(response.Body);
    
    console.log(`✓ Read successful!`);
    console.log(`  Content: "${bodyString}"\n`);
    
    // Test public URL
    console.log(`Test public access:`);
    console.log(`  curl ${process.env.S3_PUBLIC_URL}/${bucket}/${key}`);
    
  } catch (error) {
    console.error('✗ Upload failed:', error.message);
    console.error('\nDetails:', error);
  }
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

testUpload().catch(console.error);