"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useProductStore, ProductStatus } from '@/store/product-store'
import { 
  Package, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Filter,
  Grid3x3,
  List,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  className?: string
  onProductClick?: (productId: string) => void
}

const statusConfig: Record<ProductStatus, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-500', icon: Package },
  QUEUED: { label: 'Queued', color: 'bg-yellow-500', icon: Clock },
  ANALYZING: { label: 'Analyzing', color: 'bg-blue-500', icon: RefreshCw },
  ANALYZED: { label: 'Analyzed', color: 'bg-purple-500', icon: Sparkles },
  VALIDATED: { label: 'Validated', color: 'bg-green-500', icon: CheckCircle },
  CONFIRMED: { label: 'Confirmed', color: 'bg-green-600', icon: CheckCircle }
}

export function ProductGallery({ className, onProductClick }: ProductGalleryProps) {
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
  
  // Debug log
  console.log('ProductGallery - products:', products)
  console.log('ProductGallery - products length:', products.length)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterStatus, setFilterStatus] = useState<ProductStatus | 'all'>('all')

  // Filter products by status
  const filteredProducts = filterStatus === 'all' 
    ? products 
    : products.filter(p => p.status === filterStatus)

  // Handle checkbox change
  const handleCheckboxChange = (productId: string, checked: boolean) => {
    if (checked) {
      selectProduct(productId)
    } else {
      deselectProduct(productId)
    }
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProductIds.size === filteredProducts.length) {
      deselectAllProducts()
    } else {
      filteredProducts.forEach(p => selectProduct(p.id))
    }
  }

  // Start analysis for selected products
  const handleAnalyzeSelected = async () => {
    const selectedIds = Array.from(selectedProductIds)
    if (selectedIds.length === 0) return
    
    queueProductsForAnalysis(selectedIds)
    deselectAllProducts()
    await processAnalysisQueue()
  }

  // Re-analyze a single product
  const handleReanalyze = async (productId: string) => {
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
            const count = products.filter(p => p.status === status).length
            if (count === 0) return null
            
            return (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status as ProductStatus)}
                className="gap-1"
              >
                <config.icon className="w-3 h-3" />
                {config.label} ({count})
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
            onClick={handleAnalyzeSelected}
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
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
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
            {filteredProducts.map((product) => {
              const StatusIcon = statusConfig[product.status].icon
              const isSelected = selectedProductIds.has(product.id)
              const primaryPhoto = product.photos.find(p => p.isPrimary) || product.photos[0]
              
              return (
                <Card 
                  key={product.id}
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
                      onCheckedChange={(checked) => handleCheckboxChange(product.id, checked as boolean)}
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
                    <CardContent className="p-3">
                      {/* Product Image */}
                      <div className="aspect-square bg-muted rounded-md mb-2 overflow-hidden">
                        {primaryPhoto && (
                          <img
                            src={primaryPhoto.dataUrl}
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm truncate">
                          {product.name || `Product ${product.id.slice(-6)}`}
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
                            onClick={() => handleReanalyze(product.id)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Re-analyze
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  ) : (
                    // List View
                    <CardContent className="p-3 flex gap-3 flex-1">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                        {primaryPhoto && (
                          <img
                            src={primaryPhoto.dataUrl}
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {product.name || `Product ${product.id.slice(-6)}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {product.brand && `${product.brand} • `}
                          {product.category || 'Uncategorized'}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{product.photos.length} photos</span>
                          {product.confidence && (
                            <span>{(product.confidence * 100).toFixed(0)}% confidence</span>
                          )}
                          <span>Updated {new Date(product.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {product.status === 'ANALYZED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReanalyze(product.id)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}