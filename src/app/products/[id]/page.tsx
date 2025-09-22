"use client"

import { 
  ArrowLeft, 
  Trash2, 
  Star, 
  Camera,
  Save,
  Package,
  Hash,
  Image as ImageIcon,
  Plus,
  Minus
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useProductStore } from '@/store/product-store'

export default function ProductDetailPage(): JSX.Element | null {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const productId = params.id as string
  
  const { 
    getProduct, 
    updateProduct, 
    removePhotoFromProduct,
    setPrimaryPhoto 
  } = useProductStore()
  
  const [mounted, setMounted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [name, setName] = useState('')
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      const product = getProduct(productId)
      if (product) {
        setQuantity(product.quantity ?? 1)
        setName(product.name ?? '')
      } else {
        // Product not found, redirect to draft
        router.push('/products/draft')
      }
    }
  }, [mounted, productId, getProduct, router])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading product...</div>
      </div>
    )
  }

  const product = getProduct(productId)
  
  if (!product) {
    return null
  }

  const handleSave = (): void => {
    updateProduct(productId, {
      quantity,
      name: name ?? undefined
    })
    
    toast({
      title: "Product updated",
      description: "Your changes have been saved",
    })
    
    // Navigate back to draft page after saving
    setTimeout(() => {
      router.push('/products/draft')
    }, 500)
  }

  const handleDeletePhoto = (photoId: string): void => {
    if (product.photos.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "Product must have at least one photo",
        variant: "destructive"
      })
      return
    }
    
    void removePhotoFromProduct(productId, photoId)
    
    toast({
      title: "Photo removed",
      description: "The photo has been deleted from this product",
    })
  }

  const handleSetPrimary = (photoId: string): void => {
    setPrimaryPhoto(productId, photoId)
    
    toast({
      title: "Primary photo set",
      description: "This photo will be shown as the main product image",
    })
  }

  const primaryPhoto = product.photos.find(p => p.isPrimary) ?? product.photos[0]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/products/draft">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Draft Products
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {product.name ?? `Product ${product.id.slice(-6)}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              Edit product details and organize photos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/capture?addTo=${productId}`}>
            <Button variant="outline" className="gap-2">
              <Camera className="w-4 h-4" />
              Add Photos
            </Button>
          </Link>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Product Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="product-name-input" className="text-sm font-medium mb-2 block">Product Name</label>
                <Input
                  id="product-name-input"
                  placeholder="Enter product name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="quantity-input" className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    id="quantity-input"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) ?? 1))}
                    className="w-20 text-center"
                    min="1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2 block">Status</div>
                <Badge variant="secondary">
                  <Package className="w-3 h-3 mr-1" />
                  {product.status}
                </Badge>
              </div>

              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Created: {new Date(product.createdAt).toLocaleString()}</div>
                  <div>Updated: {new Date(product.updatedAt).toLocaleString()}</div>
                  <div>ID: {product.id}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary Photo Display */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                {primaryPhoto && (
                  <Image
                    src={primaryPhoto.dataUrl ?? ''}
                    alt="Primary product"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Photo Management */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Photos ({product.photos.length})</CardTitle>
              <Link href={`/capture?addTo=${productId}`}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Camera className="w-4 h-4" />
                  Add More
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {product.photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={cn(
                    "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                    selectedPhotoId === photo.id 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-transparent hover:border-gray-300"
                  )}
                  onClick={() => setSelectedPhotoId(photo.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedPhotoId(photo.id)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select photo ${index + 1}`}
                >
                  <div className="aspect-square bg-muted relative">
                    <Image
                      src={photo.dataUrl ?? ''}
                      alt={`Product view ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  
                  {/* Photo number badge */}
                  <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 rounded text-xs font-medium">
                    <ImageIcon className="w-3 h-3 inline mr-1" />
                    {index + 1}
                  </div>

                  {/* Primary badge */}
                  {photo.isPrimary && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                      Main
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      {!photo.isPrimary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 flex-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSetPrimary(photo.id)
                          }}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Set Main
                        </Button>
                      )}
                      {product.photos.length > 1 && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePhoto(photo.id)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {product.photos.length === 0 && (
              <div className="text-center py-8">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No photos yet</p>
                <Link href={`/capture?addTo=${productId}`}>
                  <Button>
                    <Camera className="w-4 h-4 mr-2" />
                    Add Photos
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}