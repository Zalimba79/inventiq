"use client"

import { Package } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState, useCallback, memo, useRef, useEffect } from 'react'

import { useToast } from '@/hooks/use-toast'
import { useCameraConfiguration } from '@/hooks/useCameraConfiguration'
import { createProductPhoto } from '@/hooks/usePhotoLoader'
import { getResolutionDetails } from '@/lib/camera/camera-config'
import { createDebounced } from '@/lib/image-utils'
import { cn } from '@/lib/utils'
import { useProductStore, type ProductPhoto } from '@/store/product-store'

// New focused components
import { CameraQuickActions } from './CameraQuickActions'
import { CameraViewRefactored } from './CameraViewRefactored'
import { PhotoCaptureContainer } from './PhotoCaptureContainer'
import { PhotoCaptureHeader } from './PhotoCaptureHeader'
import { PhotoGuideOverlay } from './PhotoGuideOverlay'
import { PhotoPreviewStrip } from './PhotoPreviewStrip'
import { UnifiedCameraSettings } from './UnifiedCameraSettings'

interface DirectPhotoCaptureRefactoredProps {
  className?: string
}

export const DirectPhotoCaptureRefactored = memo(({ 
  className 
}: DirectPhotoCaptureRefactoredProps) => {
  const router = useRouter()
  const { createProduct } = useProductStore()
  const { toast } = useToast()
  
  // State management
  const [currentPhotos, setCurrentPhotos] = useState<ProductPhoto[]>([])
  const [quantity, setQuantity] = useState(1)
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false)
  const [lastCapturedPhoto, setLastCapturedPhoto] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const { config: cameraConfig, updateConfig, resetConfig } = useCameraConfiguration()
  const [showPhotoGuide, setShowPhotoGuide] = useState(cameraConfig.showGuide)

  const debouncedToast = createDebounced(toast as (...args: unknown[]) => unknown, 100)
  const handleCreateProductRef = useRef<() => Promise<void>>()
  
  // Photo capture handler
  const handleCapture = useCallback((imageSrc: string) => {
    const newPhoto = createProductPhoto({
      dataUrl: imageSrc,
      mimeType: imageSrc.includes('webp') ? 'image/webp' : 'image/jpeg',
      isPrimary: currentPhotos.length === 0,
      timestamp: new Date()
    })

    setCurrentPhotos(prev => [...prev, newPhoto])
    setLastCapturedPhoto(imageSrc)

    debouncedToast({
      title: "Photo added!",
      description: cameraConfig.autoAdvance 
        ? `${currentPhotos.length + 1} of ${cameraConfig.photosPerProduct} photos for this product`
        : `${currentPhotos.length + 1} ${currentPhotos.length + 1 === 1 ? 'photo' : 'photos'} for this product`,
    })

    // Auto-advance logic
    if (cameraConfig.autoAdvance && currentPhotos.length + 1 >= cameraConfig.photosPerProduct) {
      setTimeout(() => {
        if (handleCreateProductRef.current) {
          void handleCreateProductRef.current()
        }
      }, 800)
    }

    // Visual feedback
    setShowPreviewOverlay(true)
    setTimeout(() => {
      setShowPreviewOverlay(false)
      setLastCapturedPhoto(null)
    }, 600)
  }, [currentPhotos.length, debouncedToast, cameraConfig])

  // Product creation
  const handleCreateProduct = useCallback(async () => {
    if (currentPhotos.length === 0) {
      toast({
        title: "No photos",
        description: "Capture at least one photo before creating a product",
        variant: "destructive"
      })
      return
    }

    try {
      await createProduct(currentPhotos, quantity)
      
      toast({
        title: "Product created!",
        description: `Product with ${currentPhotos.length} photos and quantity ${quantity} has been created`,
      })

      setCurrentPhotos([])
      setQuantity(1)
    } catch (error) {
      console.error('Failed to create product:', error)
      toast({
        title: "Failed to create product",
        description: "There was an error saving your product. Please try again.",
        variant: "destructive"
      })
    }
  }, [currentPhotos, quantity, createProduct, toast])
  
  // Update ref when function changes
  useEffect(() => {
    handleCreateProductRef.current = handleCreateProduct
  }, [handleCreateProduct])

  // Navigation handler
  const handleFinish = useCallback(() => {
    if (currentPhotos.length > 0) {
      void handleCreateProduct()
    }
    router.push('/products/draft')
  }, [router, currentPhotos.length, handleCreateProduct])

  // Photo management
  const handleRemovePhoto = useCallback((photoId: string) => {
    setCurrentPhotos(prev => prev.filter(p => p.id !== photoId))
    debouncedToast({
      title: "Photo removed",
      description: `${currentPhotos.length - 1} photos remaining`,
    })
  }, [currentPhotos.length, debouncedToast])

  const handleRetakeLast = useCallback(() => {
    if (currentPhotos.length > 0) {
      setCurrentPhotos(prev => prev.slice(0, -1))
      debouncedToast({
        title: "Ready to retake",
        description: "Last photo removed, capture a new one",
      })
    }
  }, [currentPhotos.length, debouncedToast])

  // Wrapped capture handler for container context
  const handleCaptureForContext = useCallback((photo: ProductPhoto) => {
    setCurrentPhotos(prev => [...prev, photo])
  }, [])

  return (
    <PhotoCaptureContainer
      photos={currentPhotos}
      quantity={quantity}
      onCapture={handleCaptureForContext}
      onQuantityChange={setQuantity}
      onRemovePhoto={handleRemovePhoto}
      onCreateProduct={handleCreateProduct}
      onFinish={handleFinish}
    >
      <div className={cn("flex flex-col h-full overflow-hidden", className)}>
        <PhotoCaptureHeader
          onSettingsClick={() => setShowSettings(true)}
          autoAdvance={cameraConfig.autoAdvance}
          photosPerProduct={cameraConfig.photosPerProduct}
        />

        <div className="flex-1 min-h-0 relative overflow-hidden">
          <CameraViewRefactored
            onCapture={handleCapture}
            className="h-full"
            showGrid={cameraConfig.showGrid}
            facingMode={cameraConfig.facingMode}
            resolution={getResolutionDetails(cameraConfig.resolution)}
          />
          
          {showPreviewOverlay && (
              <div className="text-center">
                {lastCapturedPhoto ? (
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden border-2 border-green-500 shadow-2xl relative">
                      <Image 
                        src={lastCapturedPhoto} 
                        alt="Captured" 
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-8 h-8 text-green-500 bg-black/50 rounded-full p-1" />
                    </div>
                  </div>
                ) : (
                  <Package className="w-12 h-12 text-green-500 mx-auto mb-2 animate-pulse" />
                )}
                <p className="text-white font-medium">Photo saved!</p>
              </div>
          )}
          
          <PhotoGuideOverlay 
            visible={showPhotoGuide && currentPhotos.length === 0}
            onClose={() => setShowPhotoGuide(false)}
          />

          <CameraQuickActions
            visible={currentPhotos.length > 0}
            onRetakeLast={handleRetakeLast}
          />
        </div>

        <PhotoPreviewStrip
          photos={currentPhotos}
          onRemovePhoto={handleRemovePhoto}
          autoAdvance={cameraConfig.autoAdvance}
          photosPerProduct={cameraConfig.photosPerProduct}
        />

        <UnifiedCameraSettings
          open={showSettings}
          onOpenChange={setShowSettings}
          config={cameraConfig}
          onConfigChange={updateConfig}
          onReset={resetConfig}
        />
      </div>
    </PhotoCaptureContainer>
  )
})