"use client"

import React, { useState } from 'react'
import { useProductStore, ProductPhoto } from '@/store/product-store'
import { CameraView } from './CameraView'
import { PhotoPreview } from './PhotoPreview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Plus, Package, ArrowRight, Trash2, Minus, Hash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface DirectPhotoCaptureProps {
  className?: string
}

export function DirectPhotoCapture({ className }: DirectPhotoCaptureProps) {
  const router = useRouter()
  const { createProduct } = useProductStore()
  const { toast } = useToast()
  const [currentPhotos, setCurrentPhotos] = useState<ProductPhoto[]>([])
  const [quantity, setQuantity] = useState(1)
  const [showCamera, setShowCamera] = useState(true)

  const handleCapture = (imageSrc: string) => {
    const base64Data = imageSrc.split(',')[1]
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    const size = byteArray.length

    const newPhoto: ProductPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dataUrl: imageSrc,
      timestamp: new Date(),
      size: size,
      mimeType: 'image/jpeg',
      isPrimary: currentPhotos.length === 0 // First photo is primary
    }

    setCurrentPhotos([...currentPhotos, newPhoto])

    toast({
      title: "Photo added!",
      description: `${currentPhotos.length + 1} ${currentPhotos.length + 1 === 1 ? 'photo' : 'photos'} for this product`,
    })

    // Briefly show the preview
    setShowCamera(false)
    setTimeout(() => setShowCamera(true), 500)
  }

  const handleCreateProduct = () => {
    if (currentPhotos.length === 0) {
      toast({
        title: "No photos",
        description: "Capture at least one photo before creating a product",
        variant: "destructive"
      })
      return
    }

    // Create the product with current photos and quantity
    const productId = createProduct(currentPhotos, quantity)
    
    toast({
      title: "Product created!",
      description: `Product with ${currentPhotos.length} photos and quantity ${quantity} has been created`,
    })

    // Clear photos and reset quantity for next product
    setCurrentPhotos([])
    setQuantity(1)
  }

  const handleFinish = () => {
    // Create product if there are pending photos
    if (currentPhotos.length > 0) {
      handleCreateProduct()
    }
    
    // Navigate to draft products
    router.push('/products/draft')
  }

  const handleRemovePhoto = (photoId: string) => {
    setCurrentPhotos(currentPhotos.filter(p => p.id !== photoId))
    toast({
      title: "Photo removed",
      description: `${currentPhotos.length - 1} photos remaining`,
    })
  }

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            {currentPhotos.length} {currentPhotos.length === 1 ? 'photo' : 'photos'} ready
          </span>
          {currentPhotos.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Hash className="w-3 h-3" />
                Qty:
              </label>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-7 w-12 text-center px-1"
                  min="1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentPhotos.length > 0 && (
            <Button
              onClick={handleCreateProduct}
              size="sm"
              variant="default"
            >
              <Package className="w-4 h-4 mr-1" />
              Create Product (×{quantity})
            </Button>
          )}
          <Button
            onClick={handleFinish}
            size="sm"
            variant="outline"
          >
            <ArrowRight className="w-4 h-4 mr-1" />
            Finish
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {showCamera ? (
          <CameraView
            onCapture={handleCapture}
            className="h-full"
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-background">
            <div className="text-center">
              <Package className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">Photo saved!</p>
            </div>
          </div>
        )}
      </div>

      {/* Photo preview strip with delete option */}
      {currentPhotos.length > 0 && (
        <div className="border-t bg-background flex-shrink-0 p-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-1 overflow-x-auto">
              {currentPhotos.map((photo, index) => (
                <div key={photo.id} className="relative group flex-shrink-0">
                  <img
                    src={photo.dataUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {photo.isPrimary && (
                    <span className="absolute bottom-0 left-0 bg-primary text-primary-foreground text-xs px-1 rounded-tr">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentPhotos.length}/10
            </div>
          </div>
        </div>
      )}
    </div>
  )
}