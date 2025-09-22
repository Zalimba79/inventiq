"use client"

import { CameraOff } from 'lucide-react'
import React, { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

interface CameraPreviewProps {
  stream: MediaStream | null
  className?: string
  mirrored?: boolean
  showGrid?: boolean
  overlay?: React.ReactNode
}

export function CameraPreview({ 
  stream, 
  className, 
  mirrored = false,
  showGrid = false,
  overlay
}: CameraPreviewProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  if (!stream) {
    return (
      <div className={cn(
        "relative bg-muted rounded-lg flex items-center justify-center",
        className
      )}>
        <div className="text-center">
          <CameraOff className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Camera not available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative bg-black rounded-lg overflow-hidden", className)}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "w-full h-full object-cover",
          mirrored && "scale-x-[-1]"
        )}
      />
      
      {/* Grid overlay */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
          {Array.from({ length: 9 }).map((_, i) => (
            // Grid cells are static, using index is acceptable
            // eslint-disable-next-line react/no-array-index-key
            <div key={`grid-${i}`} className="border border-white/20" />
          ))}
        </div>
      )}
      
      {/* Custom overlay content */}
      {overlay && (
        <div className="absolute inset-0 pointer-events-none">
          {overlay}
        </div>
      )}
    </div>
  )
}

// Note: ConnectedCameraPreview wurde entfernt
// Verwende stattdessen CameraPreview direkt mit useCameraContext in der Parent-Komponente
// Dies vermeidet zirkuläre Abhängigkeiten und require() Verwendung