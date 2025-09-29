import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ProductStatus as PrismaProductStatus } from '@prisma/client'

export type ProductStatus = PrismaProductStatus

export interface ProductPhoto {
  id: string
  url?: string
  thumbnailUrl?: string
  dataUrl?: string | null
  mimeType: string
  size: number
  isPrimary: boolean
  angle?: string | null
  timestamp: Date
  width?: number | null
  height?: number | null
}

export interface Product {
  id: string
  createdAt: Date
  updatedAt: Date
  status: ProductStatus
  quantity: number
  
  // AI Analysis Results
  name?: string | null
  brand?: string | null
  model?: string | null
  category?: string | null
  subcategory?: string | null
  description?: string | null
  features?: any
  condition?: string | null
  confidence?: number | null
  
  // Value estimation
  estimatedMin?: number | null
  estimatedMax?: number | null
  currency: string
  
  // Relations
  photos: ProductPhoto[]
  tags: { id: string; name: string }[]
  _count?: { analyses: number }
}

interface ProductDBStore {
  // State
  products: Product[]
  selectedProductIds: Set<string>
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchProducts: (status?: ProductStatus) => Promise<void>
  fetchProduct: (id: string) => Promise<Product | null>
  createProduct: (data: any) => Promise<Product>
  updateProduct: (id: string, data: any) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  
  // Photo management
  addPhoto: (productId: string, photo: any) => Promise<void>
  deletePhoto: (productId: string, photoId: string) => Promise<void>
  setPrimaryPhoto: (productId: string, photoId: string) => Promise<void>
  
  // Selection
  selectProduct: (id: string) => void
  deselectProduct: (id: string) => void
  deselectAllProducts: () => void
  
  // Batch operations
  batchUpdateStatus: (productIds: string[], status: ProductStatus) => Promise<void>
  batchDelete: (productIds: string[]) => Promise<void>
  queueForAnalysis: (productIds: string[]) => Promise<void>
  
  // Migration
  migrateFromLocalStorage: () => Promise<void>
  
  // Utilities
  getProductsByStatus: (status: ProductStatus) => Product[]
  clearError: () => void
}

