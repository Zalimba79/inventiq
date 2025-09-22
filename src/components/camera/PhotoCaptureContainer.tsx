"use client"

import React, { type ReactNode } from 'react'

import { type ProductPhoto } from '@/store/product-store'

export interface PhotoCaptureContext {
  photos: ProductPhoto[]
  quantity: number
  onCapture: (photo: ProductPhoto) => void
  onQuantityChange: (quantity: number) => void
  onRemovePhoto: (photoId: string) => void
  onCreateProduct: () => Promise<void>
  onFinish: () => void
}

const PhotoCaptureContext = React.createContext<PhotoCaptureContext | null>(null)

export function usePhotoCapture() {
  const context = React.useContext(PhotoCaptureContext)
  if (!context) {
    throw new Error('usePhotoCapture must be used within PhotoCaptureContainer')
  }
  return context
}

interface PhotoCaptureContainerProps {
  children: ReactNode
  photos: ProductPhoto[]
  quantity: number
  onCapture: (photo: ProductPhoto) => void
  onQuantityChange: (quantity: number) => void
  onRemovePhoto: (photoId: string) => void
  onCreateProduct: () => Promise<void>
  onFinish: () => void
}

export function PhotoCaptureContainer({
  children,
  photos,
  quantity,
  onCapture,
  onQuantityChange,
  onRemovePhoto,
  onCreateProduct,
  onFinish
}: PhotoCaptureContainerProps) {
  const value: PhotoCaptureContext = {
    photos,
    quantity,
    onCapture,
    onQuantityChange,
    onRemovePhoto,
    onCreateProduct,
    onFinish
  }

  return (
    <PhotoCaptureContext.Provider value={value}>
      {children}
    </PhotoCaptureContext.Provider>
  )
}