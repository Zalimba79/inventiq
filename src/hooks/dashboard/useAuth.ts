"use client"

import { useEffect, useState } from 'react'

interface AuthStatus {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export function useAuth(): AuthStatus {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Simuliere Auth-Check
    const checkAuth = (): void => {
      setIsLoading(true)
      try {
        // In Zukunft: API-Call für Auth-Status
        // Momentan: Mock-Daten
        const mockUser: User = {
          id: '1',
          name: 'Demo User',
          email: 'demo@inventiq.ai'
        }
        
        setUser(mockUser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return {
    isAuthenticated,
    isLoading,
    user
  }
}