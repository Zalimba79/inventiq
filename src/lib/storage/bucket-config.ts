/**
 * MinIO Multi-Project Bucket Structure with Permissions
 * 
 * 📁 Bucket Structure:
 * - 🌐 inventiq-assets: Public readable (products, thumbnails, logos)
 * - 🔒 inventiq-private: Completely private (documents, exports, backups)
 * - ⏳ inventiq-temp: Private with auto-deletion (uploads, processing, cache)
 * - 🔧 inventiq-system: System access only (logs, configs, migrations)
 */

export const BUCKET_CONFIG = {
  // 🌐 Public Assets - Readable by everyone
  ASSETS: {
    name: 'inventiq-assets',
    public: true,
    folders: {
      PRODUCTS: 'products',
      CATEGORIES: 'categories',
      LOGOS: 'logos',
      THUMBNAILS: 'thumbnails'
    },
    description: 'Public readable assets (product images, logos, thumbnails)',
    retention: null // No automatic deletion
  },
  
  // 🔒 Private Storage - Restricted access
  PRIVATE: {
    name: 'inventiq-private',
    public: false,
    folders: {
      DOCUMENTS: 'documents',    // Invoices, contracts
      EXPORTS: 'exports',        // Excel/CSV exports
      BACKUPS: 'backups',        // Database backups
      REPORTS: 'reports'         // Business reports
    },
    description: 'Private business data (documents, exports, backups)',
    retention: null // No automatic deletion
  },
  
  // ⏳ Temporary Storage - Auto-cleanup
  TEMP: {
    name: 'inventiq-temp',
    public: false,
    folders: {
      UPLOADS: 'uploads',        // Upload staging
      PROCESSING: 'processing',  // AI processing
      CACHE: 'cache'            // Temporary cache
    },
    description: 'Temporary files with auto-deletion after 24 hours',
    retention: 24 // Hours before auto-deletion
  },
  
  // 🔧 System Storage - System access only
  SYSTEM: {
    name: 'inventiq-system',
    public: false,
    folders: {
      LOGS: 'logs',              // Application logs
      CONFIGS: 'configs',        // Configuration files
      MIGRATIONS: 'migrations'   // DB migration backups
    },
    description: 'System files (logs, configs, migrations)',
    retention: 30 * 24 // 30 days retention for logs
  }
} as const

// Type definitions for TypeScript
export type BucketName = typeof BUCKET_CONFIG[keyof typeof BUCKET_CONFIG]['name']
export type BucketType = keyof typeof BUCKET_CONFIG

// Helper to get bucket name by type
export function getBucketName(type: BucketType): string {
  return BUCKET_CONFIG[type].name
}

// Helper to get full path
export function getObjectPath(
  bucketType: BucketType, 
  folder: string, 
  filename: string
): string {
  const bucket = BUCKET_CONFIG[bucketType]
  return `${bucket.name}/${folder}/${filename}`
}

// Default bucket for different operations
export const DEFAULT_BUCKETS = {
  PRODUCT_IMAGES: BUCKET_CONFIG.ASSETS.name,
  TEMP_UPLOADS: BUCKET_CONFIG.TEMP.name,
  EXPORTS: BUCKET_CONFIG.PRIVATE.name,
  BACKUPS: BUCKET_CONFIG.PRIVATE.name,
  LOGS: BUCKET_CONFIG.SYSTEM.name
} as const