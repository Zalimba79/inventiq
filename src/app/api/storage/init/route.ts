import { NextResponse } from 'next/server'

import { initializeMinIO, getBucketStats } from '@/lib/storage/minio-init'

/**
 * Initialize all MinIO buckets with proper structure
 * GET /api/storage/init
 */
export async function GET() {
  try {
    console.log('Starting MinIO initialization...')
    
    // Initialize all buckets
    const initResult = await initializeMinIO()
    
    // Get statistics for each bucket
    const stats = await getBucketStats()
    
    return NextResponse.json({
      success: initResult.success,
      message: initResult.success 
        ? '✅ All buckets initialized successfully' 
        : '⚠️ Some buckets failed to initialize',
      buckets: initResult.results,
      stats,
      errors: initResult.errors,
      structure: {
        '🌐 inventiq-assets': 'Public readable (products, thumbnails, logos)',
        '🔒 inventiq-private': 'Private (documents, exports, backups)',
        '⏳ inventiq-temp': 'Temporary with auto-cleanup',
        '🔧 inventiq-system': 'System files (logs, configs)'
      }
    })
  } catch (error: any) {
    console.error('MinIO initialization failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize MinIO',
      details: error.message
    }, { status: 500 })
  }
}