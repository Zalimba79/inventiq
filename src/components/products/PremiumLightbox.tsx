"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, RotateCw, Star, Trash2, Download, Maximize2, Info, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/store/product-db-store'

interface PremiumLightboxProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  initialPhotoIndex?: number
  onSetPrimaryPhoto?: (photoId: string) => Promise<void>
  onDeletePhoto?: (photoId: string) => Promise<void>
  onSaveRotation?: (photoId: string, rotation: number) => Promise<void>
  onPermanentRotation?: (photoId: string, rotation: number) => Promise<void>
}

export function PremiumLightbox({
  isOpen,
  onClose,
  product,
  initialPhotoIndex = 0,
  onSetPrimaryPhoto,
  onDeletePhoto,
  onSaveRotation,
  onPermanentRotation
}: PremiumLightboxProps): JSX.Element | null {
  // Core state
  const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex)
  const [rotations, setRotations] = useState<Record<string, number>>({})
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  
  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialPhotoIndex)
      setZoom(1)
      setShowInfo(false)
      setImageLoading(true)
      
      // Load saved rotations from database
      const savedRotations: Record<string, number> = {}
      product?.photos?.forEach(photo => {
        if (photo?.angle) {
          savedRotations[photo.id] = parseInt(photo.angle)
        }
      })
      setRotations(savedRotations)
    }
  }, [isOpen, initialPhotoIndex, product])
  
  // Get current photo data
  const currentPhoto = product?.photos?.[currentIndex]
  const imageUrl = currentPhoto?.url || currentPhoto?.dataUrl
  const currentRotation = currentPhoto ? (rotations[currentPhoto.id] || 0) : 0
  
  // Navigation with animation
  const navigateToPhoto = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= product.photos.length) return
    if (newIndex === currentIndex) return
    
    setIsTransitioning(true)
    setImageLoading(true)
    setTimeout(() => {
      setCurrentIndex(newIndex)
      setZoom(1) // Reset zoom on navigation
      setIsTransitioning(false)
    }, 150)
  }, [currentIndex, product.photos.length])
  
  const handleNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % product.photos.length
    navigateToPhoto(nextIndex)
  }, [currentIndex, navigateToPhoto, product.photos.length])
  
  const handlePrevious = useCallback(() => {
    const prevIndex = (currentIndex - 1 + product.photos.length) % product.photos.length
    navigateToPhoto(prevIndex)
  }, [currentIndex, navigateToPhoto, product.photos.length])
  
  // Rotation handling
  const handleRotate = useCallback(() => {
    if (!currentPhoto) return
    
    setRotations(prev => {
      const current = prev[currentPhoto.id] || 0
      const newRotation = (current + 90) % 360
      
      // Save to database
      if (onSaveRotation) {
        onSaveRotation(currentPhoto.id, newRotation).catch(console.error)
      }
      
      return { ...prev, [currentPhoto.id]: newRotation }
    })
  }, [currentPhoto, onSaveRotation])
  
  // Zoom handling
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }, [])
  
  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }, [])
  
  const resetZoom = useCallback(() => {
    setZoom(1)
  }, [])
  
  // Fullscreen handling
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])
  
  // Touch gesture support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const deltaX = touchEndX - touchStartX.current
    const deltaY = Math.abs(touchEndY - touchStartY.current)
    
    // Horizontal swipe detection (ignore if vertical movement is significant)
    if (Math.abs(deltaX) > 50 && deltaY < 100) {
      if (deltaX > 0) {
        handlePrevious()
      } else {
        handleNext()
      }
    }
  }, [handleNext, handlePrevious])
  
  // Toggle info panel handler
  const toggleInfo = useCallback(() => {
    setShowInfo(prev => {
      console.log('Toggling info panel from', prev, 'to', !prev)
      return !prev
    })
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for certain keys
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
      }
      
      console.log('Key pressed:', e.key)
      
      switch(e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
        case 'r':
        case 'R':
          handleRotate()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
        case '_':
          handleZoomOut()
          break
        case '0':
          resetZoom()
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case 'i':
        case 'I':
          toggleInfo()
          break
        case 'Delete':
          if (onDeletePhoto && currentPhoto) {
            const confirmDelete = window.confirm('Delete this photo?')
            if (confirmDelete) {
              onDeletePhoto(currentPhoto.id)
            }
          }
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handlePrevious, handleNext, handleRotate, handleZoomIn, handleZoomOut, resetZoom, toggleFullscreen, toggleInfo, currentPhoto, onDeletePhoto])
  
  // Close on outside click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])
  
  if (!isOpen || !product?.photos?.length) return null
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Top Controls Bar */}
      <div className="absolute top-0 left-0 right-0 z-[10000] bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Product info */}
          <div className="flex items-center gap-4">
            <h3 className="text-white font-semibold text-lg">
              {product.name || 'Product Gallery'}
            </h3>
            <span className="text-white/70 text-sm">
              {currentIndex + 1} / {product.photos.length}
            </span>
          </div>
          
          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <button
              onClick={handleZoomOut}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Zoom Out (-)">
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white/70 text-sm min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Zoom In (+)">
              <ZoomIn className="w-5 h-5" />
            </button>
            
            <div className="w-px h-6 bg-white/20 mx-2" />
            
            {/* Action buttons */}
            {onSetPrimaryPhoto && currentPhoto && (
              <button
                onClick={() => onSetPrimaryPhoto(currentPhoto.id)}
                disabled={currentPhoto.isPrimary}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  currentPhoto.isPrimary 
                    ? "text-yellow-400 cursor-default"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
                title={currentPhoto.isPrimary ? "Primary Photo" : "Set as Primary"}>
                <Star className={cn("w-5 h-5", currentPhoto.isPrimary && "fill-current")} />
              </button>
            )}
            
            <button
              onClick={handleRotate}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Rotate (R)">
              <RotateCw className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleInfo}
              className={cn(
                "p-2 rounded-lg transition-all",
                showInfo ? "text-white bg-white/20" : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              title="Photo Info (I)">
              <Info className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Fullscreen (F)">
              <Maximize2 className="w-5 h-5" />
            </button>
            
            {onDeletePhoto && product.photos.length > 1 && (
              <button
                onClick={() => {
                  if (currentPhoto && window.confirm('Delete this photo?')) {
                    onDeletePhoto(currentPhoto.id)
                  }
                }}
                className="p-2 text-white/80 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                title="Delete (Del)">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            
            <div className="w-px h-6 bg-white/20 mx-2" />
            
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Close (Esc)">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Image Container */}
      <div 
        ref={imageContainerRef}
        className="absolute inset-0 flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrows */}
        {product.photos.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 z-[10001] p-3 bg-black/50 text-white hover:bg-black/70 rounded-full transition-all backdrop-blur-sm"
              title="Previous (←)">
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 z-[10001] p-3 bg-black/50 text-white hover:bg-black/70 rounded-full transition-all backdrop-blur-sm"
              title="Next (→)">
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
        
        {/* Main Image */}
        {imageUrl && (
          <div className="relative">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={product.name || 'Product photo'}
              className={cn(
                "max-w-[90vw] max-h-[80vh] object-contain transition-all duration-300",
                isTransitioning && "opacity-0",
                imageLoading && "opacity-0"
              )}
              style={{
                transform: `rotate(${currentRotation}deg) scale(${zoom})`,
                cursor: zoom > 1 ? 'grab' : 'default'
              }}
              onLoad={() => setImageLoading(false)}
              draggable={false}
            />
          </div>
        )}
        
        {/* Photo Info Panel */}
        {showInfo && currentPhoto && (
          <div className="absolute bottom-24 left-4 z-[10002] bg-black/90 backdrop-blur-md rounded-lg p-4 text-white text-sm border border-white/20 shadow-2xl">
            <h4 className="font-semibold mb-3 text-white">📊 Photo Information</h4>
            <div className="space-y-2 text-white/90">
              <p className="flex justify-between">
                <span>Dimensions:</span>
                <span className="font-mono">{currentPhoto.width || 'N/A'} × {currentPhoto.height || 'N/A'}px</span>
              </p>
              <p className="flex justify-between">
                <span>File Size:</span>
                <span className="font-mono">{currentPhoto.size ? `${(currentPhoto.size / 1024).toFixed(1)} KB` : 'N/A'}</span>
              </p>
              <p className="flex justify-between">
                <span>Type:</span>
                <span className="font-mono">{currentPhoto.mimeType || 'N/A'}</span>
              </p>
              <p className="flex justify-between">
                <span>Rotation:</span>
                <span className="font-mono">{currentRotation}°</span>
              </p>
              {currentPhoto.isPrimary && (
                <p className="text-yellow-400 font-semibold pt-2 border-t border-white/10">
                  ⭐ Primary Photo
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Thumbnail Strip */}
      <div className="absolute bottom-0 left-0 right-0 z-[10000] bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
          {product.photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => navigateToPhoto(index)}
              className={cn(
                "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                currentIndex === index 
                  ? "border-white shadow-lg scale-110" 
                  : "border-white/30 hover:border-white/60 hover:scale-105"
              )}
            >
              <img
                src={photo.thumbnailUrl || photo.url || photo.dataUrl || ''}
                alt=""
                className="w-full h-full object-cover"
                style={{
                  transform: `rotate(${rotations[photo.id] || 0}deg)`
                }}
              />
              {index === 0 && photo.isPrimary && (
                <Star className="absolute top-1 right-1 w-3 h-3 text-yellow-400 fill-current" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}