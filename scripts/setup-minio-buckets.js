#!/usr/bin/env node

/**
 * Setup MinIO Buckets
 * Creates all required buckets for Inventiq
 */

const { S3Client, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');

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

const BUCKETS = [
  {
    name: 'inventiq-assets',
    public: true,
    description: 'Public assets (product images, thumbnails)'
  },
  {
    name: 'inventiq-private',
    public: false,
    description: 'Private storage (documents, exports)'
  },
  {
    name: 'inventiq-temp',
    public: false,
    description: 'Temporary storage (auto-cleanup)'
  },
  {
    name: 'inventiq-system',
    public: false,
    description: 'System storage (logs, configs)'
  }
];

async function createBucket(bucket) {
  try {
    // Check if bucket exists
    await client.send(new HeadBucketCommand({ Bucket: bucket.name }));
    console.log(`✓ Bucket exists: ${bucket.name}`);
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      // Create bucket
      try {
        await client.send(new CreateBucketCommand({ Bucket: bucket.name }));
        console.log(`✓ Created bucket: ${bucket.name} - ${bucket.description}`);
        
        // Set public policy if needed
        if (bucket.public) {
          const policy = {
            Version: '2012-10-17',
            Statement: [{
              Sid: 'PublicRead',
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket.name}/*`]
            }]
          };
          
          await client.send(new PutBucketPolicyCommand({
            Bucket: bucket.name,
            Policy: JSON.stringify(policy)
          }));
          console.log(`  → Set public read policy`);
        }
      } catch (createError) {
        if (createError.name === 'BucketAlreadyOwnedByYou') {
          console.log(`✓ Bucket already owned: ${bucket.name}`);
        } else {
          console.error(`✗ Failed to create ${bucket.name}:`, createError.message);
        }
      }
    } else {
      console.error(`✗ Error checking ${bucket.name}:`, error.message);
    }
  }
}

async function main() {
  console.log('Setting up MinIO buckets for Inventiq...\n');
  console.log(`MinIO Server: ${process.env.S3_ENDPOINT}\n`);
  
  for (const bucket of BUCKETS) {
    await createBucket(bucket);
  }
  
  console.log('\n✓ MinIO setup complete!');
  console.log(`\nAccess MinIO console at: ${process.env.S3_ENDPOINT}`);
  console.log(`Username: ${process.env.S3_ACCESS_KEY}`);
}

main().catch(console.error);