/**
 * Optimized storage utilities for Inventiq
 * Handles localStorage overflow and provides IndexedDB fallback
 */

export interface StorageQuotaInfo {
  used: number
  total: number
  available: number
  percentage: number
}

/**
 * Check localStorage quota usage
 */
export async function getStorageQuota(): Promise<StorageQuotaInfo> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    const used = estimate.usage ?? 0
    const total = estimate.quota ?? 0
    
    return {
      used,
      total,
      available: total - used,
      percentage: total > 0 ? (used / total) * 100 : 0
    }
  }
  
  // Fallback: estimate localStorage usage
  let used = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      const item = localStorage.getItem(key)
      if (item) {
        used += item.length + key.length
      }
    }
  }
  
  // Rough estimate: most browsers allow 5-10MB
  const estimated_total = 10 * 1024 * 1024 // 10MB
  
  return {
    used,
    total: estimated_total,
    available: estimated_total - used,
    percentage: (used / estimated_total) * 100
  }
}

/**
 * Check if there's enough storage space for data
 */
export async function hasStorageSpace(dataSize: number, buffer: number = 1024 * 1024): Promise<boolean> {
  const quota = await getStorageQuota()
  return quota.available > (dataSize + buffer)
}

/**
 * Optimized localStorage with overflow protection
 */
export class OptimizedStorage {
  private storageKey: string
  
  constructor(key: string) {
    this.storageKey = key
  }
  
  async setItem(key: string, value: unknown): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)
      const hasSpace = await hasStorageSpace(serialized.length)
      
      if (!hasSpace) {
        console.warn('Storage quota exceeded, considering cleanup or compression')
        return false
      }
      
      localStorage.setItem(key, serialized)
      return true
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        // Quota exceeded
        console.error('Storage quota exceeded')
        return false
      }
      throw error
    }
  }
  
  getItem<T = unknown>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) as T : null
    } catch (error) {
      console.error('Error parsing stored data:', error)
      return null
    }
  }
  
  removeItem(key: string): void {
    localStorage.removeItem(key)
  }
  
  clear(): void {
    localStorage.clear()
  }
  
  async getStorageInfo(): Promise<StorageQuotaInfo> {
    return getStorageQuota()
  }
}

/**
 * IndexedDB storage for large datasets (fallback)
 */
export class IndexedDBStorage {
  private static readonly DB_ERROR_MESSAGE = 'Database operation failed'
  private dbName: string
  private version: number
  private db: IDBDatabase | null = null
  
  constructor(dbName: string = 'InventiqDB', version: number = 1) {
    this.dbName = dbName
    this.version = version
  }
  
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(new Error(request.error?.message ?? IndexedDBStorage.DB_ERROR_MESSAGE))
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object stores
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' })
        }
      }
    })
  }
  
  async setItem(storeName: string, data: unknown): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)
      
      request.onerror = () => reject(new Error(request.error?.message ?? IndexedDBStorage.DB_ERROR_MESSAGE))
      request.onsuccess = () => resolve()
    })
  }
  
  async getItem<T = unknown>(storeName: string, key: string): Promise<T | undefined> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)
      
      request.onerror = () => reject(new Error(request.error?.message ?? IndexedDBStorage.DB_ERROR_MESSAGE))
      request.onsuccess = () => resolve(request.result as T | undefined)
    })
  }
  
  async getAllItems<T = unknown>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()
      
      request.onerror = () => reject(new Error(request.error?.message ?? IndexedDBStorage.DB_ERROR_MESSAGE))
      request.onsuccess = () => resolve(request.result as T[])
    })
  }
  
  async removeItem(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)
      
      request.onerror = () => reject(new Error(request.error?.message ?? IndexedDBStorage.DB_ERROR_MESSAGE))
      request.onsuccess = () => resolve()
    })
  }
  
  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()
      
      request.onerror = () => reject(new Error(request.error?.message ?? IndexedDBStorage.DB_ERROR_MESSAGE))
      request.onsuccess = () => resolve()
    })
  }
}

/**
 * Smart storage that automatically chooses between localStorage and IndexedDB
 */
export class SmartStorage {
  private localStorage: OptimizedStorage
  private indexedDB: IndexedDBStorage
  private useIndexedDB: boolean = false
  
  constructor(key: string) {
    this.localStorage = new OptimizedStorage(key)
    this.indexedDB = new IndexedDBStorage()
  }
  
  async init(): Promise<void> {
    // Check if localStorage has space, fallback to IndexedDB if not
    const quota = await getStorageQuota()
    this.useIndexedDB = quota.percentage > 80 // Switch to IndexedDB if >80% full
    
    if (this.useIndexedDB) {
      await this.indexedDB.init()
    }
  }
  
  async setItem(key: string, value: unknown): Promise<boolean> {
    if (this.useIndexedDB) {
      try {
        await this.indexedDB.setItem('products', { id: key, data: value })
        return true
      } catch (error) {
        console.error('IndexedDB storage failed:', error)
        return false
      }
    } else {
      const success = await this.localStorage.setItem(key, value)
      if (!success) {
        // Fallback to IndexedDB
        this.useIndexedDB = true
        await this.indexedDB.init()
        return this.setItem(key, value)
      }
      return success
    }
  }
  
  async getItem<T = unknown>(key: string): Promise<T | null> {
    if (this.useIndexedDB) {
      const result = await this.indexedDB.getItem<{data: T}>('products', key)
      return result?.data ?? null
    } else {
      return this.localStorage.getItem<T>(key)
    }
  }
  
  async removeItem(key: string): Promise<void> {
    if (this.useIndexedDB) {
      await this.indexedDB.removeItem('products', key)
    } else {
      this.localStorage.removeItem(key)
    }
  }
  
  async clear(): Promise<void> {
    if (this.useIndexedDB) {
      await this.indexedDB.clear('products')
    } else {
      this.localStorage.clear()
    }
  }
}