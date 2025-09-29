"use client"

import { 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Package,
  Trash2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import { BulkProductValidation } from '@/components/products/BulkProductValidation'
import { ProductValidation } from '@/components/products/ProductValidation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useProductStore } from '@/store/product-store'

export default function ValidationPage(): JSX.Element {
  const router = useRouter()
  const { getProductsByStatus, updateProductStatus, deleteProduct } = useProductStore()
  const [mounted, setMounted] = useState(false)
  const [validatingProductId, setValidatingProductId] = useState<string | null>(null)
  const [bulkValidating, setBulkValidating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading products for validation...</div>
      </div>
    )
  }

  const analyzedProducts = getProductsByStatus('ANALYZED')

  const handleStartValidation = (productId: string): void => {
    setValidatingProductId(productId)
    setBulkValidating(false)
  }

  const handleStartBulkValidation = (): void => {
    setBulkValidating(true)
    setValidatingProductId(null)
  }

  const handleValidationComplete = (): void => {
    setValidatingProductId(null)
    setBulkValidating(false)
    
    // Check if more products to validate
    const remaining = getProductsByStatus('ANALYZED')
    if (remaining.length === 0) {
      router.push('/products/confirmed')
    }
  }

  const handleSkipProduct = (productId: string): void => {
    // Mark as validated without changes (skip for now)
    updateProductStatus(productId, 'VALIDATED')
  }

  const handleDeleteProduct = (productId: string): void => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this product? This action cannot be undone.'
    )
    if (confirmDelete) {
      void deleteProduct(productId)
    }
  }

  // If in validation mode, show validation component
  if (validatingProductId) {
    return (
      <ProductValidation
        productId={validatingProductId}
        onComplete={handleValidationComplete}
        className="h-screen"
      />
    )
  }

  if (bulkValidating && analyzedProducts.length > 0) {
    return (
      <BulkProductValidation
        productIds={analyzedProducts.map(p => p.id)}
        onComplete={handleValidationComplete}
        className="h-screen"
      />
    )
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
            <h1 className="text-2xl font-bold">Product Validation</h1>
            <p className="text-sm text-muted-foreground">
              Review and validate AI-analyzed products
            </p>
          </div>
        </div>
        {analyzedProducts.length > 0 && (
          <Button 
            onClick={handleStartBulkValidation}
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Validate All ({analyzedProducts.length})
          </Button>
        )}
      </div>

      {/* Products for Validation */}
      {analyzedProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No products to validate</h3>
            <p className="text-muted-foreground mb-4">
              All products have been validated or there are no analyzed products yet
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/products/draft">
                <Button variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  View Draft Products
                </Button>
              </Link>
              <Link href="/products/confirmed">
                <Button>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  View Confirmed Products
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyzedProducts.map((product) => {
            const primaryPhoto = product.photos.find(p => p.isPrimary) ?? product.photos[0]
            
            return (
              <Card key={product.id} className="overflow-hidden">
                {/* Product Image */}
                <div className="aspect-video bg-muted overflow-hidden relative">
                  {primaryPhoto?.dataUrl && (
                    <Image
                      src={primaryPhoto.dataUrl}
                      alt={product.name ?? 'Product'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                     unoptimized/>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Product Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">
                        {product.name ?? `Product ${product.id.slice(-6)}`}
                      </h3>
                      {product.confidence && (
                        <Badge variant="outline" className="ml-2">
                          {(product.confidence * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                    
                    {product.brand && (
                      <p className="text-sm text-muted-foreground">
                        Brand: {product.brand}
                      </p>
                    )}
                    
                    {product.category && (
                      <Badge className="mr-2">
                        {product.category}
                      </Badge>
                    )}
                    
                    {product.subcategory && (
                      <Badge variant="outline">
                        {product.subcategory}
                      </Badge>
                    )}

                    {product.estimatedMin && product.estimatedMax && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Value:</span>
                        <span>
                          ${product.estimatedMin} - ${product.estimatedMax}
                        </span>
                      </div>
                    )}

                    {product.condition && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Condition:</span>
                        <span>{product.condition}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="w-8 px-0"
                      title="Delete product"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSkipProduct(product.id)}
                      className="flex-1"
                    >
                      Skip
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStartValidation(product.id)}
                      className="flex-1 gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Validate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Info Alert */}
      {analyzedProducts.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Validation Tips</p>
                <p className="text-sm text-muted-foreground">
                  Review the AI-generated information for each product. Correct any errors, 
                  add missing details, and ensure the categorization is accurate before confirming.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}