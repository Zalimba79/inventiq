import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ProductStatus = 
  | 'DRAFT'
  | 'QUEUED'
  | 'ANALYZING'
  | 'ANALYZED'
  | 'VALIDATED'
  | 'CONFIRMED'

export interface ProductPhoto {
  id: string
  dataUrl: string
  mimeType: string
  size: number
  isPrimary: boolean
  angle?: string
  timestamp: Date
}

export interface Product {
  id: string
  createdAt: Date
  updatedAt: Date
  status: ProductStatus
  
  // AI Analysis Results
  name?: string
  brand?: string
  model?: string
  category?: string
  subcategory?: string
  description?: string
  features?: string[]
  condition?: string
  confidence?: number
  
  // Value estimation
  estimatedMin?: number
  estimatedMax?: number
  currency: string
  
  // Inventory data
  quantity: number
  
  // Associated data
  photos: ProductPhoto[]
  tags: string[]
  
  // UI state
  selected?: boolean
}

interface ProductStore {
  // State
  products: Product[]
  selectedProductIds: Set<string>
  analysisQueue: string[]
  isAnalyzing: boolean
  
  // Actions - Product Management
  createProduct: (photos: ProductPhoto[], quantity?: number) => string
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined
  
  // Actions - Photo Management
  addPhotoToProduct: (productId: string, photo: ProductPhoto) => void
  removePhotoFromProduct: (productId: string, photoId: string) => void
  setPrimaryPhoto: (productId: string, photoId: string) => void
  
  // Actions - Selection
  selectProduct: (id: string) => void
  deselectProduct: (id: string) => void
  selectAllProducts: () => void
  deselectAllProducts: () => void
  getSelectedProducts: () => Product[]
  
  // Actions - Analysis Queue
  queueProductsForAnalysis: (productIds: string[]) => void
  processAnalysisQueue: () => Promise<void>
  updateProductWithAnalysis: (productId: string, analysis: any) => void
  
  // Actions - Status Management
  updateProductStatus: (id: string, status: ProductStatus) => void
  getProductsByStatus: (status: ProductStatus) => Product[]
  
  // Actions - Tags
  addTagToProduct: (productId: string, tag: string) => void
  removeTagFromProduct: (productId: string, tag: string) => void
  getAllTags: () => string[]
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      // Initial state
      products: [],
      selectedProductIds: new Set(),
      analysisQueue: [],
      isAnalyzing: false,
      
