"use client"

import React, { useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useLightGallery } from './LightGalleryContext'
import { cn } from '@/lib/utils'

export function LightGalleryThumbnails() {
  const { product, currentIndex, goToPhoto, rotation, showThumbnails } = useLightGallery()
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to current thumbnail
  useEffect(() => {
    if (scrollRef.current && showThumbnails) {
      const container = scrollRef.current
      const thumbnail = container.children[currentIndex] as HTMLElement
      if (thumbnail) {
        const containerWidth = container.clientWidth
        const thumbLeft = thumbnail.offsetLeft
        const thumbWidth = thumbnail.clientWidth
        const scrollLeft = thumbLeft - (containerWidth / 2) + (thumbWidth / 2)
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        })
      }
    }
  }, [currentIndex, showThumbnails])
  
  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 200
    const currentScroll = scrollRef.current.scrollLeft
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount
    
    scrollRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    })
  }
  
  if (!product || !showThumbnails) return null
  
  return (
    <div className="absolute bottom-0 left-0 right-0 z-[10001] bg-gradient-to-t from-black/90 via-black/70 to-transparent">
      <div className="relative p-4">
        {/* Scroll buttons */}
        {product.photos.length > 8 && (
          <>
            <button
              onClick={() => scrollThumbnails('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 bg-black/50 text-white hover:bg-black/70 rounded-full transition-all backdrop-blur-sm"
              aria-label="Scroll thumbnails left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => scrollThumbnails('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 bg-black/50 text-white hover:bg-black/70 rounded-full transition-all backdrop-blur-sm"
              aria-label="Scroll thumbnails right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        
        {/* Thumbnails container */}
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-8"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}
        >
          {product.photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => goToPhoto(index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                currentIndex === index 
                  ? "border-white ring-2 ring-white/50 scale-110" 
                  : "border-white/30 hover:border-white/60 hover:scale-105 opacity-70 hover:opacity-100"
              )}
            >
              <img
                src={photo.thumbnailUrl || photo.url || photo.dataUrl || ''}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                style={{
                  transform: `rotate(${rotation[photo.id] || 0}deg)`
                }}
                loading="lazy"
              />
              {index === 0 && photo.isPrimary && (
                <Star className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-yellow-400 fill-current drop-shadow-lg" />
              )}
              {currentIndex === index && (
                <div className="absolute inset-0 bg-white/10" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}