import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { compressImage, estimateImageSize, getOptimalImageFormat } from '../lib/image-utils'
import { IndexedDBStorage, getStorageQuota } from '../lib/storage-utils'

export type ProductStatus = 
  | 'DRAFT'
  | 'QUEUED'
  | 'ANALYZING'
  | 'ANALYZED'
  | 'VALIDATED'
  | 'CONFIRMED'

export interface ProductPhoto {
  id: string
  dataUrl?: string // Optional - loaded on demand from IndexedDB
  mimeType: string
  size: number
  isPrimary: boolean
  angle?: string
  timestamp: Date
  // New fields for hybrid storage
  isLoaded?: boolean
  storageType?: 'localStorage' | 'indexedDB' // Optional for backward compatibility
  originalSize?: number
  compressed?: boolean
}

// Internal photo data stored in IndexedDB
export interface PhotoData {
  id: string
  dataUrl: string
  mimeType: string
  originalSize: number
  compressed: boolean
  createdAt: Date
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
  
  // Storage management
  imageDB: IndexedDBStorage | null
  storageQuota: { used: number; total: number; percentage: number }
  
  // Actions - Product Management
  createProduct: (photos: ProductPhoto[], quantity?: number) => Promise<string>
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => Promise<void>
  getProduct: (id: string) => Product | undefined
  
  // Actions - Photo Management (Enhanced for hybrid storage)
  addPhotoToProduct: (productId: string, dataUrl: string, metadata?: Partial<ProductPhoto>) => Promise<void>
  removePhotoFromProduct: (productId: string, photoId: string) => Promise<void>
  setPrimaryPhoto: (productId: string, photoId: string) => void
  loadPhoto: (photoId: string) => Promise<string | null>
  preloadPhotos: (productId: string) => Promise<void>
  optimizePhotoForStorage: (dataUrl: string) => Promise<{ photo: ProductPhoto; photoData: PhotoData }>
  
  // Actions - Selection
  selectProduct: (id: string) => void
  deselectProduct: (id: string) => void
  selectAllProducts: () => void
  deselectAllProducts: () => void
  getSelectedProducts: () => Product[]
  
  // Actions - Analysis Queue
  queueProductsForAnalysis: (productIds: string[]) => void
  processAnalysisQueue: () => Promise<void>
  updateProductWithAnalysis: (productId: string, analysis: Partial<Product> & { estimatedValue?: { min?: number; max?: number } }) => void
  
  // Actions - Status Management
  updateProductStatus: (id: string, status: ProductStatus) => void
  getProductsByStatus: (status: ProductStatus) => Product[]
  
  // Actions - Tags
  addTagToProduct: (productId: string, tag: string) => void
  removeTagFromProduct: (productId: string, tag: string) => void
  getAllTags: () => string[]
  
  // Storage management actions
  initializeStorage: () => Promise<void>
  getStorageInfo: () => Promise<{ localStorage: { used: number; available: number }; indexedDB: { used: number; available: number } }>
  clearAllData: () => Promise<void>
  compactStorage: () => Promise<void>
}

