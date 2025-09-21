"use client"

import React, { useEffect, useState } from 'react'
import { ProductGallery } from './ProductGallery'

interface ClientProductGalleryProps {
  className?: string
  onProductClick?: (productId: string) => void
}

export function ClientProductGallery(props: ClientProductGalleryProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) {
    return (
      <div className={props.className}>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading products...</div>
        </div>
      </div>
    )
  }
  
  return <ProductGallery {...props} />
}