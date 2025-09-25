"use client"

import { ArrowLeft, Package, Camera, Upload } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/**
 * Capture Page - Starting fresh with Studio concept
 * Inspired by Orbitvu professional product photography
 */
export default function CapturePage(): JSX.Element {

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Product Capture Studio</h1>
                <p className="text-sm text-muted-foreground">
                  Professional product photography workspace
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Capture Options */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          
          {/* Option 1: Studio Capture */}
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Studio Capture</h3>
              <p className="text-sm text-muted-foreground">
                Professional multi-angle capture with guides
              </p>
              <Link href="/capture/studio" className="w-full">
                <Button className="w-full">
                  Open Studio
                </Button>
              </Link>
            </div>
          </Card>

          {/* Option 2: Quick Capture */}
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Package className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg">Quick Capture</h3>
              <p className="text-sm text-muted-foreground">
                Fast single-photo capture for simple items
              </p>
              <Link href="/capture/quick" className="w-full">
                <Button variant="outline" className="w-full">
                  Quick Photo
                </Button>
              </Link>
            </div>
          </Card>

          {/* Option 3: Upload Files */}
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg">Upload Files</h3>
              <p className="text-sm text-muted-foreground">
                Import existing product photos
              </p>
              <Button variant="outline" className="w-full" onClick={() => alert('File upload coming soon!')}>
                Choose Files
              </Button>
            </div>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="p-6 bg-muted/50">
            <h2 className="font-semibold mb-3">📸 Professional Product Photography Tips</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use consistent lighting for all product photos</li>
              <li>• Capture multiple angles (front, side, back, top)</li>
              <li>• Keep background neutral and clean</li>
              <li>• Ensure products are centered and properly framed</li>
              <li>• Take photos at the highest quality possible</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}