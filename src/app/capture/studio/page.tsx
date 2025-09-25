"use client"

import { useRouter } from 'next/navigation'

import { StudioLayoutV2 } from '@/components/studio/StudioLayoutV2'
import { useProductStore } from '@/store/product-store'

interface StudioImage {
  id?: string
  dataUrl?: string
  url?: string
  thumbnailUrl?: string
  uploadStatus?: string
  timestamp: Date
}

/**
 * Studio Capture Page
 * Professional capture interface with camera selection and resolution control
 */
export default function StudioPage(): JSX.Element {
  const router = useRouter()
  const { createProduct } = useProductStore()
  
  const handleSave = (images: StudioImage[]): void => {
    // Create product with captured images
    console.log('🎬 Studio handleSave called with images:', images)
    
    if (images.length > 0) {
      const photos = images.map((img, index) => {
        console.log(`📸 Processing image ${index + 1}:`, {
          hasDataUrl: !!img.dataUrl,
          hasUrl: !!img.url,
          hasThumbnailUrl: !!img.thumbnailUrl,
          uploadStatus: img.uploadStatus,
          url: img.url,
          thumbnailUrl: img.thumbnailUrl
        })
        
        return {
          id: img.id || crypto.randomUUID(), // Use original ID if available
          dataUrl: img.url ? undefined : img.dataUrl, // Don't store dataUrl if we have MinIO URL
          url: img.url, // MinIO URL if available
          thumbnailUrl: img.thumbnailUrl, // MinIO thumbnail URL if available
          mimeType: 'image/jpeg',
          size: img.url ? 100000 : (img.dataUrl?.length || 0) * 0.75,
          isPrimary: index === 0,
          timestamp: img.timestamp,
          storageType: img.url ? 'minio' as const : 'localStorage' as const,
          compressed: false
        }
      })
      
      console.log('📦 Creating product with photos:', photos)
      void createProduct(photos, 1)
      router.push('/products/draft')
    }
  }
  
  return (
    <StudioLayoutV2 
      onSave={handleSave}
      className="h-full"
    />  )
}