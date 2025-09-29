"use client"

import { 
  CheckCircle, 
  ArrowLeft,
  Package,
  Search,
  Download,
  TrendingUp,
  Grid3x3,
  List,
  Trash2,
  Edit
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useProductStore } from '@/store/product-store'

export default function ConfirmedProductsPage(): JSX.Element {
  const { getProductsByStatus, deleteProduct } = useProductStore()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading confirmed products...</div>
      </div>
    )
  }

  const confirmedProducts = [
    ...getProductsByStatus('VALIDATED'),
    ...getProductsByStatus('CONFIRMED')
  ]

  // Get unique categories for filtering
  const categories = Array.from(new Set(confirmedProducts.map(p => p.category).filter(Boolean)))

  // Filter products based on search and category
  const handleDeleteProduct = (productId: string): void => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this confirmed product? This action cannot be undone.'
    )
    if (confirmDelete) {
      void deleteProduct(productId)
    }
  }

  const filteredProducts = confirmedProducts.filter(product => {
    const matchesSearch = searchTerm === '' || (
      Boolean(product.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      Boolean(product.brand?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      Boolean(product.category?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  // Calculate total value
  let totalValue = 0
  for (const p of filteredProducts) {
    const avg = ((p.estimatedMin ?? 0) + (p.estimatedMax ?? 0)) / 2
    totalValue += avg
  }

  const handleExport = (): void => {
    // Create CSV content
    const headers = ['Name', 'Brand', 'Model', 'Category', 'Subcategory', 'Condition', 'Min Value', 'Max Value', 'Confidence']
    const rows = filteredProducts.map(p => [
      p.name ?? '',
      p.brand ?? '',
      p.model ?? '',
      p.category ?? '',
      p.subcategory ?? '',
      p.condition ?? '',
      p.estimatedMin ?? '',
      p.estimatedMax ?? '',
      p.confidence ? `${(p.confidence * 100).toFixed(0)  }%` : ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventiq-products-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
            <h1 className="text-2xl font-bold">Confirmed Products</h1>
            <p className="text-sm text-muted-foreground">
              Your validated inventory
            </p>
          </div>
        </div>
        <Button 
          onClick={handleExport}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{filteredProducts.length}</p>
              </div>
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {filteredProducts.length > 0 
                    ? `${(filteredProducts.reduce((sum, p) => sum + (p.confidence ?? 0), 0) / filteredProducts.length * 100).toFixed(0)}%`
                    : 'N/A'
                  }
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No confirmed products</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== 'all' 
                ? "No products match your filters"
                : "Validate products to see them here"}
            </p>
            {(searchTerm || categoryFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-2"
        )}>
          {filteredProducts.map((product) => {
            const primaryPhoto = product.photos.find(p => p.isPrimary) ?? product.photos[0]
            
            return viewMode === 'grid' ? (
              // Grid view - simplified
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square bg-muted overflow-hidden relative">
                  {primaryPhoto && (
                    <Image
                      src={primaryPhoto.dataUrl ?? ''}
                      alt={product.name ?? 'Product'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                     unoptimized/>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm truncate">
                    {product.name ?? `Product ${product.id.slice(-6)}`}
                  </h3>
                  {product.brand && (
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm">Qty: {product.quantity}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="w-8 px-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm" variant="outline" className="w-8 px-0">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // List view - simplified  
              <Card key={product.id}>
                <CardContent className="p-3 flex gap-3">
                  <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                    {primaryPhoto && (
                      <Image
                        src={primaryPhoto.dataUrl ?? ''}
                        alt={product.name ?? 'Product'}
                        width={80}
                        height={80}
                        className="object-cover"
                       unoptimized/>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {product.name ?? `Product ${product.id.slice(-6)}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {product.brand ?? 'Unknown Brand'} • Qty: {product.quantity}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Link href={`/products/${product.id}`}>
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
