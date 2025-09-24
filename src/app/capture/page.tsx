"use client"

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { SmartCaptureRouter } from '@/components/capture/SmartCaptureRouter'
import { CameraPerformanceMonitor } from '@/components/debug/CameraPerformanceMonitor'
import { PerformanceMonitor } from '@/components/debug/PerformanceMonitor'
import { Button } from '@/components/ui/button'
import { useProductStore } from '@/store/product-store'

export default function CapturePage(): JSX.Element {
  const router = useRouter()
  const { createProduct } = useProductStore()
  
  const handleItemsCaptured = (items: Array<{
    id: string
    dataUrl: string
    timestamp: Date
    size: number
    name: string
    quantity?: number
  }>): void => {
    // Create products from captured items
    items.forEach(item => {
      void createProduct([{
        id: crypto.randomUUID(),
        dataUrl: item.dataUrl,
        mimeType: 'image/jpeg',
        size: item.size ?? 0,
        isPrimary: true,
        timestamp: item.timestamp ?? new Date()
      }], item.quantity ?? 1)
    })
    
    // Navigate to draft products
    router.push('/products/draft')
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b flex-shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <h1 className="text-lg font-semibold">
                Capture Products
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Smart capture with dropzone, camera, and file upload */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SmartCaptureRouter 
          onItemsCaptured={handleItemsCaptured}
          className="h-full" 
        />
      </div>
      
      {/* Performance Monitors (development only) */}
      <PerformanceMonitor />
      <CameraPerformanceMonitor />
    </div>
  )
}