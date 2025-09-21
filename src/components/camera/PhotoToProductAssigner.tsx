"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useProductStore, ProductPhoto } from '@/store/product-store'
import { useCaptureStore } from '@/store/capture-store'
import { Plus, Package, ChevronRight, Check, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoToProductAssignerProps {
  onComplete: () => void
  className?: string
}

export function PhotoToProductAssigner({ onComplete, className }: PhotoToProductAssignerProps) {
  const { currentSession, clearSession } = useCaptureStore()
  const { createProduct } = useProductStore()
  const [assignments, setAssignments] = useState<Map<number, number>>(new Map())
  const [productCount, setProductCount] = useState(1)
  const [isReady, setIsReady] = useState(false)

  React.useEffect(() => {
    // Give the store a moment to hydrate
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  if (!isReady) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading photos...</p>
        </div>
      </div>
    )
  }

  if (!currentSession || currentSession.photos.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No photos to organize</h3>
          <p className="text-muted-foreground mb-4">
            Please capture some photos first
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const photos = currentSession.photos

  // Handle photo assignment to product
  const assignPhotoToProduct = (photoIndex: number, productIndex: number) => {
    const newAssignments = new Map(assignments)
    newAssignments.set(photoIndex, productIndex)
    setAssignments(newAssignments)
  }

  // Create a new product option
  const addNewProduct = () => {
    setProductCount(productCount + 1)
  }

  // Complete assignment and create products
  const handleComplete = () => {
    // Group photos by product assignment
    const productGroups = new Map<number, ProductPhoto[]>()
    
    photos.forEach((photo, index) => {
      const productIndex = assignments.get(index) || 0 // Default to first product
      
      if (!productGroups.has(productIndex)) {
        productGroups.set(productIndex, [])
      }
      
      const productPhoto: ProductPhoto = {
        id: `photo_${Date.now()}_${index}`,
        dataUrl: photo.dataUrl,
        mimeType: photo.mimeType,
        size: photo.size,
        isPrimary: productGroups.get(productIndex)!.length === 0, // First photo is primary
        timestamp: photo.timestamp
      }
      
      productGroups.get(productIndex)!.push(productPhoto)
    })

    // Create products with assigned photos
    productGroups.forEach((photos) => {
      createProduct(photos)
    })

    // Clear the capture session
    clearSession()
    
    // Navigate to product gallery
    onComplete()
  }

  // Auto-assign all to one product
  const assignAllToOneProduct = () => {
    const newAssignments = new Map<number, number>()
    photos.forEach((_, index) => {
      newAssignments.set(index, 0)
    })
    setAssignments(newAssignments)
  }

  // Auto-assign each to separate product
  const assignEachToSeparate = () => {
    const newAssignments = new Map<number, number>()
    photos.forEach((_, index) => {
      newAssignments.set(index, index)
    })
    setProductCount(photos.length)
    setAssignments(newAssignments)
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h2 className="text-lg font-semibold">Assign Photos to Products</h2>
        <p className="text-sm text-muted-foreground">
          Group your photos into products for inventory
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 p-4 border-b bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          onClick={assignAllToOneProduct}
        >
          All to One Product
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={assignEachToSeparate}
        >
          Each as Separate
        </Button>
      </div>

      {/* Photo Grid with Assignment */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, photoIndex) => (
            <Card key={photoIndex} className="p-2">
              <div className="aspect-square relative mb-2 bg-muted rounded overflow-hidden">
                <img
                  src={photo.dataUrl}
                  alt={`Photo ${photoIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 rounded text-xs">
                  <ImageIcon className="w-3 h-3 inline mr-1" />
                  {photoIndex + 1}
                </div>
              </div>
              
              {/* Product Assignment Selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Assign to:</label>
                <div className="flex flex-wrap gap-1">
                  {[...Array(productCount)].map((_, productIndex) => (
                    <Button
                      key={productIndex}
                      size="sm"
                      variant={assignments.get(photoIndex) === productIndex ? "default" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={() => assignPhotoToProduct(photoIndex, productIndex)}
                    >
                      <Package className="w-3 h-3 mr-1" />
                      {productIndex + 1}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={addNewProduct}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Product Summary */}
        <div className="mt-6 space-y-2">
          <h3 className="font-medium text-sm">Product Summary</h3>
          {[...Array(productCount)].map((_, productIndex) => {
            const assignedPhotos = Array.from(assignments.entries())
              .filter(([_, prodIdx]) => prodIdx === productIndex)
              .map(([photoIdx]) => photoIdx)
            
            return (
              <div
                key={productIndex}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
              >
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Product {productIndex + 1}</span>
                <span className="text-xs text-muted-foreground">
                  ({assignedPhotos.length} photo{assignedPhotos.length !== 1 ? 's' : ''})
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t p-4 flex justify-between">
        <Button variant="outline" onClick={() => setAssignments(new Map())}>
          Reset Assignments
        </Button>
        <Button onClick={handleComplete} disabled={assignments.size === 0}>
          <Check className="w-4 h-4 mr-2" />
          Create Products
        </Button>
      </div>
    </div>
  )
}