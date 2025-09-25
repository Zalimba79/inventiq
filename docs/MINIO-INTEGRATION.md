# MinIO Integration Documentation

## Overview

Inventiq uses MinIO S3-compatible object storage for managing product images, documents, and other assets. The integration provides a scalable, self-hosted storage solution running on a Synology NAS in VLAN200.

## Table of Contents
- [Architecture](#architecture)
- [Bucket Structure](#bucket-structure)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Security & Permissions](#security--permissions)
- [Maintenance](#maintenance)

## Architecture

### Storage Tiers

```
MinIO Server (Synology NAS - 10.2.200.102:9000)
│
├── 🌐 Public Assets (inventiq-assets)
│   └── Accessible via direct URL
│
├── 🔒 Private Storage (inventiq-private)
│   └── Requires authentication
│
├── ⏳ Temporary Storage (inventiq-temp)
│   └── Auto-cleanup after 24 hours
│
└── 🔧 System Storage (inventiq-system)
    └── Internal use only
```

### Data Flow

```
Client → Upload API → MinIO Service → Storage Bucket
                           ↓
                    Image Optimization
                           ↓
                    Thumbnail Generation
```

## Bucket Structure

### inventiq-assets (Public)
Public-readable bucket for product images and assets.

```
inventiq-assets/
├── products/           # Product images
│   └── {productId}/
│       └── {timestamp}-{filename}
├── categories/         # Category images
├── logos/             # Company logos
└── thumbnails/        # Generated thumbnails
    └── {productId}/
        └── {timestamp}-thumb-{filename}
```

### inventiq-private (Private)
Secure storage for business documents and exports.

```
inventiq-private/
├── documents/         # Invoices, contracts
├── exports/          # Excel/CSV exports
├── backups/          # Database backups
└── reports/          # Business reports
```

### inventiq-temp (Temporary)
Temporary storage with automatic cleanup.

```
inventiq-temp/
├── uploads/          # Upload staging area
├── processing/       # AI processing queue
└── cache/           # Temporary cache
```

### inventiq-system (System)
System-level storage for logs and configurations.

```
inventiq-system/
├── logs/            # Application logs
├── configs/         # Configuration files
└── migrations/      # Database migration backups
```

## Configuration

### Environment Variables

Add to `.env.local`:

```env
# MinIO Configuration
S3_ENDPOINT=http://10.2.200.102:9000
S3_BUCKET=inventiq                    # Default bucket (deprecated)
S3_REGION=us-east-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_PUBLIC_URL=http://10.2.200.102:9000

# External Access (optional)
# S3_PUBLIC_URL=https://your-domain.com:9000
```

### Bucket Configuration

The bucket structure is defined in `src/lib/storage/bucket-config.ts`:

```typescript
export const BUCKET_CONFIG = {
  ASSETS: {
    name: 'inventiq-assets',
    public: true,
    folders: {
      PRODUCTS: 'products',
      CATEGORIES: 'categories',
      LOGOS: 'logos',
      THUMBNAILS: 'thumbnails'
    }
  },
  PRIVATE: {
    name: 'inventiq-private',
    public: false,
    folders: {
      DOCUMENTS: 'documents',
      EXPORTS: 'exports',
      BACKUPS: 'backups',
      REPORTS: 'reports'
    }
  },
  // ... more buckets
}
```

## API Reference

### Storage Service (`src/lib/storage/minio.ts`)

#### uploadProductImage

Uploads a product image with optional optimization and thumbnail generation.

```typescript
async function uploadProductImage(
  productId: string,
  file: Buffer,
  filename: string,
  options?: {
    optimize?: boolean        // Default: true
    maxWidth?: number         // Default: 1920
    quality?: number          // Default: 85
    generateThumbnail?: boolean // Default: true
  }
): Promise<{
  url: string
  thumbnailUrl?: string
}>
```

**Example:**
```typescript
const result = await uploadProductImage(
  'product-123',
  imageBuffer,
  'product.jpg',
  { maxWidth: 1920, quality: 90 }
)
// Returns: { url: "http://...", thumbnailUrl: "http://..." }
```

#### uploadBase64Image

Uploads a base64-encoded image (useful for camera captures).

```typescript
async function uploadBase64Image(
  productId: string,
  base64Data: string,
  filename?: string
): Promise<string>
```

#### deleteImage

Deletes an image from MinIO storage.

```typescript
async function deleteImage(url: string): Promise<void>
```

#### getImage

Retrieves an image from MinIO storage.

```typescript
async function getImage(key: string): Promise<Buffer>
```

### REST API Endpoints

#### POST /api/upload

Upload images via FormData or JSON.

**FormData Upload:**
```javascript
const formData = new FormData()
formData.append('file', fileBlob)
formData.append('productId', 'product-123')

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})
```

**JSON Upload (Base64):**
```javascript
const response = await fetch('/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'product-123',
    base64Data: 'data:image/jpeg;base64,/9j/4AAQ...',
    filename: 'capture.jpg'
  })
})
```

**Response:**
```json
{
  "success": true,
  "url": "http://10.2.200.102:9000/inventiq-assets/products/...",
  "thumbnailUrl": "http://10.2.200.102:9000/inventiq-assets/thumbnails/...",
  "filename": "product.jpg",
  "size": 245632
}
```

#### GET /api/storage/init

Initialize all MinIO buckets with proper structure.

```javascript
const response = await fetch('/api/storage/init')
```

**Response:**
```json
{
  "success": true,
  "message": "✅ All buckets initialized successfully",
  "buckets": {
    "inventiq-assets": true,
    "inventiq-private": true,
    "inventiq-temp": true,
    "inventiq-system": true
  },
  "stats": {
    "inventiq-assets": {
      "exists": true,
      "objectCount": 42,
      "totalSize": 10485760
    }
  }
}
```

#### GET /api/storage/test

Test MinIO connection and configuration.

```javascript
const response = await fetch('/api/storage/test')
```

#### DELETE /api/storage/cleanup

Clean up old or unused buckets.

```javascript
const response = await fetch('/api/storage/cleanup', {
  method: 'DELETE'
})
```

## Usage Examples

### Product Image Upload from Camera Capture

```typescript
// In your React component
const handleCameraCapture = async (base64Image: string) => {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: currentProduct.id,
        base64Data: base64Image,
        filename: `capture-${Date.now()}.jpg`
      })
    })
    
    const data = await response.json()
    console.log('Image uploaded:', data.url)
    console.log('Thumbnail:', data.thumbnailUrl)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

### File Upload with Progress

```typescript
const uploadFile = async (file: File, productId: string) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('productId', productId)
  
  const xhr = new XMLHttpRequest()
  
  // Track upload progress
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100
      console.log(`Upload progress: ${percentComplete}%`)
    }
  })
  
  xhr.open('POST', '/api/upload')
  xhr.send(formData)
}
```

### Bulk Image Processing

```typescript
const processBulkImages = async (files: File[], productId: string) => {
  const uploadPromises = files.map(file => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', productId)
    
    return fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
  })
  
  const results = await Promise.allSettled(uploadPromises)
  
  const successful = results.filter(r => r.status === 'fulfilled')
  const failed = results.filter(r => r.status === 'rejected')
  
  console.log(`Uploaded: ${successful.length}/${files.length}`)
  return successful
}
```

## Security & Permissions

### Bucket Policies

**Public Assets (inventiq-assets):**
- Read: Public
- Write: Authenticated only
- Delete: Admin only

**Private Storage (inventiq-private):**
- Read: Authenticated only
- Write: Authenticated only
- Delete: Admin only

**Temporary Storage (inventiq-temp):**
- Read: System only
- Write: System only
- Delete: Automatic after 24 hours

**System Storage (inventiq-system):**
- Read: System only
- Write: System only
- Delete: Admin only

### Access Control

```typescript
// Example middleware for protected routes
export async function validateStorageAccess(
  request: Request,
  bucketType: 'PRIVATE' | 'SYSTEM'
) {
  // Implement your authentication logic
  const isAuthenticated = await checkAuth(request)
  
  if (!isAuthenticated) {
    throw new Error('Unauthorized')
  }
  
  if (bucketType === 'SYSTEM') {
    const isAdmin = await checkAdminRole(request)
    if (!isAdmin) {
      throw new Error('Admin access required')
    }
  }
}
```

## Maintenance

### Automatic Cleanup

The temp bucket has automatic cleanup for files older than 24 hours:

```typescript
import { cleanupTempBucket } from '@/lib/storage/minio-init'

