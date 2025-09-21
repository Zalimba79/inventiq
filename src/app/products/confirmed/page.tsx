"use client"

import { useState, useEffect } from 'react'
import { useProductStore } from '@/store/product-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  CheckCircle, 
  ArrowLeft,
  Package,
  Search,
  Filter,
  Download,
  TrendingUp,
  Grid3x3,
  List
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ConfirmedProductsPage() {
  const { getProductsByStatus } = useProductStore()
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
  const filteredProducts = confirmedProducts.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  // Calculate total value
  const totalValue = filteredProducts.reduce((sum, p) => {
    const avg = ((p.estimatedMin || 0) + (p.estimatedMax || 0)) / 2
    return sum + avg
  }, 0)

  const handleExport = () => {
    // Create CSV content
    const headers = ['Name', 'Brand', 'Model', 'Category', 'Subcategory', 'Condition', 'Min Value', 'Max Value', 'Confidence']
    const rows = filteredProducts.map(p => [
      p.name || '',
      p.brand || '',
      p.model || '',
      p.category || '',
      p.subcategory || '',
      p.condition || '',
      p.estimatedMin || '',
      p.estimatedMax || '',
      p.confidence ? (p.confidence * 100).toFixed(0) + '%' : ''
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
                    ? `${(filteredProducts.reduce((sum, p) => sum + (p.confidence || 0), 0) / filteredProducts.length * 100).toFixed(0)}%`
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
            const primaryPhoto = product.photos.find(p => p.isPrimary) || product.photos[0]
            const avgValue = ((product.estimatedMin || 0) + (product.estimatedMax || 0)) / 2
            
            return viewMode === 'grid' ? (
              <Card key={product.id} className="overflow-hidden">
                {/* Product Image */}
                <div className="aspect-square bg-muted overflow-hidden">
                  {primaryPhoto && (
                    <img
                      src={primaryPhoto.dataUrl}
                      alt={product.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <CardContent className="p-3">
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm truncate">
                      {product.name || `Product ${product.id.slice(-6)}`}
                    </h3>
                    {product.brand && (
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                    )}
                    <div className="flex items-center gap-1 flex-wrap">
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                      {product.confidence && (
                        <Badge variant="secondary" className="text-xs">
                          {(product.confidence * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                    {avgValue > 0 && (
                      <p className="text-sm font-medium">
                        ${avgValue.toFixed(2)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card key={product.id}>
                <CardContent className="p-3 flex gap-3">
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
                    <h3 className="font-medium">
                      {product.name || `Product ${product.id.slice(-6)}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {[product.brand, product.model].filter(Boolean).join(' - ')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                      {product.condition && (
                        <span className="text-xs text-muted-foreground">
                          {product.condition}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Value and Confidence */}
                  <div className="text-right">
                    {avgValue > 0 && (
                      <p className="font-semibold">
                        ${avgValue.toFixed(2)}
                      </p>
                    )}
                    {product.confidence && (
                      <p className="text-xs text-muted-foreground">
                        {(product.confidence * 100).toFixed(0)}% conf
                      </p>
                    )}
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