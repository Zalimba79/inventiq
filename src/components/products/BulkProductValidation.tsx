"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useProductStore, Product } from '@/store/product-store'
import { 
  CheckCircle,
  XCircle,
  Package,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  CheckCheck,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface BulkProductValidationProps {
  productIds: string[]
  onComplete?: () => void
  className?: string
}

export function BulkProductValidation({ productIds, onComplete, className }: BulkProductValidationProps) {
  const { products, updateProductStatus } = useProductStore()
  const { toast } = useToast()
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(productIds))
  const [validatedIds, setValidatedIds] = useState<Set<string>>(new Set())
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set())

  const productsToValidate = products.filter(p => productIds.includes(p.id))

  const handleToggleSelection = (productId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedIds(newSelected)
  }

  const handleValidateSelected = () => {
    selectedIds.forEach(id => {
      updateProductStatus(id, 'VALIDATED')
      validatedIds.add(id)
    })
    setValidatedIds(new Set(validatedIds))
    setSelectedIds(new Set())
    
    toast({
      title: "Products validated",
      description: `${validatedIds.size} products have been validated`
    })

    if (validatedIds.size === productIds.length) {
      onComplete?.()
    }
  }

  const handleRejectSelected = () => {
    selectedIds.forEach(id => {
      updateProductStatus(id, 'DRAFT')
      rejectedIds.add(id)
    })
    setRejectedIds(new Set(rejectedIds))
    setSelectedIds(new Set())
    
    toast({
      title: "Products rejected",
      description: `${rejectedIds.size} products returned to draft status`
    })
  }

  const handleValidateSingle = (productId: string) => {
    updateProductStatus(productId, 'VALIDATED')
    validatedIds.add(productId)
    setValidatedIds(new Set(validatedIds))
    
    toast({
      title: "Product validated",
      description: "Product has been added to inventory"
    })
  }

  const handleRejectSingle = (productId: string) => {
    updateProductStatus(productId, 'DRAFT')
    rejectedIds.add(productId)
    setRejectedIds(new Set(rejectedIds))
    
    toast({
      title: "Product rejected",
      description: "Product returned to draft status"
    })
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500'
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const remainingCount = productsToValidate.filter(
    p => !validatedIds.has(p.id) && !rejectedIds.has(p.id)
  ).length

  return (
    <div className={cn("max-w-6xl mx-auto p-6", className)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Bulk Product Validation</h2>
        <p className="text-muted-foreground">
          Review and validate multiple products at once
        </p>
        
        {/* Progress */}
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="default" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            {validatedIds.size} Validated
          </Badge>
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            {rejectedIds.size} Rejected
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Package className="w-3 h-3" />
            {remainingCount} Remaining
          </Badge>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedIds.size} product{selectedIds.size !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRejectSelected}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Selected
                </Button>
                <Button
                  size="sm"
                  onClick={handleValidateSelected}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Validate Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product List */}
      <div className="space-y-4">
        {productsToValidate.map((product) => {
          const isValidated = validatedIds.has(product.id)
          const isRejected = rejectedIds.has(product.id)
          const isSelected = selectedIds.has(product.id)
          const isProcessed = isValidated || isRejected
          const primaryPhoto = product.photos.find(p => p.isPrimary) || product.photos[0]
          
          return (
            <Card 
              key={product.id}
              className={cn(
                "transition-all",
                isProcessed && "opacity-50",
                isSelected && !isProcessed && "ring-2 ring-primary"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Selection checkbox */}
                  {!isProcessed && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleSelection(product.id)}
                      className="mt-6"
                    />
                  )}

                  {/* Product image */}
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {primaryPhoto && (
                      <img
                        src={primaryPhoto.dataUrl}
                        alt={product.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {product.name || `Product ${product.id.slice(-6)}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {product.brand && `${product.brand} • `}
                          {product.category || 'Uncategorized'}
                        </p>
                      </div>
                      
                      {isProcessed && (
                        <Badge 
                          variant={isValidated ? "default" : "destructive"}
                          className="gap-1"
                        >
                          {isValidated ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Validated
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </>
                          )}
                        </Badge>
                      )}
                    </div>

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {product.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Confidence and value */}
                    <div className="flex items-center gap-6 mt-3">
                      {product.confidence !== undefined && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span className={cn("text-sm font-medium", getConfidenceColor(product.confidence))}>
                            {(product.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                      )}
                      
                      {(product.estimatedMin || product.estimatedMax) && (
                        <span className="text-sm text-muted-foreground">
                          ${product.estimatedMin || 0} - ${product.estimatedMax || 0}
                        </span>
                      )}

                      {product.photos.length > 1 && (
                        <span className="text-sm text-muted-foreground">
                          {product.photos.length} photos
                        </span>
                      )}
                    </div>

                    {/* Low confidence warning */}
                    {product.confidence && product.confidence < 0.7 && !isProcessed && (
                      <div className="flex items-center gap-2 mt-2 text-yellow-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs">Low confidence - manual review recommended</span>
                      </div>
                    )}
                  </div>

                  {/* Individual actions */}
                  {!isProcessed && (
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectSingle(product.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleValidateSingle(product.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Complete button */}
      {remainingCount === 0 && (
        <div className="text-center mt-8">
          <Button size="lg" onClick={onComplete}>
            <CheckCircle className="w-5 h-5 mr-2" />
            Complete Validation
          </Button>
        </div>
      )}
    </div>
  )
}