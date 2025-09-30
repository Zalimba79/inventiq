"use client"

import { 
  Package, 
  Sparkles, 
  ArrowLeft,
  Camera,
  RefreshCw,
  Trash2,
  Grid3x3,
  List
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import { DraftProductCard } from '@/components/products/DraftProductCard'
import { LightGallery, useLightGallery } from '@/components/lightgallery'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useProductDBStore } from '@/store/product-db-store'

export default function DraftProductsContent(): JSX.Element {
  const router = useRouter()
  const { openGallery, updateProduct, product: currentLightboxProduct } = useLightGallery()
  const {
    selectedProductIds,
    selectProduct,
    deselectProduct,
    deselectAllProducts,
    deleteProduct,
    deletePhoto,
    setPrimaryPhoto,
    updatePhotoRotation,
    queueForAnalysis,
    fetchProducts,
    products
  } = useProductDBStore()

  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Fetch products from database on mount
    void fetchProducts('DRAFT')
  }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading draft products...</div>
      </div>
    )
  }

  const draftProducts = products.filter(p => p.status === 'DRAFT')

  const handleCheckboxChange = (productId: string, checked: boolean): void => {
    if (checked) {
      selectProduct(productId)
    } else {
      deselectProduct(productId)
    }
  }

  const handleSelectAll = (): void => {
    if (selectedProductIds.size === draftProducts.length) {
      deselectAllProducts()
    } else {
      draftProducts.forEach(p => selectProduct(p.id))
    }
  }

  const handleAnalyzeSelected = async (): Promise<void> => {
    const selectedIds = Array.from(selectedProductIds).filter(id => 
      draftProducts.some(p => p.id === id)
    )
    if (selectedIds.length === 0) return
    
    setIsAnalyzing(true)
    try {
      await queueForAnalysis(selectedIds)
      deselectAllProducts()
      // Navigate to validation page after analysis
      router.push('/products/validation')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDeleteSelected = (): void => {
    const selectedIds = Array.from(selectedProductIds)
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} product${selectedIds.length > 1 ? 's' : ''}? This will also delete all associated photos.`
    )
    if (confirmDelete) {
      selectedIds.forEach(id => void deleteProduct(id))
      deselectAllProducts()
    }
  }

  const handleDeleteSingle = (productId: string): void => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this product and all its photos? This action cannot be undone.'
    )
    if (confirmDelete) {
      void deleteProduct(productId)
      deselectProduct(productId)
    }
  }

  const handleImageClick = (product: any, photoIndex: number) => {
    openGallery(product, photoIndex)
  }

  return (
    <>
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
            {draftProducts.map((product, index) => {
              const isSelected = selectedProductIds.has(product.id)
              
              return (
                <Card 
                  key={product.id}
                  className={cn(
                    "relative transition-all",
                    isSelected && "ring-2 ring-primary",
                    viewMode === 'list' && "flex"
                  )}
                >
                  <DraftProductCard
                    product={product}
                    isSelected={isSelected}
                    viewMode={viewMode}
                    onCheckboxChange={handleCheckboxChange}
                    onDelete={handleDeleteSingle}
                    onAnalyze={async (productId) => {
                      setIsAnalyzing(true)
                      try {
                        await queueForAnalysis([productId])
                        router.push('/products/validation')
                      } finally {
                        setIsAnalyzing(false)
                      }
                    }}
                    onImageClick={(src, alt) => {
                      // Find the photo index for this specific image
                      const photoIndex = product.photos.findIndex(p => {
                        const photoUrl = p.url ?? p.dataUrl
                        return photoUrl === src
                      })
                      handleImageClick(product, photoIndex >= 0 ? photoIndex : 0)
                    }}
                    index={index}
                  />
                </Card>
              )
            })}
          </div>
        )}
      </div>
      
      {/* LightGallery Component */}
      <LightGallery
        onSetPrimaryPhoto={async (photoId) => {
          console.log('Setting primary photo:', photoId)
          console.log('Draft products:', draftProducts)
          const product = draftProducts.find(p => p.photos.some(ph => ph.id === photoId))
          console.log('Found product:', product)
          if (product) {
            console.log('Calling setPrimaryPhoto with:', product.id, photoId)
            await setPrimaryPhoto(product.id, photoId)
            await fetchProducts('DRAFT')
            
            // The lightbox will be automatically updated through the context handler
            // since we already update it in LightGalleryControls when setPrimary is called
          } else {
            console.error('Product not found for photo:', photoId)
          }
        }}
        onDeletePhoto={async (photoId) => {
          const product = draftProducts.find(p => p.photos.some(ph => ph.id === photoId))
          if (product) {
            await deletePhoto(product.id, photoId)
            await fetchProducts('DRAFT')
            
            // The lightbox will be automatically updated through the context handler
            // since we already update it in LightGalleryControls when delete is called
          }
        }}
        onSaveRotation={async (photoId, rotation) => {
          const product = draftProducts.find(p => p.photos.some(ph => ph.id === photoId))
          if (product) {
            await updatePhotoRotation(product.id, photoId, rotation)
          }
        }}
      />
    </>
  )
}