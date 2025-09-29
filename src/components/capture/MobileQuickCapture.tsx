"use client"

import { Camera, X, Check, Plus, Package } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState, useRef, type ChangeEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useProductStore } from '@/store/product-store'

interface CapturedImage {
  id: string
  dataUrl: string
  timestamp: Date
}

interface MobileQuickCaptureProps {
  className?: string
}

/**
 * Mobile Quick Capture Component
 * Uses native device camera through file input
 * Optimized for mobile devices
 */
export function MobileQuickCapture({ className }: MobileQuickCaptureProps): JSX.Element {
  const router = useRouter()
  const { createProduct } = useProductStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([])
  const [quantity, setQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Handle native camera capture
  const handleCameraCapture = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setIsProcessing(true)
    
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const newImage: CapturedImage = {
            id: crypto.randomUUID(),
            dataUrl: event.target.result as string,
            timestamp: new Date()
          }
          setCapturedImages(prev => [...prev, newImage])
        }
      }
      
      reader.readAsDataURL(file)
    })
    
    // Reset input to allow capturing same image again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    setIsProcessing(false)
  }
  
  // Trigger native camera
  const triggerCamera = () => {
    fileInputRef.current?.click()
  }
  
  // Delete image
  const deleteImage = (id: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id))
  }
  
  // Save as product
  const handleSave = async () => {
    if (capturedImages.length === 0) return
    
    const photos = capturedImages.map((img, index) => ({
      id: crypto.randomUUID(),
      dataUrl: img.dataUrl,
      mimeType: 'image/jpeg',
      size: img.dataUrl.length * 0.75,
      isPrimary: index === 0,
      timestamp: img.timestamp
    }))
    
    await createProduct(photos, quantity)
    router.push('/products/draft')
  }
  
  const handleClear = () => {
    setCapturedImages([])
    setQuantity(1)
  }
  
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Hidden native camera input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleCameraCapture}
        className="hidden"
      />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Quick Capture</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {capturedImages.length} photo{capturedImages.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Quantity Input */}
        <Card className="p-4">
          <Label htmlFor="quantity">Product Quantity</Label>
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </Button>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </Button>
            <span className="text-sm text-muted-foreground ml-2">
              items
            </span>
          </div>
        </Card>
        
        {/* Capture Button */}
        <Button
          onClick={triggerCamera}
          size="lg"
          className="w-full h-24 text-lg"
          disabled={isProcessing}
        >
          <Camera className="mr-2 h-8 w-8" />
          {isProcessing ? 'Processing...' : 'Take Photos'}
        </Button>
        
        {/* Image Grid */}
        {capturedImages.length > 0 && (
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {capturedImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden border"
                >
                  <Image
                    src={image.dataUrl}
                    alt={`Capture ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw"
                   unoptimized/>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {index === 0 && (
                      <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                        Primary
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={() => deleteImage(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Add more button */}
              <button
                onClick={triggerCamera}
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center hover:bg-muted/50 transition-colors"
              >
                <Plus className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Add More</span>
              </button>
            </div>
          </Card>
        )}
        
        {/* Tips */}
        <Card className="p-4 bg-muted/50">
          <h3 className="font-medium text-sm mb-2">📱 Mobile Tips</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use good lighting for better results</li>
            <li>• Hold your device steady</li>
            <li>• Capture multiple angles</li>
            <li>• You can select multiple photos at once</li>
          </ul>
        </Card>
      </div>
      
      {/* Bottom Actions */}
      {capturedImages.length > 0 && (
        <div className="sticky bottom-0 bg-background border-t p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
            >
              <Package className="mr-2 h-4 w-4" />
              Create Product
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}