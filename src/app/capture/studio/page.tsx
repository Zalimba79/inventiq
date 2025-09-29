"use client"

import { useRouter } from 'next/navigation'

import { StudioLayoutV2 } from '@/components/studio/StudioLayoutV2'
import { useProductDBStore } from '@/store/product-db-store'

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
  const { createProduct } = useProductDBStore()
  
  const handleSave = (images: StudioImage[], quantity: number): void => {
    // Create product with captured images and quantity
    console.log('🎬 Studio handleSave called with images and quantity:', images, quantity)
    
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
      
      console.log('📦 Creating product with photos and quantity:', photos, quantity)
      
      // Create product data for DB store
      const productData = {
        name: `Product ${new Date().toLocaleDateString()}`,
        status: 'DRAFT',
        quantity: quantity,
        userId: 'default-user',
        currency: 'EUR',
        photos: photos.map(photo => ({
          url: photo.url,
          thumbnailUrl: photo.thumbnailUrl,
          dataUrl: photo.dataUrl,
          mimeType: photo.mimeType,
          size: photo.size,
          isPrimary: photo.isPrimary
        }))
      }
      
      createProduct(productData)
        .then(() => {
          router.push('/products/draft')
        })
        .catch((error) => {
          console.error('Failed to create product:', error)
        })
    }
  }
  
  return (
    <StudioLayoutV2 
      onSave={handleSave}
      className="h-full"
    />  )
}