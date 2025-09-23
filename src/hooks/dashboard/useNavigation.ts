"use client"

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

interface NavigationReturn {
  currentPath: string
  navigate: (path: string) => void
  goBack: () => void
  isActive: (path: string) => boolean
}

export function useNavigation(): NavigationReturn {
  const router = useRouter()
  const pathname = usePathname()

  const navigate = useCallback((path: string) => {
    router.push(path)
  }, [router])

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  const isActive = useCallback((path: string) => 
    pathname === path || pathname.startsWith(`${path}/`), [pathname])

  return {
    currentPath: pathname,
    navigate,
    goBack,
    isActive
  }
}