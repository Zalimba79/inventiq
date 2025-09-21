"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function ClearStorageButton() {
  const { toast } = useToast()

  const handleClearStorage = () => {
    const confirmClear = window.confirm(
      'This will delete all products and photos from your browser. This action cannot be undone. Continue?'
    )
    
    if (confirmClear) {
      // Clear all localStorage
      localStorage.removeItem('product-storage')
      localStorage.removeItem('capture-storage')
      
      toast({
        title: "Storage cleared",
        description: "All local data has been removed. Refreshing page...",
      })
      
      // Reload the page
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleClearStorage}
      className="gap-2"
    >
      <Trash2 className="w-4 h-4" />
      Clear All Data
    </Button>
  )
}