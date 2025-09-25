#!/usr/bin/env node

/**
 * Test Product Delete with MinIO cleanup
 * Verifies that deleting a product also removes its images from MinIO
 */

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

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

async function listProductImages() {
  console.log('Listing all product images in MinIO...\n');
  
  const bucket = 'inventiq-assets';
  
  try {
    const response = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: 'products/'
    }));
    
    if (response.Contents && response.Contents.length > 0) {
      console.log(`Found ${response.Contents.length} product images:\n`);
      
      // Group by product ID
      const productGroups = {};
      response.Contents.forEach(obj => {
        const parts = obj.Key.split('/');
        if (parts.length >= 3) {
          const productId = parts[1];
          if (!productGroups[productId]) {
            productGroups[productId] = [];
          }
          productGroups[productId].push(obj.Key);
        }
      });
      
      // Display grouped results
      Object.entries(productGroups).forEach(([productId, images]) => {
        console.log(`📦 ${productId}:`);
        images.forEach(image => {
          const filename = image.split('/').pop();
          console.log(`   - ${filename}`);
        });
        console.log('');
      });
      
      console.log(`\nTotal: ${response.Contents.length} images across ${Object.keys(productGroups).length} products`);
      
    } else {
      console.log('No product images found in MinIO');
    }
    
    // Also check thumbnails
    const thumbResponse = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: 'thumbnails/'
    }));
    
    if (thumbResponse.Contents && thumbResponse.Contents.length > 0) {
      console.log(`\nFound ${thumbResponse.Contents.length} thumbnails`);
    }
    
  } catch (error) {
    console.error('Error listing images:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('To test deletion:');
  console.log('1. Delete a product from the UI');
  console.log('2. Run this script again to verify images were removed');
  console.log('3. Or use "Clear All Data" to test bulk deletion');
}

listProductImages().catch(console.error);