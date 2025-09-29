"use client"

import { CheckCircle, Package, Clock, RefreshCw, Sparkles, ChevronRight, ZoomIn } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { type Product, type ProductPhoto, type ProductStatus } from '@/store/product-store'

interface ProductCardProps {
  product: Product
  isSelected: boolean
  viewMode: 'grid' | 'list'
  onCheckboxChange: (productId: string, checked: boolean) => void
  onProductClick?: (productId: string) => void
  onReanalyze?: (productId: string) => Promise<void>
  onImageClick?: (src: string, alt: string) => void
}

const statusConfig: Record<ProductStatus, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-500', icon: Package },
  QUEUED: { label: 'Queued', color: 'bg-yellow-500', icon: Clock },
  ANALYZING: { label: 'Analyzing', color: 'bg-blue-500', icon: RefreshCw },
  ANALYZED: { label: 'Analyzed', color: 'bg-purple-500', icon: Sparkles },
  VALIDATED: { label: 'Validated', color: 'bg-green-500', icon: CheckCircle },
  CONFIRMED: { label: 'Confirmed', color: 'bg-green-600', icon: CheckCircle }
}

export function ProductCard({
  product,
  isSelected,
  viewMode,
  onCheckboxChange,
  onProductClick,
  onReanalyze,
  onImageClick
}: ProductCardProps): JSX.Element {
  const StatusIcon = statusConfig[product.status].icon
  const primaryPhoto = product.photos.find(p => p.isPrimary) ?? product.photos[0]

  return (
    <Card 
      className={cn(
        "relative transition-all",
        isSelected && "ring-2 ring-primary",
        viewMode === 'list' && "flex"
      )}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onCheckboxChange(product.id, checked as boolean)}
          className="bg-background/90"
        />
      </div>

      {/* Status Badge */}
      <div className="absolute top-2 right-2 z-10">
        <Badge className={cn("gap-1", statusConfig[product.status].color)}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig[product.status].label}
        </Badge>
      </div>

      {viewMode === 'grid' ? (
        <ProductGridContent
          product={product}
          primaryPhoto={primaryPhoto}
          onProductClick={onProductClick}
          onReanalyze={onReanalyze}
          onImageClick={onImageClick}
        />
      ) : (
        <ProductListContent
          product={product}
          primaryPhoto={primaryPhoto}
          onProductClick={onProductClick}
          onReanalyze={onReanalyze}
          onImageClick={onImageClick}
        />
      )}
    </Card>
  )
}

interface ProductContentProps {
  product: Product
  primaryPhoto: ProductPhoto | undefined
  onProductClick?: (productId: string) => void
  onReanalyze?: (productId: string) => Promise<void>
  onImageClick?: (src: string, alt: string) => void
}

function ProductGridContent({
  product,
  primaryPhoto,
  onProductClick,
  onReanalyze,
  onImageClick
}: ProductContentProps): JSX.Element {
  return (
    <CardContent className="p-3">
      {/* Product Image */}
      <button
        type="button"
        className="aspect-square bg-muted rounded-md mb-2 overflow-hidden relative group cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={(e) => {
          e.stopPropagation()
          onImageClick?.(primaryPhoto?.dataUrl ?? '', product.name ?? 'Product')
        }}
        aria-label={`View ${product.name ?? 'product'} image`}
      >
        {primaryPhoto?.dataUrl && (
          <>
            <Image
              src={primaryPhoto.dataUrl}
              alt={product.name ?? 'Product'}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
             unoptimized/>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </>
        )}
      </button>

      {/* Product Info */}
      <div className="space-y-1">
        <h3 className="font-medium text-sm truncate">
          {product.name ?? `Product ${product.id.slice(-6)}`}
        </h3>
        {product.brand && (
          <p className="text-xs text-muted-foreground">{product.brand}</p>
        )}
        {product.category && (
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{product.photos.length} photos</span>
          {product.confidence && (
            <span>{(product.confidence * 100).toFixed(0)}% conf</span>
          )}
        </div>
      </div>

      {/* Actions */}
      {product.status === 'ANALYZED' && (
        <div className="space-y-1 mt-2">
          <Button
            size="sm"
            className="w-full"
            onClick={() => onProductClick?.(product.id)}
          >
            Validate
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full"
            onClick={() => { void onReanalyze?.(product.id) }}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Re-analyze
          </Button>
        </div>
      )}
    </CardContent>
  )
}

function ProductListContent({
  product,
  primaryPhoto,
  onProductClick,
  onReanalyze,
  onImageClick
}: ProductContentProps): JSX.Element {
  return (
    <CardContent className="p-3 flex gap-3 flex-1">
      {/* Thumbnail */}
      <button
        type="button"
        className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary relative"
        onClick={(e) => {
          e.stopPropagation()
          onImageClick?.(primaryPhoto?.dataUrl ?? '', product.name ?? 'Product')
        }}
        aria-label={`View ${product.name ?? 'product'} image`}
      >
        {primaryPhoto?.dataUrl && (
          <>
            <Image
              src={primaryPhoto.dataUrl}
              alt={product.name ?? 'Product'}
              width={80}
              height={80}
              className="object-cover transition-transform duration-200 group-hover:scale-110"
             unoptimized/>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </>
        )}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">
          {product.name ?? `Product ${product.id.slice(-6)}`}
        </h3>
        <p className="text-sm text-muted-foreground">
          {product.brand && `${product.brand} • `}
          {product.category ?? 'Uncategorized'} • 
          Qty: {product.quantity}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{product.photos.length} photos</span>
          {product.confidence && (
            <Badge variant="outline" className="text-xs">
              {(product.confidence * 100).toFixed(0)}% confidence
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {product.status === 'ANALYZED' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { void onReanalyze?.(product.id) }}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => onProductClick?.(product.id)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </CardContent>
  )
}