// Storage manager instance
let imageDB: IndexedDBStorage | null = null

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      // Initial state
      products: [],
      selectedProductIds: new Set(),
      analysisQueue: [],
      isAnalyzing: false,
      imageDB: null,
      storageQuota: { used: 0, total: 0, percentage: 0 },
      
      // Initialize storage
      initializeStorage: async () => {
        if (!imageDB) {
          imageDB = new IndexedDBStorage('InventiqDB', 1)
          await imageDB.init()
          set({ imageDB })
        }
        
        // Update storage quota info
        const quota = await getStorageQuota()
        set({ storageQuota: { used: quota.used, total: quota.total, percentage: quota.percentage } })
      },
      
      // Product Management (Enhanced for async photo storage)
      createProduct: async (photos, quantity = 1) => {
        await get().initializeStorage()
        
        const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Process photos for hybrid storage
        const processedPhotos: ProductPhoto[] = []
        
        for (const photo of photos) {
          if (photo.dataUrl) {
            const { photo: optimizedPhoto, photoData } = await get().optimizePhotoForStorage(photo.dataUrl)
            
            // Store large images in IndexedDB
            if (imageDB && optimizedPhoto.storageType === 'indexedDB') {
              await imageDB.setItem('photos', photoData)
            }
            
            processedPhotos.push({
              ...optimizedPhoto,
              isPrimary: photo.isPrimary || processedPhotos.length === 0,
              angle: photo.angle,
              timestamp: photo.timestamp || new Date()
            })
          }
        }
        
        const newProduct: Product = {
          id: productId,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'DRAFT',
          currency: 'USD',
          quantity,
          photos: processedPhotos,
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
      
      deleteProduct: async (id) => {
        const product = get().getProduct(id)
        
        // Clean up photos from IndexedDB
        if (product && imageDB) {
          for (const photo of product.photos) {
            if (photo.storageType === 'indexedDB') {
              try {
                await imageDB.removeItem('photos', photo.id)
              } catch (error) {
                console.warn(`Failed to delete photo ${photo.id} from IndexedDB:`, error)
              }
            }
          }
        }
        
        set((state) => ({
          products: state.products.filter(p => p.id !== id),
          selectedProductIds: new Set(Array.from(state.selectedProductIds).filter(pid => pid !== id))
        }))
      },
      
      getProduct: (id) => get().products.find(p => p.id === id),
      
      // Photo Management (Enhanced for hybrid storage)
      addPhotoToProduct: async (productId, dataUrl, metadata = {}) => {
        await get().initializeStorage()
        
        const { photo, photoData } = await get().optimizePhotoForStorage(dataUrl)
        
        const newPhoto: ProductPhoto = {
          ...photo,
          isPrimary: metadata.isPrimary ?? false,
          angle: metadata.angle,
          timestamp: metadata.timestamp ?? new Date()
        }
        
        // Store in IndexedDB if needed
        if (imageDB && photo.storageType === 'indexedDB') {
          await imageDB.setItem('photos', photoData)
        }
        
        set((state) => ({
          products: state.products.map(p => 
            p.id === productId
              ? { 
                  ...p, 
                  photos: [...p.photos, newPhoto],
                  updatedAt: new Date()
                }
              : p
          )
        }))
      },
      
      optimizePhotoForStorage: async (dataUrl: string) => {
        const originalSize = estimateImageSize(dataUrl)
        const sizeInMB = originalSize / (1024 * 1024)
        
        // Determine storage strategy based on size
        const useIndexedDB = sizeInMB > 0.5 // >500KB goes to IndexedDB
        
        let finalDataUrl = dataUrl
        let compressed = false
        
        // Compress 4K images for storage efficiency
        if (sizeInMB > 1) { // >1MB gets compressed
          try {
            const optimalFormat = await getOptimalImageFormat()
            const result = await compressImage(dataUrl, {
              maxWidth: 1920, // Compress 4K to 1080p for storage
              maxHeight: 1080,
              quality: 0.85,
              format: optimalFormat
            })
            finalDataUrl = result.dataUrl
            compressed = true
          } catch (error) {
            console.warn('Image compression failed, using original:', error)
          }
        }
        
        const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const finalSize = estimateImageSize(finalDataUrl)
        
        const photo: ProductPhoto = {
          id: photoId,
          dataUrl: useIndexedDB ? undefined : finalDataUrl, // Don't store in memory if going to IndexedDB
          mimeType: finalDataUrl.split(';')[0].split(':')[1] ?? 'image/jpeg',
          size: finalSize,
          isPrimary: false,
          timestamp: new Date(),
          isLoaded: !useIndexedDB, // Already loaded if in localStorage
          storageType: useIndexedDB ? 'indexedDB' : 'localStorage',
          originalSize,
          compressed
        }
        
        const photoData: PhotoData = {
          id: photoId,
          dataUrl: finalDataUrl,
          mimeType: photo.mimeType,
          originalSize,
          compressed,
          createdAt: new Date()
        }
        
        return { photo, photoData }
      },
      
      removePhotoFromProduct: async (productId, photoId) => {
        // Clean up from IndexedDB first
        if (imageDB) {
          try {
            await imageDB.removeItem('photos', photoId)
          } catch (error) {
            console.warn(`Failed to delete photo ${photoId} from IndexedDB:`, error)
          }
        }
        
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
          selectedProductIds: new Set(Array.from(state.selectedProductIds).concat(id))
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
          analysisQueue: Array.from(new Set([...state.analysisQueue, ...productIds]))
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
            // Load photos for AI analysis if needed
            const photosWithData = await Promise.all(
              product.photos.map(async (photo) => {
                if (photo.dataUrl) {
                  return photo.dataUrl
                } else {
                  const dataUrl = await get().loadPhoto(photo.id)
                  return dataUrl ?? ''
                }
              })
            )
            
            const response = await fetch('/api/ai/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                images: photosWithData.filter(Boolean),
                sessionId: `batch-${productId}`
              })
            })
            
            const result = await response.json() as { success: boolean; analysis?: Partial<Product> & { estimatedValue?: { min?: number; max?: number } }; error?: string }
            
            if (result.success && result.analysis) {
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
      
      updateProductWithAnalysis: (productId, analysis: Partial<Product> & { estimatedValue?: { min?: number; max?: number } }) => {
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
                  estimatedMin: analysis.estimatedValue?.min ?? analysis.estimatedMin,
                  estimatedMax: analysis.estimatedValue?.max ?? analysis.estimatedMax,
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
      
      getProductsByStatus: (status) => get().products.filter(p => p.status === status),
      
      // Tags
      addTagToProduct: (productId, tag) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === productId
              ? { 
                  ...p, 
                  tags: Array.from(new Set([...p.tags, tag])),
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
      },
      
      // Photo loading for on-demand access
      loadPhoto: async (photoId: string): Promise<string | null> => {
        await get().initializeStorage()
        
        if (!imageDB) return null
        
        try {
          const photoData: PhotoData | undefined = await imageDB.getItem('photos', photoId)
          return photoData?.dataUrl ?? null
        } catch (error) {
          console.warn(`Failed to load photo ${photoId}:`, error)
          return null
        }
      },
      
      preloadPhotos: async (productId: string) => {
        const product = get().getProduct(productId)
        if (!product) return
        
        const photosToLoad = product.photos.filter(p => 
          p.storageType === 'indexedDB' && !p.isLoaded
        )
        
        const loadPromises = photosToLoad.map(async (photo) => {
          const dataUrl = await get().loadPhoto(photo.id)
          if (dataUrl) {
            set((state) => ({
              products: state.products.map(p => 
                p.id === productId
                  ? {
                      ...p,
                      photos: p.photos.map(ph => 
                        ph.id === photo.id
                          ? { ...ph, dataUrl, isLoaded: true }
                          : ph
                      )
                    }
                  : p
              )
            }))
          }
        })
        
        await Promise.all(loadPromises)
      },
      
      // Storage management
      getStorageInfo: async () => {
        const quota = await getStorageQuota()
        
        let indexedDBSize = 0
        if (imageDB) {
          try {
            const photos: PhotoData[] = await imageDB.getAllItems('photos')
            indexedDBSize = photos.reduce((total, photo) => 
              total + estimateImageSize(photo.dataUrl), 0
            )
          } catch (error) {
            console.warn('Failed to calculate IndexedDB size:', error)
          }
        }
        
        return {
          localStorage: {
            used: quota.used,
            available: quota.available
          },
          indexedDB: {
            used: indexedDBSize,
            available: quota.total - indexedDBSize
          }
        }
      },
      
      clearAllData: async () => {
        // Clear IndexedDB
        if (imageDB) {
          await imageDB.clear('photos')
        }
        
        // Clear localStorage (handled by persist middleware)
        set({
          products: [],
          selectedProductIds: new Set(),
          analysisQueue: [],
          isAnalyzing: false
        })
      },
      
      compactStorage: async () => {
        // Remove orphaned photos from IndexedDB
        if (!imageDB) return
        
        const allProducts = get().products
        const usedPhotoIds = new Set(
          allProducts.flatMap(p => p.photos.map(ph => ph.id))
        )
        
        try {
          const allPhotos: PhotoData[] = await imageDB.getAllItems('photos')
          const orphanedPhotos = allPhotos.filter(photo => !usedPhotoIds.has(photo.id))
          
          for (const photo of orphanedPhotos) {
            await imageDB.removeItem('photos', photo.id)
          }
          
          // Removed orphaned photos from IndexedDB
        } catch (error) {
          console.warn('Failed to compact storage:', error)
        }
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
            const data = JSON.parse(str) as ProductStore
            return { state: data, version: 0 }
          } catch (e) {
            console.error('Error parsing stored data:', e)
            return null
          }
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return
          try {
            // Only store metadata in localStorage (photos are in IndexedDB)
            const dataString = JSON.stringify(value)
            
            // Much smaller payload now - only metadata
            const sizeInMB = (dataString.length * 2) / (1024 * 1024)
            if (sizeInMB > 2) {
              console.warn(`⚠️ Metadata storage usage: ${sizeInMB.toFixed(2)}MB`)
            }
            
            localStorage.setItem(name, dataString)
          } catch (error) {
            console.error('Failed to save to localStorage:', error)
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
              // This should be rare now since images are in IndexedDB
              console.error('localStorage quota exceeded even with hybrid storage')
              throw error
            }
          }
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return
          localStorage.removeItem(name)
        }
      }
    }
  )
)