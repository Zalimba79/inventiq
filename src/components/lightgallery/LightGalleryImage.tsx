"use client"

import React, { useState, useRef, useEffect, WheelEvent, TouchEvent } from 'react'
import { useLightGallery } from './LightGalleryContext'
import { cn } from '@/lib/utils'

export function LightGalleryImage() {
  const { 
    product, 
    currentIndex, 
    zoom, 
    setZoom, 
    rotation,
    nextPhoto,
    previousPhoto,
    setLoading 
  } = useLightGallery()
  
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [touchDistance, setTouchDistance] = useState(0)
  
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const currentPhoto = product?.photos?.[currentIndex]
  const imageUrl = currentPhoto?.url || currentPhoto?.dataUrl
  const currentRotation = currentPhoto ? (rotation[currentPhoto.id] || 0) : 0
  
  // Reset position when image changes
  useEffect(() => {
    setImagePosition({ x: 0, y: 0 })
  }, [currentIndex])
  
  // Mouse wheel zoom
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.min(Math.max(zoom + delta, 0.5), 4)
    setZoom(newZoom)
    
    if (newZoom === 1) {
      setImagePosition({ x: 0, y: 0 })
    }
  }
  
  // Touch gestures for pinch zoom
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setTouchDistance(distance)
    } else if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - imagePosition.x,
        y: e.touches[0].clientY - imagePosition.y
      })
    }
  }
  
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchDistance > 0) {
      const newDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const scale = newDistance / touchDistance
      const newZoom = Math.min(Math.max(zoom * scale, 0.5), 4)
      setZoom(newZoom)
      setTouchDistance(newDistance)
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      setImagePosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    }
  }
  
  const handleTouchEnd = () => {
    setTouchDistance(0)
    setIsDragging(false)
  }
  
  // Mouse drag for panning when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      })
    }
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  // Swipe navigation
  const swipeStartX = useRef(0)
  const handleSwipeStart = (e: TouchEvent) => {
    if (zoom === 1) {
      swipeStartX.current = e.touches[0].clientX
    }
  }
  
  const handleSwipeEnd = (e: TouchEvent) => {
    if (zoom === 1) {
      const swipeEndX = e.changedTouches[0].clientX
      const diff = swipeEndX - swipeStartX.current
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          previousPhoto()
        } else {
          nextPhoto()
        }
      }
    }
  }
  
  if (!imageUrl || !currentPhoto) return null
  
  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={(e) => {
        handleTouchStart(e)
        handleSwipeStart(e)
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={(e) => {
        handleTouchEnd()
        handleSwipeEnd(e)
      }}
    >
      <img
        ref={imageRef}
        src={imageUrl}
        alt={product?.name || 'Product photo'}
        className={cn(
          "max-w-none transition-transform duration-300",
          isDragging && "transition-none",
          zoom > 1 ? "cursor-move" : "cursor-default"
        )}
        style={{
          transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoom}) rotate(${currentRotation}deg)`,
          maxHeight: '90vh',
          maxWidth: '90vw',
          objectFit: 'contain'
        }}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
        draggable={false}
      />
    </div>
  )
}