// Run cleanup (e.g., in a cron job)
const result = await cleanupTempBucket()
console.log(`Deleted ${result.deleted} old files`)
```

### Storage Monitoring

Monitor bucket usage and statistics:

```typescript
import { getBucketStats } from '@/lib/storage/minio-init'

const stats = await getBucketStats()

Object.entries(stats).forEach(([bucket, info]) => {
  console.log(`${bucket}:`)
  console.log(`  Files: ${info.objectCount}`)
  console.log(`  Size: ${(info.totalSize / 1024 / 1024).toFixed(2)} MB`)
})
```

### Backup Strategy

1. **Database Backups:** Store in `inventiq-private/backups/`
2. **Image Backups:** MinIO handles replication if configured
3. **Configuration Backups:** Store in `inventiq-system/configs/`

### Migration from LocalStorage

To migrate existing localStorage images to MinIO:

```typescript
// Example migration script
async function migrateToMinIO() {
  const products = getProductsFromLocalStorage()
  
  for (const product of products) {
    for (const photo of product.photos) {
      if (photo.dataUrl) {
        const result = await uploadBase64Image(
          product.id,
          photo.dataUrl,
          `migrated-${photo.id}.jpg`
        )
        
        // Update product with new URL
        photo.url = result.url
        photo.dataUrl = undefined // Clear base64 data
      }
    }
  }
  
  // Save updated products
  saveProductsToLocalStorage(products)
}
```

## Troubleshooting

### Common Issues

**Connection Refused:**
- Check if MinIO server is running: `curl http://10.2.200.102:9000/minio/health/live`
- Verify network connectivity to VLAN200
- Check firewall rules

