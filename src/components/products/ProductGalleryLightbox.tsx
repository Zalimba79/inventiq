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
  Maximize2,
  Trash2,
  Star
} from 'lucide-react'
import React, { useState, useCallback, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { usePhotoLoader } from '@/hooks/usePhotoLoader'
import { cn } from '@/lib/utils'
import type { Product } from '@/store/product-db-store'

interface ProductGalleryLightboxProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  initialPhotoIndex?: number
  onSetPrimaryPhoto?: (photoId: string) => void
  onDeletePhoto?: (photoId: string) => void
}

export function ProductGalleryLightbox({ 
  isOpen, 
  onClose, 
  product,
  initialPhotoIndex = 0,
  onSetPrimaryPhoto,
  onDeletePhoto
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

  const handleSetPrimary = useCallback(() => {
    if (currentPhoto && onSetPrimaryPhoto && !currentPhoto.isPrimary) {
      onSetPrimaryPhoto(currentPhoto.id)
    }
  }, [currentPhoto, onSetPrimaryPhoto])

  const handleDeletePhoto = useCallback(() => {
    if (currentPhoto && onDeletePhoto && product.photos.length > 1) {
      const photoToDelete = currentPhoto.id
      // Move to previous photo before deleting
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      } else if (product.photos.length > 1) {
        setCurrentIndex(0)
      }
      onDeletePhoto(photoToDelete)
    }
  }, [currentPhoto, currentIndex, onDeletePhoto, product.photos.length])

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
              {/* Set as Primary Photo - Shows star (outline or filled) */}
              {onSetPrimaryPhoto && currentPhoto && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!currentPhoto.isPrimary && onSetPrimaryPhoto) {
                      onSetPrimaryPhoto(currentPhoto.id)
                    }
                  }}
                  className={cn(
                    "text-white",
                    !currentPhoto.isPrimary && "hover:bg-white/20"
                  )}
                  title={currentPhoto.isPrimary ? "Primary photo" : "Set as primary photo"}
                >
                  <Star className={cn(
                    "h-4 w-4",
                    currentPhoto.isPrimary && "fill-white"
                  )} />
                </Button>
              )}
              
              {/* Delete Photo */}
              {onDeletePhoto && product.photos.length > 1 && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleDeletePhoto}
                  className="text-red-400 hover:bg-red-400/20"
                  title="Delete photo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              
              <div className="w-px h-6 bg-white/20" />
              
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
          <div className="relative flex items-center justify-center w-full h-full overflow-hidden px-16 py-20">
            {imageUrl ? (
              <div
                className="relative transition-transform duration-200 flex items-center justify-center"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              >
                <img
                  src={imageUrl}
                  alt={`${product.name || 'Product'} - Image ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    maxHeight: 'calc(100vh - 200px)',
                    maxWidth: 'calc(100vw - 160px)',
                    width: 'auto',
                    height: 'auto',
                  }}
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
            <div className="flex gap-2 justify-center overflow-x-auto max-w-full" style={{ scrollbarWidth: 'thin' }}>
              {/* Sort photos to show primary first, then others in original order */}
              {[...product.photos].sort((a, b) => {
                if (a.isPrimary) return -1
                if (b.isPrimary) return 1
                return 0
              }).map((photo) => {
                // Find the actual index in the original array for selection
                const actualIndex = product.photos.findIndex(p => p.id === photo.id)
                const thumbUrl = photo.thumbnailUrl ?? photo.url ?? photo.dataUrl
                const isSelected = currentIndex === actualIndex
                
                return (
                  <button
                    key={photo.id}
                    onClick={() => handleThumbnailClick(actualIndex)}
                    className={cn(
                      "relative w-20 h-20 rounded overflow-hidden border-2 transition-all flex-shrink-0",
                      isSelected 
                        ? "border-white scale-110 shadow-xl" 
                        : "border-white/20 hover:border-white/50 opacity-80 hover:opacity-100"
                    )}
                    title={`Image ${actualIndex + 1}${photo.isPrimary ? ' (Main)' : ''}`}
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={`Thumbnail ${actualIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800" />
                    )}
                    
                    {/* Primary indicator - Black label with white text */}
                    {photo.isPrimary && (
                      <div className="absolute top-1 right-1 bg-black rounded px-1.5 py-0.5">
                        <span className="text-[10px] font-semibold text-white">Main</span>
                      </div>
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