      // Product Management
      createProduct: (photos, quantity = 1) => {
        const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newProduct: Product = {
          id: productId,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'DRAFT',
          currency: 'USD',
          quantity,
          photos,
          tags: [],
        }
        
        set((state) => ({
          products: [...state.products, newProduct]
        }))
        
        return productId
      },
      
      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === id 
              ? { ...p, ...updates, updatedAt: new Date() }
              : p
          )
        }))
      },
      
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter(p => p.id !== id),
          selectedProductIds: new Set([...state.selectedProductIds].filter(pid => pid !== id))
        }))
      },
      
      getProduct: (id) => {
        return get().products.find(p => p.id === id)
      },
      
      // Photo Management
      addPhotoToProduct: (productId, photo) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === productId
              ? { 
                  ...p, 
                  photos: [...p.photos, photo],
                  updatedAt: new Date()
                }
              : p
          )
        }))
      },
      
      removePhotoFromProduct: (productId, photoId) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === productId
              ? { 
                  ...p, 
                  photos: p.photos.filter(ph => ph.id !== photoId),
                  updatedAt: new Date()
                }
              : p
          )
        }))
      },
      
      setPrimaryPhoto: (productId, photoId) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === productId
              ? { 
                  ...p, 
                  photos: p.photos.map(ph => ({
                    ...ph,
                    isPrimary: ph.id === photoId
                  })),
                  updatedAt: new Date()
                }
              : p
          )
        }))
      },
      
      // Selection
      selectProduct: (id) => {
        set((state) => ({
          selectedProductIds: new Set([...state.selectedProductIds, id])
        }))
      },
      
      deselectProduct: (id) => {
        set((state) => {
          const newSet = new Set(state.selectedProductIds)
          newSet.delete(id)
          return { selectedProductIds: newSet }
        })
      },
      
      selectAllProducts: () => {
        const allIds = get().products.map(p => p.id)
        set({ selectedProductIds: new Set(allIds) })
      },
      
      deselectAllProducts: () => {
        set({ selectedProductIds: new Set() })
      },
      
      getSelectedProducts: () => {
        const selectedIds = get().selectedProductIds
        return get().products.filter(p => selectedIds.has(p.id))
      },
      
      // Analysis Queue
      queueProductsForAnalysis: (productIds) => {
        // Update status to QUEUED for selected products
        set((state) => ({
          products: state.products.map(p => 
            productIds.includes(p.id)
              ? { ...p, status: 'QUEUED' as ProductStatus, updatedAt: new Date() }
              : p
          ),
          analysisQueue: [...new Set([...state.analysisQueue, ...productIds])]
        }))
      },
      
      processAnalysisQueue: async () => {
        const queue = get().analysisQueue
        if (queue.length === 0 || get().isAnalyzing) return
        
        set({ isAnalyzing: true })
        
        // Process queue items one by one
        for (const productId of queue) {
          const product = get().getProduct(productId)
          if (!product) continue
          
          // Update status to ANALYZING
          get().updateProductStatus(productId, 'ANALYZING')
          
          try {
            // Call AI analysis API
            const response = await fetch('/api/ai/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                images: product.photos.map(p => p.dataUrl),
                sessionId: `batch-${productId}`
              })
            })
            
            const result = await response.json()
            
            if (result.success) {
              get().updateProductWithAnalysis(productId, result.analysis)
              get().updateProductStatus(productId, 'ANALYZED')
            } else {
              console.error(`Analysis failed for product ${productId}:`, result.error)
              get().updateProductStatus(productId, 'DRAFT')
            }
          } catch (error) {
            console.error(`Error analyzing product ${productId}:`, error)
            get().updateProductStatus(productId, 'DRAFT')
          }
          
          // Remove from queue
          set((state) => ({
            analysisQueue: state.analysisQueue.filter(id => id !== productId)
          }))
        }
        
        set({ isAnalyzing: false })
      },
      
      updateProductWithAnalysis: (productId, analysis) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === productId
              ? {
                  ...p,
                  name: analysis.name,
                  brand: analysis.brand,
                  model: analysis.model,
                  category: analysis.category,
                  subcategory: analysis.subcategory,
                  description: analysis.description,
                  features: analysis.features,
                  condition: analysis.condition,
                  confidence: analysis.confidence,
                  estimatedMin: analysis.estimatedValue?.min,
                  estimatedMax: analysis.estimatedValue?.max,
                  updatedAt: new Date()
                }
              : p
          )
        }))
      },
      
      // Status Management
      updateProductStatus: (id, status) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === id
              ? { ...p, status, updatedAt: new Date() }
              : p
          )
        }))
      },
      
      getProductsByStatus: (status) => {
        return get().products.filter(p => p.status === status)
      },
      
      // Tags
      addTagToProduct: (productId, tag) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === productId
              ? { 
                  ...p, 
                  tags: [...new Set([...p.tags, tag])],
                  updatedAt: new Date()
                }
              : p
          )
        }))
      },
      
      removeTagFromProduct: (productId, tag) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === productId
              ? { 
                  ...p, 
                  tags: p.tags.filter(t => t !== tag),
                  updatedAt: new Date()
                }
              : p
          )
        }))
      },
      
      getAllTags: () => {
        const allTags = new Set<string>()
        get().products.forEach(p => p.tags.forEach(t => allTags.add(t)))
        return Array.from(allTags)
      }
    }),
    {
      name: 'product-storage',
      partialize: (state) => ({
        products: state.products,
        analysisQueue: state.analysisQueue
      }),
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null
          const str = localStorage.getItem(name)
          if (!str) return null
          try {
            const data = JSON.parse(str)
            return data
          } catch (e) {
            console.error('Error parsing stored data:', e)
            return null
          }
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return
          localStorage.removeItem(name)
        }
      }
    }
  )
)