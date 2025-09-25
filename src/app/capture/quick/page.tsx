"use client"

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { MobileQuickCapture } from '@/components/capture/MobileQuickCapture'

/**
 * Quick Capture Page
 * Optimized for mobile devices using native camera
 */
export default function QuickCapturePage(): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header with Back Button */}
      <header className="sticky top-0 z-20 bg-background border-b">
        <div className="flex items-center gap-2 p-2">
          <Link href="/capture">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Quick Capture</h1>
        </div>
      </header>
      
      {/* Mobile Quick Capture Component */}
      <MobileQuickCapture />
    </div>
  )
}