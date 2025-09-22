"use client"

import { X, ZoomIn } from 'lucide-react'
import Image from 'next/image'
import React, { useState, useCallback, memo } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { type CapturedPhoto } from '@/types/capture'
// Removed unused capture-store import

interface PhotoPreviewProps {
  photos: CapturedPhoto[]
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onRemove?: (photoId: string) => void
}

export const PhotoPreview = memo(({
  photos,
  maxVisible = 5,
  size = 'md',
  className,
  onRemove
}: PhotoPreviewProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(null)
  // const { removePhoto } = useCaptureStore() - removed unused
  
  const visiblePhotos = photos.slice(-maxVisible)
  const hiddenCount = Math.max(0, photos.length - maxVisible)

  const handleRemove = useCallback((photoId: string) => {
    // removePhoto(photoId) - removed unused
    onRemove?.(photoId)
  }, [onRemove])

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  return (
    <>
      <div className={cn("flex gap-2", className)}>
        {hiddenCount > 0 && (
          <div className={cn(
            sizeClasses[size],
            "rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground"
          )}>
            +{hiddenCount}
          </div>
        )}
        
        {visiblePhotos.map((photo) => (
          <button
            key={photo.id}
            className={cn(
              sizeClasses[size],
              "relative group rounded-lg overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            )}
            onClick={() => setSelectedPhoto(photo)}
            type="button"
            aria-label={`View photo ${photo.id}`}
          >
            <Image
              src={photo.dataUrl}
              alt={photo.fileName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, 12.5vw"
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white" />
            </div>

            {/* Remove button */}
            {onRemove && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(photo.id)
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </button>
        ))}
      </div>

      {/* Full-size preview dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.fileName}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="relative">
              <div className="relative w-full h-auto max-h-[70vh]">
                <Image
                  src={selectedPhoto.dataUrl}
                  alt={selectedPhoto.fileName}
                  width={800}
                  height={600}
                  className="w-full h-auto rounded-lg"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Size: {(selectedPhoto.size / 1024).toFixed(2)} KB</p>
                <p>Captured: {new Date(selectedPhoto.timestamp).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
})