**Access Denied:**
- Verify S3_ACCESS_KEY and S3_SECRET_KEY in `.env.local`
- Check bucket policies
- Ensure bucket exists: `GET /api/storage/test`

**Upload Failures:**
- Check file size limits (default: 10MB)
- Verify bucket has write permissions
- Check available storage space

**Image Not Displaying:**
- Verify S3_PUBLIC_URL is correct
- Check if bucket has public read policy
- Test direct URL access in browser

### Debug Mode

Enable debug logging:

```typescript
// In your MinIO service
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('MinIO Request:', {
    endpoint: process.env.S3_ENDPOINT,
    bucket: bucketName,
    key: objectKey
  })
}
```

## Best Practices

1. **Always use the bucket config** instead of hardcoding bucket names
2. **Generate thumbnails** for product images to improve performance
3. **Implement retry logic** for network failures
4. **Use appropriate bucket** based on data sensitivity
5. **Clean up temp files** regularly to save storage space
6. **Monitor storage usage** to prevent quota issues
7. **Implement caching** for frequently accessed images
8. **Use CDN** for production deployments

## Future Enhancements

- [ ] Image CDN integration
- [ ] Automatic image format conversion (WebP, AVIF)
- [ ] Smart image cropping with AI
- [ ] Video upload support
- [ ] Direct camera to S3 upload
- [ ] Signed URL generation for private content
- [ ] Multi-part upload for large files
- [ ] Image metadata extraction and storage