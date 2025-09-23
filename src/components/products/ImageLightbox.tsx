"use client"

import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { ZoomIn, ZoomOut, RotateCw, X, Maximize2, Move } from 'lucide-react'
import Image from 'next/image'
import React, { useState, useCallback, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'


interface ImageLightboxProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  imageAlt?: string
}

export const ImageLightbox = ({ isOpen, onClose, imageSrc, imageAlt = 'Product' }: ImageLightboxProps): JSX.Element | null => {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageResolution, setImageResolution] = useState<{ width: number, height: number } | null>(null)

  // Reset when opening and get image resolution
  useEffect(() => {
    if (isOpen) {
      setZoom(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
      setImageResolution(null)
      
      // Load image to get resolution
      const img = new window.Image()
      img.onload = () => {
        setImageResolution({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      img.src = imageSrc
    }
  }, [isOpen, imageSrc])

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
    setPosition({ x: 0, y: 0 })
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      switch (e.key) {
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
        case '_':
          handleZoomOut()
          break
        case 'r':
          handleRotate()
          break
        case '0':
          handleReset()
          break
        case 'Escape':
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleRotate, handleReset])

  const handleFitScreen = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [zoom, position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart, zoom])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Note: preventDefault removed as wheel events are passive by default
    // The zoom functionality still works without preventing default scroll
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setZoom(prev => Math.max(0.5, Math.min(5, prev + delta)))
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-0"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>Image Preview</DialogTitle>
          <DialogDescription>
            Use scroll to zoom, drag to pan when zoomed. Keyboard: +/- for zoom, R to rotate, 0 to reset, ESC to close.
          </DialogDescription>
        </VisuallyHidden>
        {/* Control Bar */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
            className="text-white hover:bg-white/20"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-white text-sm min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomIn}
            className="text-white hover:bg-white/20"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-white/20" />
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRotate}
            className="text-white hover:bg-white/20"
            title="Rotate (R)"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleFitScreen}
            className="text-white hover:bg-white/20"
            title="Fit to Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="text-white hover:bg-white/20"
            title="Reset (0)"
          >
            Reset
          </Button>
        </div>

        {/* Close Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Help Text and Resolution */}
        <div className="absolute bottom-4 left-4 z-50 text-white/60 text-xs space-y-1">
          {imageResolution && (
            <p className="text-white/80 font-medium">
              Resolution: {imageResolution.width} × {imageResolution.height}px
            </p>
          )}
          <p>Scroll to zoom • Drag to pan (when zoomed)</p>
          <p>Keyboard: +/- Zoom • R Rotate • 0 Reset • Esc Close</p>
        </div>

        {/* Image Container */}
        {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <div 
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          role="img"
          aria-label={`Lightbox view of ${imageAlt}. Use scroll to zoom, drag to pan.`}
          tabIndex={0}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1200}
            height={800}
            className={cn(
              "max-w-none transition-transform duration-200",
              isDragging && "transition-none"
            )}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center',
            }}
            draggable={false}
            priority
          />
          
          {/* Drag indicator */}
          {zoom > 1 && !isDragging && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Move className="w-8 h-8 text-white/20" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}