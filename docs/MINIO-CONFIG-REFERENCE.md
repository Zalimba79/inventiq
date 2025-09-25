# MinIO Configuration Reference

Complete configuration guide for MinIO integration with Inventiq.

## Environment Variables

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `S3_ENDPOINT` | MinIO server URL | `http://10.2.200.102:9000` | ✅ |
| `S3_ACCESS_KEY` | Access key for authentication | `adm_maie` | ✅ |
| `S3_SECRET_KEY` | Secret key for authentication | `inventiq!2025` | ✅ |
| `S3_PUBLIC_URL` | Public URL for accessing files | `http://10.2.200.102:9000` | ✅ |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `S3_REGION` | AWS region (compatibility) | `us-east-1` | `eu-west-1` |
| `S3_BUCKET` | Default bucket (deprecated) | - | `inventiq` |
| `S3_USE_SSL` | Enable SSL/TLS | `false` | `true` |
| `S3_PORT` | Custom port | `9000` | `443` |

### Environment-Specific Configuration

```env
# Development (.env.local)
S3_ENDPOINT=http://10.2.200.102:9000
S3_PUBLIC_URL=http://10.2.200.102:9000

# Production (.env.production)
S3_ENDPOINT=https://s3.your-domain.com
S3_PUBLIC_URL=https://cdn.your-domain.com

# Docker (.env.docker)
S3_ENDPOINT=http://minio:9000
S3_PUBLIC_URL=http://localhost:9000
```

## Bucket Configuration

### Structure Definition

Located in `src/lib/storage/bucket-config.ts`:

```typescript
export const BUCKET_CONFIG = {
  ASSETS: {
    name: 'inventiq-assets',
    public: true,              // Public read access
    folders: {
      PRODUCTS: 'products',
      CATEGORIES: 'categories',
      LOGOS: 'logos',
      THUMBNAILS: 'thumbnails'
    },
    retention: null            // No auto-deletion
  },
  PRIVATE: {
    name: 'inventiq-private',
    public: false,             // Private access only
    folders: {
      DOCUMENTS: 'documents',
      EXPORTS: 'exports',
      BACKUPS: 'backups',
      REPORTS: 'reports'
    },
    retention: null
  },
  TEMP: {
    name: 'inventiq-temp',
    public: false,
    folders: {
      UPLOADS: 'uploads',
      PROCESSING: 'processing',
      CACHE: 'cache'
    },
    retention: 24              // Hours before deletion
  },
  SYSTEM: {
    name: 'inventiq-system',
    public: false,
    folders: {
      LOGS: 'logs',
      CONFIGS: 'configs',
      MIGRATIONS: 'migrations'
    },
    retention: 720             // 30 days for logs
  }
}
```

### Bucket Policies

#### Public Read Policy (inventiq-assets)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::inventiq-assets/*"]
    }
  ]
}
```

#### Private Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PrivateAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": ["s3:*"],
      "Resource": ["arn:aws:s3:::inventiq-private/*"],
      "Condition": {
        "StringNotEquals": {
          "aws:userid": ["AIDAI..."]
        }
      }
    }
  ]
}
```

### Lifecycle Rules

#### Temp Bucket Auto-Cleanup

```json
{
  "Rules": [
    {
      "Id": "auto-delete-temp-files",
      "Status": "Enabled",
      "Expiration": {
        "Days": 1
      },
      "Filter": {}
    }
  ]
}
```

#### System Logs Retention

```json
{
  "Rules": [
    {
      "Id": "delete-old-logs",
      "Status": "Enabled",
      "Expiration": {
        "Days": 30
      },
      "Filter": {
        "Prefix": "logs/"
      }
    }
  ]
}
```

## Upload Configuration

### Image Processing Options

```typescript
interface UploadOptions {
  optimize?: boolean        // Enable image optimization
  maxWidth?: number         // Maximum width in pixels
  quality?: number          // JPEG quality (1-100)
  generateThumbnail?: boolean // Generate thumbnail
}
```

### Default Settings

| Option | Default Value | Description |
|--------|--------------|-------------|
| `optimize` | `true` | Automatically optimize images |
| `maxWidth` | `1920` | Max width (Full HD) |
| `quality` | `85` | JPEG compression quality |
| `generateThumbnail` | `true` | Auto-generate 300x300 thumbnail |

### Size Limits

| Type | Limit | Configurable |
|------|-------|--------------|
| Max file size | 10MB | Yes |
| Max dimensions | 4096x4096 | Yes |
| Thumbnail size | 300x300 | Yes |
| Min quality | 60 | Yes |

## Client Configuration

### S3 Client Options

```typescript
const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  },
  forcePathStyle: true,  // Required for MinIO
  
  // Optional configurations
  maxAttempts: 3,        // Retry attempts
  requestTimeout: 30000, // 30 seconds
  
  // For HTTPS
  tls: process.env.S3_USE_SSL === 'true',
  
  // Custom endpoint parser for MinIO
  endpointProvider: (params) => ({
    url: new URL(process.env.S3_ENDPOINT)
  })
})
```

