"use client"

import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Grid,
  Maximize2
} from 'lucide-react'
import Image from 'next/image'
import React, { useState, useCallback, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { usePhotoLoader } from '@/hooks/usePhotoLoader'
import { cn } from '@/lib/utils'
import type { Product, ProductPhoto } from '@/store/product-store'

interface ProductGalleryLightboxProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  initialPhotoIndex?: number
}

export function ProductGalleryLightbox({ 
  isOpen, 
  onClose, 
  product,
  initialPhotoIndex = 0
}: ProductGalleryLightboxProps): JSX.Element | null {
  const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [imageResolution, setImageResolution] = useState<{ width: number, height: number } | null>(null)

  const currentPhoto = product.photos[currentIndex]
  const { photo: loadedPhoto } = usePhotoLoader(currentPhoto ?? null)
  
  // Get the image URL (MinIO URL, loaded dataUrl, or original dataUrl)
  const imageUrl = currentPhoto?.url ?? loadedPhoto?.dataUrl ?? currentPhoto?.dataUrl

  // Reset when opening or changing photo
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialPhotoIndex)
      setZoom(1)
      setRotation(0)
      setImageResolution(null)
    }
  }, [isOpen, initialPhotoIndex])

  // Get image resolution
  useEffect(() => {
    if (imageUrl) {
      const img = new window.Image()
      img.onload = () => {
        setImageResolution({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      img.src = imageUrl
    }
  }, [imageUrl])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case 'r':
        case 'R':
          handleRotate()
          break
        case '0':
          handleReset()
          break
        case 't':
        case 'T':
          setShowThumbnails(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % product.photos.length)
    setZoom(1)
    setRotation(0)
  }, [product.photos.length])

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + product.photos.length) % product.photos.length)
    setZoom(1)
    setRotation(0)
  }, [product.photos.length])

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.5, 5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.5, 0.5))
  }, [])

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360)
  }, [])

  const handleReset = useCallback(() => {
    setZoom(1)
    setRotation(0)
  }, [])

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index)
    setZoom(1)
    setRotation(0)
  }, [])

  if (!isOpen || !product.photos.length) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-0"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>Product Gallery - {product.name || 'Product'}</DialogTitle>
          <DialogDescription>
            Viewing {currentIndex + 1} of {product.photos.length} photos. 
            Use arrow keys to navigate, +/- to zoom, R to rotate, T to toggle thumbnails.
          </DialogDescription>
        </VisuallyHidden>

        {/* Control Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-white font-medium">
                {product.name || 'Product Gallery'}
              </h3>
              <span className="text-white/60 text-sm">
                {currentIndex + 1} / {product.photos.length}
              </span>
              {imageResolution && (
                <span className="text-white/40 text-xs">
                  {imageResolution.width} × {imageResolution.height}px
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowThumbnails(!showThumbnails)}
                className="text-white hover:bg-white/20"
                title="Toggle thumbnails (T)"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleRotate}
                className="text-white hover:bg-white/20"
                title="Rotate (R)"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="text-white hover:bg-white/20"
                title="Zoom out (-)"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-white/60 text-sm w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleZoomIn}
                disabled={zoom >= 5}
                className="text-white hover:bg-white/20"
                title="Zoom in (+)"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleReset}
                className="text-white hover:bg-white/20"
                title="Reset (0)"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white/20"
                title="Close (ESC)"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Image Display */}
        <div className="flex items-center justify-center h-full relative">
          {/* Previous Button */}
          {product.photos.length > 1 && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePrevious}
              className="absolute left-4 z-10 text-white hover:bg-white/20 h-12 w-12"
              title="Previous (←)"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Image Container */}
          <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
            {imageUrl ? (
              <div
                className="relative transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              >
                <Image
                  src={imageUrl}
                  alt={`${product.name || 'Product'} - Image ${currentIndex + 1}`}
                  width={800}
                  height={600}
                  className="max-w-none"
                  style={{
                    maxHeight: '70vh',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                  priority
                />
              </div>
            ) : (
              <div className="text-white/60">Loading image...</div>
            )}
          </div>

          {/* Next Button */}
          {product.photos.length > 1 && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleNext}
              className="absolute right-4 z-10 text-white hover:bg-white/20 h-12 w-12"
              title="Next (→)"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}
        </div>

        {/* Thumbnail Strip */}
        {showThumbnails && product.photos.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex gap-2 justify-center overflow-x-auto max-w-full">
              {product.photos.map((photo, index) => {
                // Use URL directly without hook for thumbnails
                const thumbUrl = photo.thumbnailUrl ?? photo.url ?? photo.dataUrl
                
                return (
                  <button
                    key={photo.id}
                    onClick={() => handleThumbnailClick(index)}
                    className={cn(
                      "relative w-20 h-20 rounded overflow-hidden border-2 transition-all flex-shrink-0",
                      currentIndex === index 
                        ? "border-white scale-110" 
                        : "border-white/20 hover:border-white/50"
                    )}
                    title={`Image ${index + 1}`}
                  >
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800" />
                    )}
                    {photo.isPrimary && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Keyboard Hints */}
        <div className="absolute bottom-4 left-4 text-white/40 text-xs space-y-1">
          <div>← → Navigate</div>
          <div>+ - Zoom</div>
          <div>R Rotate</div>
          <div>T Thumbnails</div>
          <div>ESC Close</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}