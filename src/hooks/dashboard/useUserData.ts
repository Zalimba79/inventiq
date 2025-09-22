"use client"

import { useEffect, useState } from 'react'

interface UserData {
  stats: UserStats
  preferences: UserPreferences
  isLoading: boolean
  error: Error | null
}

interface UserStats {
  totalProducts: number
  totalPhotos: number
  lastActivity: Date
  storageUsed: number
  storageLimit: number
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: boolean
  autoAnalyze: boolean
}

export function useUserData(): UserData {
  const [stats, setStats] = useState<UserStats>({
    totalProducts: 0,
    totalPhotos: 0,
    lastActivity: new Date(),
    storageUsed: 0,
    storageLimit: 100 * 1024 * 1024 // 100 MB
  })
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'en',
    notifications: true,
    autoAnalyze: false
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadUserData = (): void => {
      setIsLoading(true)
      try {
        // Lade Statistiken aus localStorage
        const storedProducts = localStorage.getItem('product-storage')
        if (storedProducts) {
          interface StoredData {
            state: {
              products: Array<{
                photos?: Array<{ id: string }>
              }>
            }
          }
          const data = JSON.parse(storedProducts) as StoredData
          const products = data.state.products
          const totalPhotos = products.reduce((sum, product) => sum + (product.photos?.length ?? 0), 0)
          
          setStats({
            totalProducts: products.length,
            totalPhotos,
            lastActivity: new Date(),
            storageUsed: new Blob([storedProducts]).size,
            storageLimit: 100 * 1024 * 1024
          })
        }

        // Lade Präferenzen
        const storedPrefs = localStorage.getItem('user-preferences')
        if (storedPrefs) {
          setPreferences(JSON.parse(storedPrefs) as UserPreferences)
        }
      } catch (err) {
        console.error('Failed to load user data:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  return {
    stats,
    preferences,
    isLoading,
    error
  }
}