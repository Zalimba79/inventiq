/**
 * Hook for loading photos from hybrid storage
 * Handles automatic loading from IndexedDB when needed
 */

import { useState, useEffect, useCallback } from 'react'

import { useProductStore } from '../store/product-store'
import type { ProductPhoto } from '../store/product-store'

export interface PhotoWithData extends ProductPhoto {
  dataUrl: string // Guaranteed to be loaded
  isLoading?: boolean
  error?: string
}

/**
 * Load a single photo with automatic IndexedDB fallback
 */
export function usePhotoLoader(photo: ProductPhoto | null) {
  const [photoData, setPhotoData] = useState<PhotoWithData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const loadPhoto = useProductStore(state => state.loadPhoto)
  
  useEffect(() => {
    if (!photo) {
      setPhotoData(null)
      return
    }
    
    // If photo already has dataUrl, use it directly
    if (photo.dataUrl) {
      setPhotoData({
        ...photo,
        dataUrl: photo.dataUrl
      })
      return
    }
    
    // Need to load from IndexedDB
    if (photo.storageType === 'indexedDB' && !photo.isLoaded) {
      setIsLoading(true)
      setError(null)
      
      loadPhoto(photo.id)
        .then(dataUrl => {
          if (dataUrl) {
            setPhotoData({
              ...photo,
              dataUrl,
              isLoading: false
            })
          } else {
            setError('Failed to load photo')
          }
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : 'Failed to load photo')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [photo, loadPhoto])
  
  return {
    photo: photoData,
    isLoading,
    error
  }
}

/**
 * Load multiple photos with batching
 */
export function usePhotoListLoader(photos: ProductPhoto[]) {
  const [loadedPhotos, setLoadedPhotos] = useState<PhotoWithData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const loadPhoto = useProductStore(state => state.loadPhoto)
  
  const loadPhotos = useCallback(async () => {
    if (photos.length === 0) {
      setLoadedPhotos([])
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const results: PhotoWithData[] = []
      
      // Process photos in parallel
      await Promise.all(
        photos.map(async (photo, index) => {
          if (photo.dataUrl) {
            // Already loaded
            results[index] = {
              ...photo,
              dataUrl: photo.dataUrl
            }
          } else if (photo.storageType === 'indexedDB') {
            // Load from IndexedDB
            const dataUrl = await loadPhoto(photo.id)
            if (dataUrl) {
              results[index] = {
                ...photo,
                dataUrl
              }
            } else {
              results[index] = {
                ...photo,
                dataUrl: '', // Fallback
                error: 'Failed to load'
              }
            }
          } else {
            // Default storage type, assume localStorage
            results[index] = {
              ...photo,
              dataUrl: photo.dataUrl ?? '',
              error: photo.dataUrl ? undefined : 'No data URL'
            }
          }
        })
      )
      
      setLoadedPhotos(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos')
    } finally {
      setIsLoading(false)
    }
  }, [photos, loadPhoto])
  
  useEffect(() => {
    void loadPhotos()
  }, [loadPhotos])
  
  return {
    photos: loadedPhotos,
    isLoading,
    error,
    reload: loadPhotos
  }
}

/**
 * Create a ProductPhoto with proper defaults for the new hybrid system
 */
export function createProductPhoto(params: {
  dataUrl: string
  mimeType?: string
  isPrimary?: boolean
  angle?: string
  timestamp?: Date
}): ProductPhoto {
  const size = estimatePhotoSize(params.dataUrl)
  const sizeInMB = size / (1024 * 1024)
  
  return {
    id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    dataUrl: params.dataUrl,
    mimeType: params.mimeType ?? 'image/jpeg',
    size,
    isPrimary: params.isPrimary ?? false,
    angle: params.angle,
    timestamp: params.timestamp ?? new Date(),
    isLoaded: true,
    storageType: sizeInMB > 0.5 ? 'indexedDB' : 'localStorage', // Auto-determine
    originalSize: size,
    compressed: false
  }
}

// Helper function to estimate photo size
function estimatePhotoSize(dataUrl: string): number {
  const base64Data = dataUrl.split(',')[1]
  if (!base64Data) return 0
  
  const padding = base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0
  return Math.round((base64Data.length * 3) / 4) - padding
}