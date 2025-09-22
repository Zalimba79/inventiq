"use client"

import { Package, ArrowRight, Settings } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'

import { usePhotoCapture } from './PhotoCaptureContainer'
import { QuantitySelector } from './QuantitySelector'

interface PhotoCaptureHeaderProps {
  onSettingsClick: () => void
  autoAdvance?: boolean
  photosPerProduct?: number
}

export function PhotoCaptureHeader({ 
  onSettingsClick,
  autoAdvance = false,
  photosPerProduct = 3
}: PhotoCaptureHeaderProps): JSX.Element {
  const { photos, quantity, onQuantityChange, onCreateProduct, onFinish } = usePhotoCapture()
  
  const getStatusText = (): string => {
    if (autoAdvance) {
      return `${photos.length}/${photosPerProduct} photos`
    }
    return `${photos.length} ${photos.length === 1 ? 'photo' : 'photos'} ready`
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-background flex-shrink-0">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">
          {getStatusText()}
        </span>
        {photos.length > 0 && (
          <QuantitySelector 
            quantity={quantity} 
            onChange={onQuantityChange}
          />
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          onClick={onSettingsClick}
          size="sm"
          variant="ghost"
          className="gap-1"
        >
          <Settings className="w-4 h-4" />
        </Button>
        
        {photos.length > 0 && (
          <Button
            onClick={() => { void onCreateProduct() }}
            size="sm"
            variant="default"
          >
            <Package className="w-4 h-4 mr-1" />
            Create Product (×{quantity})
          </Button>
        )}
        
        <Button
          onClick={() => { void onFinish() }}
          size="sm"
          variant="outline"
        >
          <ArrowRight className="w-4 h-4 mr-1" />
          Finish
        </Button>
      </div>
    </div>
  )
}