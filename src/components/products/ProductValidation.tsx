"use client"

import { 
  CheckCircle, 
  XCircle, 
  Edit2, 
  Save, 
  X, 
  AlertTriangle,
  TrendingUp,
  Package,
  DollarSign,
  Info,
  RefreshCw
} from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useProductStore, type Product } from '@/store/product-store'

interface ProductValidationProps {
  productId: string
  onComplete?: () => void
  className?: string
}

interface EditFormProps {
  editedProduct: Partial<Product>
  setEditedProduct: (product: Partial<Product>) => void
  onSave: () => void
  onCancel: () => void
}

// Edit form component
function ProductEditForm({ editedProduct, setEditedProduct, onSave, onCancel }: EditFormProps): React.ReactElement {
  return (
    <>
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={editedProduct.name ?? ''}
          onChange={(e) => setEditedProduct({...editedProduct, name: e.target.value})}
        />
      </div>

      <div>
        <Label htmlFor="brand">Brand</Label>
        <Input
          id="brand"
          value={editedProduct.brand ?? ''}
          onChange={(e) => setEditedProduct({...editedProduct, brand: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={editedProduct.category ?? ''}
            onChange={(e) => setEditedProduct({...editedProduct, category: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="subcategory">Subcategory</Label>
          <Input
            id="subcategory"
            value={editedProduct.subcategory ?? ''}
            onChange={(e) => setEditedProduct({...editedProduct, subcategory: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="condition">Condition</Label>
        <select
          id="condition"
          className="w-full px-3 py-2 border rounded-md"
          value={editedProduct.condition ?? ''}
          onChange={(e) => setEditedProduct({...editedProduct, condition: e.target.value})}
        >
          <option value="">Select condition</option>
          <option value="new">New</option>
          <option value="like-new">Like New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div>
        <Label>Estimated Value</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={editedProduct.estimatedMin ?? ''}
            onChange={(e) => setEditedProduct({...editedProduct, estimatedMin: parseFloat(e.target.value)})}
          />
          <Input
            type="number"
            placeholder="Max"
            value={editedProduct.estimatedMax ?? ''}
            onChange={(e) => setEditedProduct({...editedProduct, estimatedMax: parseFloat(e.target.value)})}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onSave} size="sm">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button onClick={onCancel} size="sm" variant="outline">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </>
  )
}

// Display component for product info
function ProductInfoDisplay({ product }: { product: Product }): React.ReactElement {
  return (
    <>
      <div>
        <span className="text-sm font-medium text-muted-foreground">Product Name</span>
        <p className="text-lg font-semibold">{product.name ?? 'Unknown'}</p>
      </div>

      <div>
        <span className="text-sm font-medium text-muted-foreground">Brand</span>
        <p>{product.brand ?? 'Unknown'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-medium text-muted-foreground">Category</span>
          <p>{product.category ?? 'Uncategorized'}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground">Subcategory</span>
          <p>{product.subcategory ?? '-'}</p>
        </div>
      </div>

      {product.condition && (
        <div>
          <span className="text-sm font-medium text-muted-foreground">Condition</span>
          <Badge variant="outline" className="ml-2">
            {product.condition}
          </Badge>
        </div>
      )}

      {(product.estimatedMin ?? product.estimatedMax) && (
        <div>
          <span className="text-sm font-medium text-muted-foreground">Estimated Value</span>
          <p className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {product.estimatedMin && product.estimatedMax
              ? `${product.estimatedMin} - ${product.estimatedMax}`
              : product.estimatedMin ?? product.estimatedMax}
            {' '}{product.currency}
          </p>
        </div>
      )}

      {product.features && product.features.length > 0 && (
        <div>
          <span className="text-sm font-medium text-muted-foreground">Features</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {product.features.map((feature, index) => (
              <Badge key={index} variant="secondary">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export function ProductValidation({ productId, onComplete, className }: ProductValidationProps): React.ReactElement {
  const { getProduct, updateProduct, updateProductStatus, queueProductsForAnalysis, processAnalysisQueue } = useProductStore()
  const product = getProduct(productId)
  const { toast } = useToast()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({})
  const [isReanalyzing, setIsReanalyzing] = useState(false)

  if (!product) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <p className="text-muted-foreground">Product not found</p>
      </div>
    )
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProduct({
      name: product.name,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      condition: product.condition,
      estimatedMin: product.estimatedMin,
      estimatedMax: product.estimatedMax
    })
  }

  const handleSave = () => {
    updateProduct(productId, editedProduct)
    setIsEditing(false)
    toast({
      title: "Changes saved",
      description: "Product information has been updated"
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProduct({})
  }

  const handleValidate = () => {
    updateProductStatus(productId, 'VALIDATED')
    toast({
      title: "Product validated",
      description: `${product.name ?? 'Product'} has been validated and added to inventory`
    })
    onComplete?.()
  }

  const handleReject = () => {
    updateProductStatus(productId, 'DRAFT')
    toast({
      title: "Validation rejected",
      description: "Product returned to draft status for re-analysis"
    })
    onComplete?.()
  }

  const handleReanalyze = async () => {
    setIsReanalyzing(true)
    queueProductsForAnalysis([productId])
    await processAnalysisQueue()
    setIsReanalyzing(false)
    toast({
      title: "Re-analysis complete",
      description: "Product has been re-analyzed with AI"
    })
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500'
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceLabel = (confidence?: number) => {
    if (!confidence) return 'Unknown'
    if (confidence >= 0.8) return 'High Confidence'
    if (confidence >= 0.6) return 'Medium Confidence'
    return 'Low Confidence'
  }

  const primaryPhoto = product.photos.find(p => p.isPrimary) ?? product.photos[0]

  return (
    <div className={cn("max-w-4xl mx-auto p-6", className)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Product Validation</h2>
        <p className="text-muted-foreground">
          Review AI analysis results and validate product information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            {primaryPhoto?.dataUrl && (
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4 relative">
                <Image
                  src={primaryPhoto.dataUrl}
                  alt={product.name ?? 'Product'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
            
            {/* Additional photos */}
            {product.photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.photos.slice(0, 4).map((photo, index) => (
                  photo.dataUrl && (
                    <div
                      key={photo.id}
                      className={cn(
                        "aspect-square bg-muted rounded overflow-hidden relative",
                        photo.isPrimary && "ring-2 ring-primary"
                      )}
                    >
                      <Image
                        src={photo.dataUrl}
                        alt={`View ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="25vw"
                      />
                    </div>
                  )
                ))}
              </div>
            )}

            <div className="mt-4 text-sm text-muted-foreground">
              {product.photos.length} photo{product.photos.length !== 1 ? 's' : ''} captured
            </div>
          </CardContent>
        </Card>

        {/* Product Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Product Information
              </CardTitle>
              {!isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEdit}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <ProductEditForm
                editedProduct={editedProduct}
                setEditedProduct={setEditedProduct}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <ProductInfoDisplay product={product} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confidence Score */}
      {product.confidence !== undefined && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              AI Confidence Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={cn("text-2xl font-bold", getConfidenceColor(product.confidence))}>
                  {(product.confidence * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {getConfidenceLabel(product.confidence)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { void handleReanalyze() }}
                disabled={isReanalyzing}
              >
                {isReanalyzing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Re-analyze
              </Button>
            </div>
            
            {/* Confidence bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={cn(
                  "h-3 rounded-full transition-all",
                  product.confidence >= 0.8 && "bg-green-500",
                  product.confidence >= 0.6 && product.confidence < 0.8 && "bg-yellow-500",
                  product.confidence < 0.6 && "bg-red-500"
                )}
                style={{ width: `${product.confidence * 100}%` }}
              />
            </div>

            {product.confidence < 0.7 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Low confidence score. Consider re-analyzing with better photos or manually verify the information.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-center mt-6">
        <Button
          size="lg"
          variant="outline"
          onClick={handleReject}
        >
          <XCircle className="w-5 h-5 mr-2" />
          Reject & Return to Draft
        </Button>
        <Button
          size="lg"
          onClick={handleValidate}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Validate & Add to Inventory
        </Button>
      </div>
    </div>
  )
}