### Connection Pool Settings

```typescript
{
  maxSockets: 50,        // Max concurrent connections
  keepAlive: true,       // Keep connections alive
  keepAliveMsecs: 1000,  // Keep-alive interval
  timeout: 60000         // Socket timeout
}
```

## Performance Optimization

### Image Optimization Settings

```typescript
const optimizationProfiles = {
  thumbnail: {
    width: 300,
    height: 300,
    quality: 70,
    format: 'jpeg'
  },
  
  web: {
    maxWidth: 1920,
    quality: 85,
    format: 'jpeg',
    progressive: true
  },
  
  mobile: {
    maxWidth: 1080,
    quality: 80,
    format: 'jpeg'
  },
  
  highQuality: {
    maxWidth: 3840,  // 4K
    quality: 95,
    format: 'jpeg'
  }
}
```

### Caching Configuration

```typescript
const cacheConfig = {
  // Browser caching headers
  cacheControl: 'public, max-age=31536000',  // 1 year
  
  // CDN configuration
  cdnUrl: process.env.CDN_URL || process.env.S3_PUBLIC_URL,
  
  // Local cache settings
  localCache: {
    enabled: true,
    maxSize: 100 * 1024 * 1024,  // 100MB
    ttl: 3600  // 1 hour
  }
}
```

## Security Configuration

### Access Control

```typescript
const securityConfig = {
  // CORS settings for browser uploads
  cors: {
    allowedOrigins: ['https://your-domain.com'],
    allowedMethods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400
  },
  
  // Signed URL settings
  signedUrl: {
    expiresIn: 3600,  // 1 hour
    algorithm: 'AWS4-HMAC-SHA256'
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100  // Max 100 requests per window
  }
}
```

### Encryption Settings

```typescript
const encryptionConfig = {
  // Server-side encryption
  serverSideEncryption: 'AES256',
  
  // Customer managed keys (optional)
  sseCustomerAlgorithm: 'AES256',
  sseCustomerKey: process.env.ENCRYPTION_KEY,
  
  // Bucket encryption
  bucketEncryption: {
    rules: [{
      applyServerSideEncryptionByDefault: {
        sseAlgorithm: 'AES256'
      }
    }]
  }
}
```

## Network Configuration

### Proxy Settings

```typescript
// For corporate networks
const proxyConfig = {
  httpProxy: process.env.HTTP_PROXY,
  httpsProxy: process.env.HTTPS_PROXY,
  noProxy: process.env.NO_PROXY
}
```

### DNS & Hosts

```bash
# Add to /etc/hosts for local development
10.2.200.102 minio.local
10.2.200.102 s3.inventiq.local
```

### Firewall Rules

| Direction | Port | Protocol | Description |
|-----------|------|----------|-------------|
| Inbound | 9000 | TCP | MinIO API |
| Inbound | 9001 | TCP | MinIO Console (optional) |
| Outbound | 443 | TCP | HTTPS (production) |
| Outbound | 80 | TCP | HTTP (development) |

## Monitoring & Logging

### Logging Configuration

```typescript
const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  
  // Log uploads
  logUploads: true,
  
  // Log S3 requests
  logS3Requests: process.env.NODE_ENV === 'development',
  
  // Metrics collection
  metrics: {
    enabled: true,
    interval: 60000,  // 1 minute
    include: ['uploadCount', 'uploadSize', 'errors']
  }
}
```

### Health Check Endpoints

```typescript
// MinIO health check
GET http://10.2.200.102:9000/minio/health/live
GET http://10.2.200.102:9000/minio/health/ready

// Application health check
GET /api/storage/health
```

## Migration Configuration

### From LocalStorage to MinIO

```typescript
const migrationConfig = {
  batchSize: 100,           // Process 100 items at a time
  concurrency: 5,           // 5 parallel uploads
  retryAttempts: 3,         // Retry failed uploads
  
  // Cleanup after migration
  deleteLocalData: false,   // Keep local backup
  
  // Progress tracking
  trackProgress: true,
  progressInterval: 1000    // Update every second
}
```

## Deployment Configurations

### Docker Compose

```yaml
version: '3.8'

services:
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: ${S3_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY}
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    
  app:
    build: .
    environment:
      S3_ENDPOINT: http://minio:9000
      S3_PUBLIC_URL: http://localhost:9000
    depends_on:
      - minio

volumes:
  minio_data:
```

### Kubernetes ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: minio-config
data:
  S3_ENDPOINT: "http://minio-service:9000"
  S3_REGION: "us-east-1"
  S3_PUBLIC_URL: "https://s3.your-domain.com"
```

### Production Checklist

- [ ] Use HTTPS for S3_ENDPOINT
- [ ] Set up CDN for S3_PUBLIC_URL
- [ ] Enable server-side encryption
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts
- [ ] Implement rate limiting
- [ ] Configure CORS properly
- [ ] Use signed URLs for private content
- [ ] Set up lifecycle policies
- [ ] Configure access logging