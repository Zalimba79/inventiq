"use client"

import { 
  CheckCircle,
  XCircle,
  Package,
  CheckCheck
} from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useProductStore, type Product } from '@/store/product-store'

interface BulkProductValidationProps {
  productIds: string[]
  onComplete?: () => void
  className?: string
}

// Action buttons component
function ProductActions({ 
  isValidated, 
  isRejected, 
  isProcessed, 
  onValidate, 
  onReject 
}: {
  isValidated: boolean
  isRejected: boolean
  isProcessed: boolean
  onValidate: () => void
  onReject: () => void
}): React.ReactElement {
  if (isValidated) {
    return (
      <Badge className="bg-green-500">
        <CheckCircle className="w-3 h-3 mr-1" />
        Validated
      </Badge>
    )
  }
  
  if (isRejected) {
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Rejected
      </Badge>
    )
  }
  
  return (
    <>
      <Button
        size="sm"
        variant="default"
        onClick={onValidate}
        disabled={isProcessed}
      >
        <CheckCircle className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onReject}
        disabled={isProcessed}
      >
        <XCircle className="w-4 h-4" />
      </Button>
    </>
  )
}

// Separate component to reduce complexity
function ProductValidationCard({ 
  product, 
  isValidated, 
  isRejected, 
  isSelected,
  isProcessed,
  onToggleSelect,
  onValidate,
  onReject 
}: {
  product: Product
  isValidated: boolean
  isRejected: boolean
  isSelected: boolean
  isProcessed: boolean
  onToggleSelect: () => void
  onValidate: () => void
  onReject: () => void
}): React.ReactElement {
  const primaryPhoto = product.photos.find(p => p.isPrimary) ?? product.photos[0]
  
  return (
    <Card className={cn(
      "transition-all",
      isProcessed && "opacity-50",
      isSelected && !isProcessed && "ring-2 ring-primary"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="flex items-center pt-1">
            <Checkbox
              checked={isSelected || isProcessed}
              disabled={isProcessed}
              onCheckedChange={onToggleSelect}
              aria-label={`Select ${product.name ?? 'product'}`}
            />
          </div>

          {/* Thumbnail */}
          {primaryPhoto && (
            <div className="w-24 h-24 bg-muted rounded overflow-hidden flex-shrink-0 relative">
              <Image
                src={primaryPhoto.dataUrl ?? ''}
                alt={product.name ?? 'Product'}
                fill
                className="object-cover"
                sizes="96px"
               unoptimized/>
            </div>
          )}

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg">
              {product.name ?? `Product ${product.id.slice(-6)}`}
            </h3>
            
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {product.category && (
                <Badge variant="outline">
                  <Package className="w-3 h-3 mr-1" />
                  {product.category}
                </Badge>
              )}
              
              {product.confidence && (
                <Badge variant="secondary">
                  {(product.confidence * 100).toFixed(0)}% confidence
                </Badge>
              )}
              
              {(product.estimatedMin ?? product.estimatedMax) && (
                <span className="text-sm text-muted-foreground">
                  ${product.estimatedMin ?? 0} - ${product.estimatedMax ?? 0}
                </span>
              )}
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  {product.features.slice(0, 3).join(' • ')}
                  {product.features.length > 3 && ` • +${product.features.length - 3} more`}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <ProductActions
              isValidated={isValidated}
              isRejected={isRejected}
              isProcessed={isProcessed}
              onValidate={onValidate}
              onReject={onReject}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function BulkProductValidation({ productIds, onComplete, className }: BulkProductValidationProps): JSX.Element {
  const { products, updateProductStatus } = useProductStore()
  const { toast } = useToast()
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(productIds))
  const [validatedIds, setValidatedIds] = useState<Set<string>>(new Set())
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set())

  const productsToValidate = products.filter(p => productIds.includes(p.id))

  const handleToggleSelection = (productId: string): void => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedIds(newSelected)
  }

  const handleValidateSelected = (): void => {
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

  const handleRejectSelected = (): void => {
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

  const handleValidateSingle = (productId: string): void => {
    updateProductStatus(productId, 'VALIDATED')
    validatedIds.add(productId)
    setValidatedIds(new Set(validatedIds))
    
    toast({
      title: "Product validated",
      description: "Product has been added to inventory"
    })
  }

  const handleRejectSingle = (productId: string): void => {
    updateProductStatus(productId, 'DRAFT')
    rejectedIds.add(productId)
    setRejectedIds(new Set(rejectedIds))
    
    toast({
      title: "Product rejected",
      description: "Product returned to draft status"
    })
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
          
          return (
            <ProductValidationCard
              key={product.id}
              product={product}
              isValidated={isValidated}
              isRejected={isRejected}
              isSelected={isSelected}
              isProcessed={isProcessed}
              onToggleSelect={() => handleToggleSelection(product.id)}
              onValidate={() => handleValidateSingle(product.id)}
              onReject={() => handleRejectSingle(product.id)}
            />
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