"use client"

import { useMemo } from 'react'

import { useProductStore } from '@/store/product-store'

interface RecentMedia {
  photos: RecentPhoto[]
  totalCount: number
  isLoading: boolean
}

interface RecentPhoto {
  id: string
  url: string
  thumbnail?: string
  productId: string
  productName?: string
  capturedAt: Date
  isPrimary: boolean
}

export function useRecentMedia(limit = 10): RecentMedia {
  const products = useProductStore((state) => state.products)

  const photos = useMemo(() => {
    const allPhotos: RecentPhoto[] = []
    
    products.forEach(product => {
      product.photos.forEach(photo => {
        allPhotos.push({
          id: photo.id,
          url: photo.dataUrl ?? '',
          thumbnail: photo.dataUrl,
          productId: product.id,
          productName: product.name,
          capturedAt: new Date(photo.timestamp),
          isPrimary: photo.isPrimary
        })
      })
    })
    
    // Sortiere nach Aufnahmezeit (neueste zuerst)
    allPhotos.sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime())
    
    return allPhotos.slice(0, limit)
  }, [products, limit])

  return {
    photos,
    totalCount: photos.length,
    isLoading: false
  }
}