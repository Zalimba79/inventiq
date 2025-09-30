"use client"

import { X, Image as ImageIcon } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface CapturedImage {
  id: string
  dataUrl: string
  timestamp: Date
  resolution: { width: number; height: number }
}

interface CapturedImagesProps {
  images: CapturedImage[]
  onDelete: (id: string) => void
  className?: string
}

/**
 * Display component for captured images
 * Shows thumbnails with delete option
 * Max lines: ~100
 */
export function CapturedImages({ 
  images,
  onDelete,
  className 
}: CapturedImagesProps): JSX.Element {
  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Captured Images
          </h3>
          <span className="text-sm text-muted-foreground">
            {images.length} photo{images.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              No images captured yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click "Capture Photo" to start
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.dataUrl}
                  alt={`Captured ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                
                {/* Delete button overlay */}
                <Button
                  onClick={() => onDelete(image.id)}
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
                
                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1 text-xs rounded-b-lg">
                  {image.resolution.width}×{image.resolution.height}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}