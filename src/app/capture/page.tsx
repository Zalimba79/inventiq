"use client"

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { DirectPhotoCaptureRefactored } from '@/components/camera/DirectPhotoCaptureRefactored'
import { PerformanceMonitor } from '@/components/debug/PerformanceMonitor'
import { Button } from '@/components/ui/button'

export default function CapturePage(): JSX.Element {
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

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <DirectPhotoCaptureRefactored className="h-full" />
      </div>
      
      {/* Performance Monitor (development only) */}
      <PerformanceMonitor />
    </div>
  )
}