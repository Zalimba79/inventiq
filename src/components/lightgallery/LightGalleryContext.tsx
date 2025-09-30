"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Product } from '@/store/product-db-store'

interface LightGalleryContextType {
  // State
  isOpen: boolean
  currentIndex: number
  product: Product | null
  zoom: number
  rotation: Record<string, number>
  isFullscreen: boolean
  showInfo: boolean
  showThumbnails: boolean
  isLoading: boolean
  
  // Actions
  openGallery: (product: Product, index?: number) => void
  closeGallery: () => void
  nextPhoto: () => void
  previousPhoto: () => void
  goToPhoto: (index: number) => void
  setZoom: (zoom: number) => void
  rotatePhoto: (photoId: string, angle: number) => void
  toggleFullscreen: () => void
  toggleInfo: () => void
  toggleThumbnails: () => void
  setLoading: (loading: boolean) => void
  updateProduct: (product: Product) => void
}

const LightGalleryContext = createContext<LightGalleryContextType | undefined>(undefined)

export function useLightGallery() {
  const context = useContext(LightGalleryContext)
  if (!context) {
    throw new Error('useLightGallery must be used within LightGalleryProvider')
  }
  return context
}

interface LightGalleryProviderProps {
  children: ReactNode
}

export function LightGalleryProvider({ children }: LightGalleryProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [product, setProduct] = useState<Product | null>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState<Record<string, number>>({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  
  // Method to update product data (for primary photo changes)
  const updateProduct = useCallback((updatedProduct: Product) => {
    setProduct(updatedProduct)
  }, [])

  const openGallery = useCallback((product: Product, index = 0) => {
    setProduct(product)
    setCurrentIndex(index)
    setIsOpen(true)
    setZoom(1)
    setShowInfo(false)
    
    // Load saved rotations
    const savedRotations: Record<string, number> = {}
    product.photos.forEach(photo => {
      if (photo.angle) {
        savedRotations[photo.id] = parseInt(photo.angle)
      }
    })
    setRotation(savedRotations)
  }, [])

  const closeGallery = useCallback(() => {
    setIsOpen(false)
    setProduct(null)
    setCurrentIndex(0)
    setZoom(1)
    setIsFullscreen(false)
  }, [])

  const nextPhoto = useCallback(() => {
    if (!product) return
    setCurrentIndex(prev => (prev + 1) % product.photos.length)
    setZoom(1)
  }, [product])

  const previousPhoto = useCallback(() => {
    if (!product) return
    setCurrentIndex(prev => (prev - 1 + product.photos.length) % product.photos.length)
    setZoom(1)
  }, [product])

  const goToPhoto = useCallback((index: number) => {
    if (!product || index < 0 || index >= product.photos.length) return
    setCurrentIndex(index)
    setZoom(1)
  }, [product])

  const rotatePhoto = useCallback((photoId: string, angle: number) => {
    setRotation(prev => ({ ...prev, [photoId]: angle }))
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  const toggleInfo = useCallback(() => {
    setShowInfo(prev => !prev)
  }, [])

  const toggleThumbnails = useCallback(() => {
    setShowThumbnails(prev => !prev)
  }, [])

  const value = {
    isOpen,
    currentIndex,
    product,
    zoom,
    rotation,
    isFullscreen,
    showInfo,
    showThumbnails,
    isLoading,
    openGallery,
    closeGallery,
    nextPhoto,
    previousPhoto,
    goToPhoto,
    setZoom,
    rotatePhoto,
    toggleFullscreen,
    toggleInfo,
    toggleThumbnails,
    setLoading: setIsLoading,
    updateProduct
  }

  return (
    <LightGalleryContext.Provider value={value}>
      {children}
    </LightGalleryContext.Provider>
  )
}