"use client"

import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { type ProductPhoto } from '@/store/product-store'

interface PhotoPreviewStripProps {
  photos: ProductPhoto[]
  onRemovePhoto: (photoId: string) => void
  autoAdvance?: boolean
  photosPerProduct?: number
}

export function PhotoPreviewStrip({ 
  photos, 
  onRemovePhoto,
  autoAdvance = false,
  photosPerProduct = 3
}: PhotoPreviewStripProps): JSX.Element | null {
  if (photos.length === 0) return null

  return (
    <div className="border-t bg-background flex-shrink-0">
      <div className="flex items-center">
        <div className="flex-1 overflow-x-auto overflow-y-visible" style={{ scrollbarWidth: 'thin' }}>
          <div className="flex gap-4 py-4 px-4">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="relative group flex-shrink-0"
                style={{ transform: 'translateZ(0)' }}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors relative">
                  <Image
                    src={photo.dataUrl ?? ''}
                    alt={`Product view ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 80px, 96px"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                </div>
                
                <button
                  onClick={() => onRemovePhoto(photo.id)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 min-w-[28px] min-h-[28px] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 z-20"
                  style={{ 
                    transform: 'translate(0, 0)',
                    willChange: 'transform, opacity'
                  }}
                  aria-label={`Remove photo ${index + 1}`}
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                {photo.isPrimary && (
                  <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded shadow-sm" aria-label="Primary photo">
                    Main
                  </span>
                )}
                
                <span className="absolute top-1 left-1 bg-black/70 text-white text-xs font-medium px-1.5 py-0.5 rounded shadow-sm">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {autoAdvance && (
          <div className="text-sm font-medium text-muted-foreground whitespace-nowrap px-4">
            {photos.length}/{photosPerProduct}
          </div>
        )}
      </div>
    </div>
  )
}