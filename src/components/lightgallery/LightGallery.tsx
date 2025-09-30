"use client"

import React, { useEffect, useRef } from 'react'
import { useLightGallery } from './LightGalleryContext'
import { LightGalleryImage } from './LightGalleryImage'
import { LightGalleryThumbnails } from './LightGalleryThumbnails'
import { LightGalleryControls } from './LightGalleryControls'
import { LightGalleryInfo } from './LightGalleryInfo'
import { LightGalleryLoader } from './LightGalleryLoader'
import { cn } from '@/lib/utils'

interface LightGalleryProps {
  onSetPrimaryPhoto?: (photoId: string) => Promise<void>
  onDeletePhoto?: (photoId: string) => Promise<void>
  onSaveRotation?: (photoId: string, rotation: number) => Promise<void>
}

export function LightGallery({
  onSetPrimaryPhoto,
  onDeletePhoto,
  onSaveRotation
}: LightGalleryProps) {
  const { 
    isOpen, 
    closeGallery, 
    nextPhoto, 
    previousPhoto,
    toggleInfo,
    toggleFullscreen,
    toggleThumbnails,
    setZoom,
    isFullscreen,
    isLoading
  } = useLightGallery()
  
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for navigation keys
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
      }
      
      switch(e.key) {
        case 'Escape':
          closeGallery()
          break
        case 'ArrowLeft':
          previousPhoto()
          break
        case 'ArrowRight':
          nextPhoto()
          break
        case 'i':
        case 'I':
          toggleInfo()
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case 't':
        case 'T':
          toggleThumbnails()
          break
        case '+':
        case '=':
          setZoom(prev => Math.min(prev + 0.25, 4))
          break
        case '-':
        case '_':
          setZoom(prev => Math.max(prev - 0.25, 0.5))
          break
        case '0':
          setZoom(1)
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeGallery, nextPhoto, previousPhoto, toggleInfo, toggleFullscreen, toggleThumbnails, setZoom])
  
  // Fullscreen handling
  useEffect(() => {
    if (isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.()
    } else if (!isFullscreen && document.fullscreenElement) {
      document.exitFullscreen?.()
    }
  }, [isFullscreen])
  
  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeGallery()
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm",
        "animate-in fade-in duration-300"
      )}
      onClick={handleBackdropClick}
    >
      {/* Loading indicator */}
      {isLoading && <LightGalleryLoader />}
      
      {/* Controls (top bar and navigation arrows) */}
      <LightGalleryControls 
        onSetPrimaryPhoto={onSetPrimaryPhoto}
        onDeletePhoto={onDeletePhoto}
        onSaveRotation={onSaveRotation}
      />
      
      {/* Main image display */}
      <LightGalleryImage />
      
      {/* Info panel */}
      <LightGalleryInfo />
      
      {/* Thumbnail strip */}
      <LightGalleryThumbnails />
    </div>
  )
}