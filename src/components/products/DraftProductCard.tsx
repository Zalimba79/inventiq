"use client"

import { Package, Sparkles, Trash2, ZoomIn } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { usePhotoLoader } from '@/hooks/usePhotoLoader'
import { type Product } from '@/store/product-store'

interface DraftProductCardProps {
  product: Product
  isSelected: boolean
  viewMode: 'grid' | 'list'
  onCheckboxChange: (productId: string, checked: boolean) => void
  onDelete: (productId: string) => void
  onAnalyze: (productId: string) => void
  onImageClick: (src: string, alt: string) => void
}

export function DraftProductCard({
  product,
  isSelected,
  viewMode,
  onCheckboxChange,
  onDelete,
  onAnalyze,
  onImageClick
}: DraftProductCardProps): JSX.Element {
  const router = useRouter()
  const primaryPhoto = product.photos.find((p) => p.isPrimary) ?? product.photos[0]
  const { photo: loadedPhoto, isLoading } = usePhotoLoader(primaryPhoto ?? null)
  const [imageError, setImageError] = useState(false)

  // Reset error state when photo changes
  useEffect(() => {
    setImageError(false)
  }, [primaryPhoto?.id])

  const handleCardClick = (): void => {
    router.push(`/products/${product.id}`)
  }

  const imageDataUrl = loadedPhoto?.dataUrl ?? primaryPhoto?.dataUrl

  if (viewMode === 'grid') {
    return (
      <CardContent className="p-3">
        {/* Selection Checkbox */}
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onCheckboxChange(product.id, checked as boolean)}
            onClick={(e) => e.stopPropagation()}
            className="bg-background/90"
          />
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="gap-1">
            <Package className="w-3 h-3" />
            Draft
          </Badge>
        </div>

        {/* Product Image */}
        <div className="aspect-square bg-muted rounded-md mb-2 overflow-hidden relative group">
          <div 
            className="w-full h-full cursor-pointer relative"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              if (imageDataUrl && !imageError) {
                onImageClick(imageDataUrl, product.name ?? 'Product')
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                if (imageDataUrl && !imageError) {
                  onImageClick(imageDataUrl, product.name ?? 'Product')
                }
              }
            }}
          >
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="text-muted-foreground text-xs">Loading...</div>
              </div>
            ) : imageDataUrl && !imageError ? (
              <>
                <Image
                  src={imageDataUrl}
                  alt="Product"
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  onError={() => setImageError(true)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div 
          className="space-y-1 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleCardClick()
            }
          }}
        >
          <h3 className="font-medium text-sm hover:text-primary transition-colors">
            {product.name ?? `Product ${product.id.slice(-6)}`}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{product.photos.length} photos</span>
            <span>Qty: {product.quantity ?? 1}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(product.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-2 flex gap-1">
          <Button
            size="sm"
            variant="destructive"
            className="w-8 px-0"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(product.id)
            }}
            title="Delete product"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              onAnalyze(product.id)
            }}
          >
            <Sparkles className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    )
  }

  // List View
  return (
    <CardContent className="p-3 flex gap-3 flex-1">
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onCheckboxChange(product.id, checked as boolean)}
          onClick={(e) => e.stopPropagation()}
          className="bg-background/90"
        />
      </div>

      {/* Thumbnail */}
      <div 
        className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0 cursor-pointer group relative ml-8"
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation()
          if (imageDataUrl && !imageError) {
            onImageClick(imageDataUrl, product.name ?? 'Product')
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
            if (imageDataUrl && !imageError) {
              onImageClick(imageDataUrl, product.name ?? 'Product')
            }
          }
        }}
      >
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-muted-foreground text-xs">...</div>
          </div>
        ) : imageDataUrl && !imageError ? (
          <>
            <Image
              src={imageDataUrl}
              alt="Product"
              width={80}
              height={80}
              className="object-cover transition-transform duration-200 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Package className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleCardClick()
          }
        }}
      >
        <h3 className="font-medium hover:text-primary transition-colors">
          {product.name ?? `Product ${product.id.slice(-6)}`}
        </h3>
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <span>{product.photos.length} photos</span>
          <span>Qty: {product.quantity ?? 1}</span>
          <span>Created {new Date(product.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(product.id)
          }}
          className="text-destructive hover:text-destructive"
          title="Delete product"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onAnalyze(product.id)
          }}
          title="Analyze with AI"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
      </div>
    </CardContent>
  )
}