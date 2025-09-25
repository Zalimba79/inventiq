# MinIO Quick Start Guide

A step-by-step guide to get MinIO storage working with Inventiq.

## Prerequisites

- MinIO server running (e.g., on Synology NAS)
- Node.js project with Next.js
- Network access to MinIO server

## 1. Installation

```bash
# Install required packages
npm install @aws-sdk/client-s3 sharp
```

## 2. Environment Setup

Add to your `.env.local`:

```env
# MinIO Server Configuration
S3_ENDPOINT=http://10.2.200.102:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=adm_maie
S3_SECRET_KEY=inventiq!2025
S3_PUBLIC_URL=http://10.2.200.102:9000
```

## 3. Initialize Buckets

First time setup - creates all required buckets:

```bash
# Using curl
curl http://localhost:3000/api/storage/init

# Or in your app
fetch('/api/storage/init')
  .then(res => res.json())
  .then(data => console.log('Buckets created:', data))
```

This creates 4 buckets:
- `inventiq-assets` - Public images
- `inventiq-private` - Private documents  
- `inventiq-temp` - Temporary files
- `inventiq-system` - System files

## 4. Upload Your First Image

### From a File Input

```jsx
function ImageUpload({ productId }) {
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', productId)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    console.log('Uploaded:', data.url)
    console.log('Thumbnail:', data.thumbnailUrl)
  }
  
  return (
    <input 
      type="file" 
      accept="image/*" 
      onChange={handleFileChange}
    />
  )
}
```

### From Camera Capture (Base64)

```jsx
function CameraCapture({ productId }) {
  const handleCapture = async (base64Image) => {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        base64Data: base64Image,
        filename: 'capture.jpg'
      })
    })
    
    const data = await response.json()
    console.log('Uploaded:', data.url)
  }
  
  // Your camera capture logic here
}
```

## 5. Display Images

Images in `inventiq-assets` are publicly accessible:

```jsx
function ProductImage({ imageUrl, thumbnailUrl, alt }) {
  return (
    <div>
      {/* Thumbnail for list views */}
      <img src={thumbnailUrl} alt={alt} />
      
      {/* Full image for detail views */}
      <img src={imageUrl} alt={alt} />
    </div>
  )
}
```

## 6. Test Your Setup

```bash
# Test connection
curl http://localhost:3000/api/storage/test

# Expected output:
{
  "success": true,
  "connection": "MinIO connection successful",
  "bucketExists": true,
  ...
}
```

## Common Tasks

### Upload Multiple Files

```javascript
async function uploadMultiple(files, productId) {
  const uploads = files.map(file => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', productId)
    return fetch('/api/upload', { method: 'POST', body: formData })
  })
  
  return Promise.all(uploads)
}
```

### Delete an Image

```javascript
async function deleteProductImage(imageUrl) {
  // This would call your delete endpoint
  return fetch('/api/storage/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: imageUrl })
  })
}
```

### Generate Only Thumbnail

```javascript
const result = await uploadProductImage(
  productId,
  imageBuffer,
  filename,
  { 
    optimize: false,  // Skip main image optimization
    generateThumbnail: true  // Still generate thumbnail
  }
)
```

## File Size & Optimization

Default settings:
- Max width: 1920px
- JPEG quality: 85%
- Thumbnail size: 300x300px
- Thumbnail quality: 70%

Customize per upload:

```javascript
const result = await uploadProductImage(
  productId,
  imageBuffer,
  filename,
  {
    maxWidth: 2560,      // 2K resolution
    quality: 95,         // Higher quality
    generateThumbnail: true
  }
)
```

## Troubleshooting

### "Storage service not configured"
- Check your `.env.local` has all S3_* variables
- Restart your Next.js dev server

### "Connection refused"
- Verify MinIO is running: `ping 10.2.200.102`
- Check port 9000 is open
- Verify you're on the right network/VLAN

### Images not showing
- Check S3_PUBLIC_URL is correct
- Verify bucket has public read policy
- Try accessing URL directly in browser

### Upload fails
- Check file size (default limit: 10MB)
- Verify productId is provided
- Check MinIO has enough storage space

## Next Steps

1. **Implement image deletion** - Add delete functionality
2. **Add progress tracking** - Show upload progress to users  
3. **Implement caching** - Cache frequently accessed images
4. **Set up CDN** - For production performance
5. **Add image validation** - Check file types and sizes

## Security Notes

- Never commit `.env.local` with real credentials
- Use different credentials for production
- Consider implementing signed URLs for private content
- Regularly rotate access keys

## Support

- [Full Documentation](./MINIO-INTEGRATION.md)
- [API Reference](./MINIO-INTEGRATION.md#api-reference)
- MinIO Dashboard: http://10.2.200.102:9000