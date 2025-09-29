/**
 * Hook for loading photos from database storage
 * Simplified version for database-backed photos with URLs
 */

import { useState, useEffect } from 'react'

import type { ProductPhoto } from '../store/product-db-store'

export interface PhotoWithData extends ProductPhoto {
  dataUrl: string // Guaranteed to be loaded (either dataUrl or url)
  isLoading?: boolean
  error?: string
}

/**
 * Load a single photo - simplified for database storage
 */
export function usePhotoLoader(photo: ProductPhoto | null): { photo: PhotoWithData | null; isLoading: boolean; error: string | null } {
  const [photoData, setPhotoData] = useState<PhotoWithData | null>(null)
  const [isLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!photo) {
      setPhotoData(null)
      setError(null)
      return
    }
    
    // For DB store, photos have URLs (MinIO) or dataUrls
    const effectiveUrl = photo.url || photo.dataUrl
    
    if (effectiveUrl) {
      setPhotoData({
        ...photo,
        dataUrl: effectiveUrl
      })
      setError(null)
    } else {
      setPhotoData(null)
      setError('No photo data available')
    }
  }, [photo])
  
  return {
    photo: photoData,
    isLoading,
    error
  }
}

/**
 * Load multiple photos
 */
export function usePhotoListLoader(photos: ProductPhoto[]): { photos: PhotoWithData[]; isLoading: boolean; error: string | null; reload: () => void } {
  const [loadedPhotos, setLoadedPhotos] = useState<PhotoWithData[]>([])
  const [isLoading] = useState(false)
  const [error] = useState<string | null>(null)
  
  useEffect(() => {
    const results: PhotoWithData[] = photos.map(photo => ({
      ...photo,
      dataUrl: photo.url || photo.dataUrl || ''
    }))
    
    setLoadedPhotos(results)
  }, [photos])
  
  return {
    photos: loadedPhotos,
    isLoading,
    error,
    reload: () => {} // No-op for now since photos are already loaded
  }
}

/**
 * Create a ProductPhoto with proper defaults
 */
export function createProductPhoto(params: {
  dataUrl: string
  mimeType?: string
  isPrimary?: boolean
  angle?: string
  timestamp?: Date
}): ProductPhoto {
  return {
    id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    dataUrl: params.dataUrl,
    url: undefined, // Will be set after upload to MinIO
    thumbnailUrl: undefined,
    mimeType: params.mimeType ?? 'image/jpeg',
    size: estimatePhotoSize(params.dataUrl),
    isPrimary: params.isPrimary ?? false,
    angle: params.angle,
    timestamp: params.timestamp ?? new Date(),
    width: undefined,
    height: undefined
  }
}

// Helper function to estimate photo size
function estimatePhotoSize(dataUrl: string): number {
  const base64Data = dataUrl.split(',')[1]
  if (!base64Data) return 0
  
  const padding = base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0
  return Math.round((base64Data.length * 3) / 4) - padding
}