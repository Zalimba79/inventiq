"use client"

import { 
  Grid3x3,
  List,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useProductStore, type ProductStatus } from '@/store/product-store'

import { ImageLightbox } from './ImageLightbox'
import { ProductCard } from './ProductCard'


interface ProductGalleryProps {
  className?: string
  onProductClick?: (productId: string) => void
}



export function ProductGallery({ className, onProductClick }: ProductGalleryProps): JSX.Element {
  const {
    products,
    selectedProductIds,
    selectProduct,
    deselectProduct,
    selectAllProducts,
    deselectAllProducts,
    queueProductsForAnalysis,
    processAnalysisQueue,
    isAnalyzing
  } = useProductStore()
  
  const [lightboxImage, setLightboxImage] = useState<{ src: string, alt: string } | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterStatus, setFilterStatus] = useState<ProductStatus | 'all'>('all')

  // Filter products by status
  const filteredProducts = filterStatus === 'all' 
    ? products 
    : products.filter(p => p.status === filterStatus)
    
  // Status configuration for filter buttons
  const statusConfig: Record<ProductStatus, { label: string; count: number }> = {
    DRAFT: { label: 'Draft', count: products.filter(p => p.status === 'DRAFT').length },
    QUEUED: { label: 'Queued', count: products.filter(p => p.status === 'QUEUED').length },
    ANALYZING: { label: 'Analyzing', count: products.filter(p => p.status === 'ANALYZING').length },
    ANALYZED: { label: 'Analyzed', count: products.filter(p => p.status === 'ANALYZED').length },
    VALIDATED: { label: 'Validated', count: products.filter(p => p.status === 'VALIDATED').length },
    CONFIRMED: { label: 'Confirmed', count: products.filter(p => p.status === 'CONFIRMED').length }
  }

  // Handle checkbox change
  const handleCheckboxChange = (productId: string, checked: boolean): void => {
    if (checked) {
      selectProduct(productId)
    } else {
      deselectProduct(productId)
    }
  }

  // Handle select all
  const handleSelectAll = (): void => {
    if (selectedProductIds.size === filteredProducts.length) {
      deselectAllProducts()
    } else {
      selectAllProducts()
    }
  }

  // Start analysis for selected products
  const handleAnalyzeSelected = async (): Promise<void> => {
    const selectedIds = Array.from(selectedProductIds)
    if (selectedIds.length === 0) return
    
    queueProductsForAnalysis(selectedIds)
    deselectAllProducts()
    await processAnalysisQueue()
  }

  // Re-analyze a single product
  const handleReanalyze = async (productId: string): Promise<void> => {
    queueProductsForAnalysis([productId])
    await processAnalysisQueue()
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with filters and actions */}
      <div className="border-b p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Product Inventory</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Filter:</span>
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All ({products.length})
          </Button>
          {Object.entries(statusConfig).map(([status, config]) => {
            if (config.count === 0) return null
            
            return (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status as ProductStatus)}
              >
                {config.label} ({config.count})
              </Button>
            )
          })}
        </div>

        {/* Selection Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedProductIds.size} of {filteredProducts.length} selected
            </span>
          </div>
          
          <Button
            onClick={() => { void handleAnalyzeSelected() }}
            disabled={selectedProductIds.size === 0 || isAnalyzing}
            className="gap-2"
          >
            {isAnalyzing && <RefreshCw className="w-4 h-4 animate-spin" />}
            <Sparkles className="w-4 h-4" />
            Analyze Selected ({selectedProductIds.size})
          </Button>
        </div>
      </div>

      {/* Product Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by capturing photos of your products
            </p>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              : "space-y-2"
          )}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedProductIds.has(product.id)}
                viewMode={viewMode}
                onCheckboxChange={handleCheckboxChange}
                onProductClick={onProductClick}
                onReanalyze={handleReanalyze}
                onImageClick={(src, alt) => setLightboxImage({ src, alt })}
              />
            ))} 
          </div>
        )}
      </div>
      
      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
          imageSrc={lightboxImage.src}
          imageAlt={lightboxImage.alt}
        />
      )}
    </div>
  )
}
