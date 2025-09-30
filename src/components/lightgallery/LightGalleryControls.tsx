"use client"

import React from 'react'
import { 
  X, RotateCw, Star, Trash2, Download, Maximize2, Minimize2,
  Info, ZoomIn, ZoomOut, Grid3x3, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useLightGallery } from './LightGalleryContext'
import { cn } from '@/lib/utils'

interface LightGalleryControlsProps {
  onSetPrimaryPhoto?: (photoId: string) => Promise<void>
  onDeletePhoto?: (photoId: string) => Promise<void>
  onSaveRotation?: (photoId: string, rotation: number) => Promise<void>
}

export function LightGalleryControls({
  onSetPrimaryPhoto,
  onDeletePhoto,
  onSaveRotation
}: LightGalleryControlsProps) {
  const {
    product,
    currentIndex,
    zoom,
    setZoom,
    rotation,
    rotatePhoto,
    closeGallery,
    toggleInfo,
    toggleFullscreen,
    toggleThumbnails,
    isFullscreen,
    showInfo,
    showThumbnails,
    nextPhoto,
    previousPhoto,
    updateProduct,
    goToPhoto
  } = useLightGallery()
  
  const currentPhoto = product?.photos?.[currentIndex]
  const currentRotation = currentPhoto ? (rotation[currentPhoto.id] || 0) : 0
  
  const handleRotate = () => {
    if (!currentPhoto) return
    const newRotation = (currentRotation + 90) % 360
    rotatePhoto(currentPhoto.id, newRotation)
    if (onSaveRotation) {
      onSaveRotation(currentPhoto.id, newRotation).catch(console.error)
    }
  }
  
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.25, 4))
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.25, 0.5))
  const handleZoomReset = () => setZoom(1)
  
  const handleDownload = () => {
    if (!currentPhoto) return
    const link = document.createElement('a')
    link.href = currentPhoto.url || currentPhoto.dataUrl || ''
    link.download = `photo-${currentIndex + 1}.jpg`
    link.click()
  }
  
  if (!product) return null
  
  return (
    <>
      {/* Top Controls Bar */}
      <div className="absolute top-0 left-0 right-0 z-[10002] bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between p-4">
          {/* Left side - Product info */}
          <div className="flex items-center gap-4">
            <h3 className="text-white font-semibold text-lg">
              {product.name || 'Gallery'}
            </h3>
            <span className="text-white/70 text-sm">
              {currentIndex + 1} / {product.photos.length}
            </span>
          </div>
          
          {/* Center - Navigation for mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={previousPhoto}
              className="p-2 text-white/80 hover:text-white transition-all"
              disabled={product.photos.length <= 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextPhoto}
              className="p-2 text-white/80 hover:text-white transition-all"
              disabled={product.photos.length <= 1}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* Right side - Action buttons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Zoom controls */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Zoom Out (-)">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomReset}
                className="px-2 py-1 text-white/70 hover:text-white text-xs min-w-[3rem] hover:bg-white/10 rounded transition-all"
                title="Reset Zoom (0)">
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Zoom In (+)">
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-px h-6 bg-white/20 mx-1 hidden md:block" />
            
            {/* Primary photo */}
            {onSetPrimaryPhoto && currentPhoto && product && (
              <button
                onClick={async () => {
                  try {
                    await onSetPrimaryPhoto(currentPhoto.id)
                    console.log('Set primary photo:', currentPhoto.id)
                    
                    // Update the product in the context to reflect the primary change
                    const updatedPhotos = product.photos.map(photo => ({
                      ...photo,
                      isPrimary: photo.id === currentPhoto.id
                    }))
                    
                    // Sort photos to put primary first
                    const sortedPhotos = [...updatedPhotos].sort((a, b) => {
                      if (a.isPrimary && !b.isPrimary) return -1
                      if (!a.isPrimary && b.isPrimary) return 1
                      return 0
                    })
                    
                    // Update product with sorted photos
                    updateProduct({
                      ...product,
                      photos: sortedPhotos
                    })
                    
                    // Since we're setting this photo as primary, it will move to index 0
                    // Jump to index 0 to stay with the current photo
                    goToPhoto(0)
                  } catch (error) {
                    console.error('Failed to set primary photo:', error)
                  }
                }}
                disabled={currentPhoto.isPrimary}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  currentPhoto.isPrimary 
                    ? "text-yellow-400 cursor-default"
                    : "text-white/80 hover:text-yellow-400 hover:bg-white/10"
                )}
                title={currentPhoto.isPrimary ? "Primary Photo" : "Set as Primary (S)"}>
                <Star className={cn("w-4 h-4", currentPhoto.isPrimary && "fill-current")} />
              </button>
            )}
            
            {/* Rotate */}
            <button
              onClick={handleRotate}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Rotate (R)">
              <RotateCw className="w-4 h-4" />
            </button>
            
            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all hidden md:block"
              title="Download (D)">
              <Download className="w-4 h-4" />
            </button>
            
            {/* Info */}
            <button
              onClick={toggleInfo}
              className={cn(
                "p-2 rounded-lg transition-all",
                showInfo ? "text-white bg-white/20" : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              title="Photo Info (I)">
              <Info className="w-4 h-4" />
            </button>
            
            {/* Thumbnails */}
            <button
              onClick={toggleThumbnails}
              className={cn(
                "p-2 rounded-lg transition-all hidden md:block",
                showThumbnails ? "text-white bg-white/20" : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              title="Toggle Thumbnails (T)">
              <Grid3x3 className="w-4 h-4" />
            </button>
            
            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all hidden md:block"
              title="Fullscreen (F)">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            
            {/* Delete */}
            {onDeletePhoto && product && product.photos.length > 1 && (
              <button
                onClick={async () => {
                  if (currentPhoto && window.confirm('Delete this photo?')) {
                    try {
                      await onDeletePhoto(currentPhoto.id)
                      
                      // Update the product in the context to remove the deleted photo
                      const updatedPhotos = product.photos.filter(photo => photo.id !== currentPhoto.id)
                      
                      updateProduct({
                        ...product,
                        photos: updatedPhotos
                      })
                      
                      // If we deleted the current photo, move to the previous or first photo
                      if (currentIndex >= updatedPhotos.length && currentIndex > 0) {
                        previousPhoto()
                      }
                    } catch (error) {
                      console.error('Failed to delete photo:', error)
                    }
                  }
                }}
                className="p-2 text-white/80 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                title="Delete (Delete)">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            <div className="w-px h-6 bg-white/20 mx-1" />
            
            {/* Close */}
            <button
              onClick={closeGallery}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Close (Esc)">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Side Navigation Arrows (Desktop only) */}
      {product.photos.length > 1 && (
        <>
          <button
            onClick={previousPhoto}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-[10001] p-3 bg-black/50 text-white hover:bg-black/70 rounded-full transition-all backdrop-blur-sm items-center justify-center"
            title="Previous (←)">
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextPhoto}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-[10001] p-3 bg-black/50 text-white hover:bg-black/70 rounded-full transition-all backdrop-blur-sm items-center justify-center"
            title="Next (→)">
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </>
  )
}