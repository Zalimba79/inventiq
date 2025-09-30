"use client"

import { Play, Square, SkipBack, SkipForward, Camera, Trash2, Save, FolderOpen } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getSecureImageUrl } from '@/lib/utils/image-proxy'

interface CapturedImage {
  id: string
  dataUrl?: string  // Local preview
  url?: string      // MinIO URL
  timestamp: Date
  resolution: { width: number; height: number }
  uploadStatus?: 'pending' | 'uploading' | 'uploaded' | 'error'
}

interface BottomBarProps {
  images: CapturedImage[]
  selectedImageId?: string
  onImageSelect?: (id: string) => void
  onImageDelete?: (id: string) => void
  onCapture: () => void
  onClear: () => void
  onSave: () => void
  isCapturing: boolean
  className?: string
}

/**
 * Bottom bar with thumbnail gallery and capture controls
 * Inspired by Orbitvu Station interface
 */
export function BottomBar({ 
  images,
  selectedImageId,
  onImageSelect,
  onImageDelete,
  onCapture,
  onClear,
  onSave,
  isCapturing,
  className 
}: BottomBarProps): JSX.Element {
  return (
    <div className={cn("bg-card border-t border-border p-2", className)}>
      <div className="flex items-center gap-2">
        {/* Templates/Controls Section */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-600">
          <Button 
            size="sm" 
            className="h-8 px-2 text-xs bg-secondary hover:bg-secondary/80"
          >
            <FolderOpen className="h-3.5 w-3.5 mr-1" />
            TEMPLATES
          </Button>
        </div>
        
        {/* Playback Controls (for 360/video modes) */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-600">
          <Button 
            size="sm" 
            className="h-7 w-7 p-0 bg-secondary hover:bg-secondary/80"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="sm" 
            className="h-7 w-7 p-0 bg-secondary hover:bg-secondary/80"
          >
            <Play className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="sm" 
            className="h-7 w-7 p-0 bg-secondary hover:bg-secondary/80"
          >
            <Square className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="sm" 
            className="h-7 w-7 p-0 bg-secondary hover:bg-secondary/80"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        {/* Frame Counter */}
        <div className="flex items-center gap-2 px-2 border-x border-border text-xs text-muted-foreground">
          <span>FRAME</span>
          <span className="font-mono text-primary">{images.length.toString().padStart(3, '0')}</span>
          <span>/</span>
          <span className="font-mono">360</span>
        </div>
        
        {/* Thumbnail Gallery */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-1">
            {images.map((image, index) => (
              <div
                key={image.id}
                onClick={() => onImageSelect?.(image.id)}
                className={cn(
                  "relative flex-shrink-0 w-20 h-16 rounded overflow-hidden cursor-pointer border-2 transition-all",
                  selectedImageId === image.id 
                    ? "border-primary shadow-lg shadow-primary/20" 
                    : "border-border hover:border-muted-foreground"
                )}
              >
                {(() => {
                  // Use secure URL for HTTPS or fallback to dataUrl
                  const imageUrl = getSecureImageUrl(image.url) || image.dataUrl
                  
                  return imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`Capture ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                      onError={(e) => {
                        console.error(`Failed to load image: ${imageUrl}`)
                        // Try to fallback to dataUrl if URL fails
                        if (image.url && image.dataUrl && e.currentTarget.src !== image.dataUrl) {
                          e.currentTarget.src = image.dataUrl
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">No image</span>
                    </div>
                  )
                })()}
                {/* Upload status indicator */}
                {image.uploadStatus === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                  </div>
                )}
                {image.uploadStatus === 'error' && (
                  <div className="absolute top-1 left-1 bg-red-500 rounded-full p-1">
                    <span className="text-white text-xs">!</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs text-center text-white py-0.5">
                  #{index + 1} • {image.resolution.width}×{image.resolution.height}
                </div>
                {onImageDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onImageDelete(image.id)
                    }}
                    className="absolute top-1 right-1 p-0.5 bg-red-500/80 hover:bg-red-500 rounded opacity-0 hover:opacity-100 transition-opacity group"
                    title="Delete image (also removes from cloud storage)"
                  >
                    <Trash2 className="h-3 w-3 text-white" />
                  </button>
                )}
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 8 - images.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex-shrink-0 w-20 h-16 rounded border-2 border-dashed border-border bg-background/50"
              />
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 pl-2 border-l border-slate-600">
          <Button
            onClick={onCapture}
            disabled={isCapturing}
            size="sm"
            className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Camera className="h-4 w-4 mr-1" />
            CAPTURE
          </Button>
          
          {images.length > 0 && (
            <>
              <Button
                onClick={onClear}
                size="sm"
                variant="outline"
                className="h-8 px-2 bg-secondary border-border hover:bg-secondary/80"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={onSave}
                size="sm"
                className="h-8 px-3 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-1" />
                SAVE
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}