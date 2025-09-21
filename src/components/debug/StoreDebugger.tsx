"use client"

import React from 'react'
import { useProductStore } from '@/store/product-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bug, Trash2, Plus } from 'lucide-react'

export function StoreDebugger() {
  const { products, createProduct } = useProductStore()
  
  const createTestProduct = () => {
    const testPhotos = [
      {
        id: `photo_${Date.now()}_1`,
        dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        mimeType: 'image/png' as const,
        size: 100,
        isPrimary: true,
        timestamp: new Date()
      }
    ]
    
    const productId = createProduct(testPhotos)
    console.log('Created test product:', productId)
  }
  
  const clearStorage = () => {
    localStorage.removeItem('product-storage')
    window.location.reload()
  }
  
  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto z-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Store Debugger
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={createTestProduct}>
              <Plus className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="destructive" onClick={clearStorage}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Products: {products.length}</strong>
        </div>
        {products.map((product, index) => (
          <div key={product.id} className="p-2 bg-gray-50 rounded space-y-1">
            <div className="font-mono text-xs">ID: {product.id.slice(-8)}</div>
            <div>Name: {product.name || 'No name'}</div>
            <div>
              Status: <Badge variant="outline" className="text-xs">{product.status}</Badge>
            </div>
            <div>Photos: {product.photos.length}</div>
            <div>Created: {new Date(product.createdAt).toLocaleTimeString()}</div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No products in store. Click + to create a test product.
          </div>
        )}
      </CardContent>
    </Card>
  )
}