export const useProductDBStore = create<ProductDBStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      products: [],
      selectedProductIds: new Set(),
      isLoading: false,
      error: null,
      
      // Fetch all products
      fetchProducts: async (status?: ProductStatus) => {
        set({ isLoading: true, error: null })
        try {
          const params = new URLSearchParams()
          if (status) params.append('status', status)
          params.append('userId', 'default-user')
          
          const response = await fetch(`/api/products?${params}`)
          if (!response.ok) throw new Error('Failed to fetch products')
          
          const products = await response.json()
          set({ products, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch products',
            isLoading: false 
          })
        }
      },
      
      // Fetch single product
      fetchProduct: async (id: string) => {
        try {
          const response = await fetch(`/api/products/${id}`)
          if (!response.ok) return null
          
          const product = await response.json()
          
          // Update local state
          set(state => ({
            products: state.products.map(p => p.id === id ? product : p)
          }))
          
          return product
        } catch (error) {
          console.error('Failed to fetch product:', error)
          return null
        }
      },
      
      // Create product
      createProduct: async (data: any) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          
          if (!response.ok) throw new Error('Failed to create product')
          
          const product = await response.json()
          
          set(state => ({
            products: [product, ...state.products],
            isLoading: false
          }))
          
          return product
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create product',
            isLoading: false 
          })
          throw error
        }
      },
      
      // Update product
      updateProduct: async (id: string, data: any) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          
          if (!response.ok) throw new Error('Failed to update product')
          
          const product = await response.json()
          
          set(state => ({
            products: state.products.map(p => p.id === id ? product : p),
            isLoading: false
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update product',
            isLoading: false 
          })
        }
      },
      
      // Delete product
      deleteProduct: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
          })
          
          if (!response.ok) throw new Error('Failed to delete product')
          
          set(state => ({
            products: state.products.filter(p => p.id !== id),
            selectedProductIds: new Set(Array.from(state.selectedProductIds).filter(pid => pid !== id)),
            isLoading: false
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete product',
            isLoading: false 
          })
        }
      },
      
      // Add photo
      addPhoto: async (productId: string, photo: any) => {
        try {
          const response = await fetch(`/api/products/${productId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(photo)
          })
          
          if (!response.ok) throw new Error('Failed to add photo')
          
          const newPhoto = await response.json()
          
          set(state => ({
            products: state.products.map(p => 
              p.id === productId
                ? { ...p, photos: [...p.photos, newPhoto] }
                : p
            )
          }))
        } catch (error) {
          console.error('Failed to add photo:', error)
        }
      },
      
      // Delete photo
      deletePhoto: async (productId: string, photoId: string) => {
        try {
          const response = await fetch(`/api/products/${productId}/photos?photoId=${photoId}`, {
            method: 'DELETE'
          })
          
          if (!response.ok) throw new Error('Failed to delete photo')
          
          set(state => ({
            products: state.products.map(p => 
              p.id === productId
                ? { ...p, photos: p.photos.filter(photo => photo.id !== photoId) }
                : p
            )
          }))
        } catch (error) {
          console.error('Failed to delete photo:', error)
        }
      },
      
      // Set primary photo
      setPrimaryPhoto: async (productId: string, photoId: string) => {
        set(state => ({
          products: state.products.map(p => 
            p.id === productId
              ? {
                  ...p,
                  photos: p.photos.map(photo => ({
                    ...photo,
                    isPrimary: photo.id === photoId
                  }))
                }
              : p
          )
        }))
      },
      
      // Selection
      selectProduct: (id: string) => {
        set(state => ({
          selectedProductIds: new Set(Array.from(state.selectedProductIds).concat(id))
        }))
      },
      
      deselectProduct: (id: string) => {
        set(state => ({
          selectedProductIds: new Set(Array.from(state.selectedProductIds).filter(pid => pid !== id))
        }))
      },
      
      deselectAllProducts: () => {
        set({ selectedProductIds: new Set() })
      },
      
      // Batch update status
      batchUpdateStatus: async (productIds: string[], status: ProductStatus) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/products/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              operation: 'updateStatus',
              productIds,
              data: { status }
            })
          })
          
          if (!response.ok) throw new Error('Failed to update status')
          
          set(state => ({
            products: state.products.map(p => 
              productIds.includes(p.id) 
                ? { ...p, status, updatedAt: new Date() }
                : p
            ),
            isLoading: false
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update status',
            isLoading: false 
          })
        }
      },
      
      // Batch delete
      batchDelete: async (productIds: string[]) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/products/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              operation: 'delete',
              productIds
            })
          })
          
          if (!response.ok) throw new Error('Failed to delete products')
          
          set(state => ({
            products: state.products.filter(p => !productIds.includes(p.id)),
            selectedProductIds: new Set(Array.from(state.selectedProductIds).filter(id => !productIds.includes(id))),
            isLoading: false
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete products',
            isLoading: false 
          })
        }
      },
      
      // Queue for analysis
      queueForAnalysis: async (productIds: string[]) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/products/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              operation: 'analyze',
              productIds
            })
          })
          
          if (!response.ok) throw new Error('Failed to queue for analysis')
          
          set(state => ({
            products: state.products.map(p => 
              productIds.includes(p.id) 
                ? { ...p, status: 'QUEUED' as ProductStatus }
                : p
            ),
            isLoading: false
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to queue for analysis',
            isLoading: false 
          })
        }
      },
      
      // Migrate from localStorage
      migrateFromLocalStorage: async () => {
        set({ isLoading: true, error: null })
        try {
          // Get data from localStorage
          const stored = localStorage.getItem('product-storage')
          if (!stored) {
            set({ isLoading: false })
            return
          }
          
          const data = JSON.parse(stored)
          const products = data.state?.products || []
          
          if (products.length === 0) {
            set({ isLoading: false })
            return
          }
          
          // Send to migration API
          const response = await fetch('/api/migrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products })
          })
          
          if (!response.ok) throw new Error('Migration failed')
          
          const result = await response.json()
          console.log('Migration completed:', result)
          
          // Clear localStorage after successful migration
          localStorage.removeItem('product-storage')
          
          // Fetch migrated products
          await get().fetchProducts()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Migration failed',
            isLoading: false 
          })
        }
      },
      
      // Utilities
      getProductsByStatus: (status: ProductStatus) => {
        return get().products.filter(p => p.status === status)
      },
      
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'product-db-store'
    }
  )
)