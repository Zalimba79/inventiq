"use client"

import { useState, useEffect } from 'react'
import { useProductStore } from '@/store/product-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Package, 
  Sparkles, 
  ArrowLeft,
  Camera,
  RefreshCw,
  Trash2,
  Edit,
  Grid3x3,
  List
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function DraftProductsPage() {
  const router = useRouter()
  const {
    products,
    selectedProductIds,
    selectProduct,
    deselectProduct,
    selectAllProducts,
    deselectAllProducts,
    deleteProduct,
    queueProductsForAnalysis,
    processAnalysisQueue,
    isAnalyzing,
    getProductsByStatus
  } = useProductStore()

  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading draft products...</div>
      </div>
    )
  }

  const draftProducts = getProductsByStatus('DRAFT')

  const handleCheckboxChange = (productId: string, checked: boolean) => {
    if (checked) {
      selectProduct(productId)
    } else {
      deselectProduct(productId)
    }
  }

  const handleSelectAll = () => {
    if (selectedProductIds.size === draftProducts.length) {
      deselectAllProducts()
    } else {
      draftProducts.forEach(p => selectProduct(p.id))
    }
  }

  const handleAnalyzeSelected = async () => {
    const selectedIds = Array.from(selectedProductIds).filter(id => 
      draftProducts.some(p => p.id === id)
    )
    if (selectedIds.length === 0) return
    
    queueProductsForAnalysis(selectedIds)
    deselectAllProducts()
    await processAnalysisQueue()
    
    // Navigate to validation page after analysis
    router.push('/products/validation')
  }

  const handleDeleteSelected = () => {
    const selectedIds = Array.from(selectedProductIds)
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} product${selectedIds.length > 1 ? 's' : ''}? This will also delete all associated photos.`
    )
    if (confirmDelete) {
      selectedIds.forEach(id => deleteProduct(id))
      deselectAllProducts()
    }
  }

  const handleDeleteSingle = (productId: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this product and all its photos? This action cannot be undone.'
    )
    if (confirmDelete) {
      deleteProduct(productId)
      deselectProduct(productId)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Draft Products</h1>
            <p className="text-sm text-muted-foreground">
              Products waiting for AI analysis
            </p>
          </div>
        </div>
        <Link href="/capture">
          <Button className="gap-2">
            <Camera className="w-4 h-4" />
            Capture More
          </Button>
        </Link>
      </div>

      {/* Actions Bar */}
      <div className="border rounded-lg p-4 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={selectedProductIds.size === draftProducts.length && draftProducts.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedProductIds.size} of {draftProducts.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedProductIds.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </Button>
            )}
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
      </div>

      {/* Products Grid/List */}
      {draftProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No draft products</h3>
            <p className="text-muted-foreground mb-4">
              Capture photos to create draft products
            </p>
            <Link href="/capture">
              <Button>
                <Camera className="w-4 h-4 mr-2" />
                Start Capturing
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-2"
        )}>
          {draftProducts.map((product) => {
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

                {viewMode === 'grid' ? (
                  <CardContent className="p-3">
                    {/* Product Image */}
                    <div 
                      className="aspect-square bg-muted rounded-md mb-2 overflow-hidden cursor-pointer"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      {primaryPhoto && (
                        <img
                          src={primaryPhoto.dataUrl}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Product Info */}
                    <div 
                      className="space-y-1 cursor-pointer"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      <h3 className="font-medium text-sm hover:text-primary transition-colors">
                        {product.name || `Product ${product.id.slice(-6)}`}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{product.photos.length} photos</span>
                        <span>Qty: {product.quantity || 1}</span>
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
                          handleDeleteSingle(product.id)
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
                          queueProductsForAnalysis([product.id])
                          processAnalysisQueue().then(() => {
                            router.push('/products/validation')
                          })
                        }}
                      >
                        <Sparkles className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  // List View
                  <CardContent className="p-3 flex gap-3 flex-1">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                      {primaryPhoto && (
                        <img
                          src={primaryPhoto.dataUrl}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      <h3 className="font-medium hover:text-primary transition-colors">
                        {product.name || `Product ${product.id.slice(-6)}`}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{product.photos.length} photos</span>
                        <span>Qty: {product.quantity || 1}</span>
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
                          handleDeleteSingle(product.id)
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
                          queueProductsForAnalysis([product.id])
                          processAnalysisQueue().then(() => {
                            router.push('/products/validation')
                          })
                        }}
                        title="Analyze with AI"
                      >
                        <Sparkles className="w-4 h-4" />
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
  )
}