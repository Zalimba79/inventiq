"use client"

import React, { useCallback, useEffect, useRef } from 'react'

interface IOSTouchGesturesProps {
  zoom: number
  onZoomChange: (zoom: number) => void
  onTapToFocus?: (x: number, y: number) => void
  className?: string
  children: React.ReactNode
}

/**
 * iOS touch gesture handler for pinch-to-zoom and tap-to-focus
 */
export function IOSTouchGestures({
  zoom,
  onZoomChange,
  onTapToFocus,
  className,
  children
}: IOSTouchGesturesProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialDistanceRef = useRef<number>(0)
  const currentZoomRef = useRef<number>(zoom)
  
  // Update zoom ref when prop changes
  useEffect(() => {
    currentZoomRef.current = zoom
  }, [zoom])

  // Handle tap to focus
  const handleTapToFocus = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!onTapToFocus || !containerRef.current) return
    
    // Only handle single touch for focus
    if (e.touches.length !== 1) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100
    const y = ((e.touches[0].clientY - rect.top) / rect.height) * 100
    
    onTapToFocus(x, y)
  }, [onTapToFocus])

  // Pinch to zoom gesture handling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent): void => {
      if (e.touches.length === 2) {
        initialDistanceRef.current = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        currentZoomRef.current = zoom
      }
    }

    const handleTouchMove = (e: TouchEvent): void => {
      if (e.touches.length === 2 && initialDistanceRef.current > 0) {
        e.preventDefault() // Prevent default browser zoom
        
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        const scale = distance / initialDistanceRef.current
        const newZoom = Math.max(1, Math.min(3, currentZoomRef.current * scale))
        onZoomChange(newZoom)
      }
    }

    const handleTouchEnd = (): void => {
      initialDistanceRef.current = 0
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [zoom, onZoomChange])

  return (
    <div 
      ref={containerRef}
      className={className}
      onTouchStart={handleTapToFocus}
    >
      {children}
    </div>
  )
}