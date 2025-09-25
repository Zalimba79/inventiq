"use client"

import React, { useState, useRef } from 'react'

import { Card } from '@/components/ui/card'
import { CameraSelector } from './CameraSelector'
import { QuickResolutionSelector } from './QuickResolutionSelector'
import { CameraPreview, CameraPreviewRef } from './CameraPreview'
import { CaptureControls } from './CaptureControls'
import { CapturedImages } from './CapturedImages'
import { cn } from '@/lib/utils'

interface CapturedImage {
  id: string
  dataUrl: string
  timestamp: Date
  resolution: { width: number; height: number }
}

interface StudioLayoutProps {
  onSave: (images: CapturedImage[]) => void
  className?: string
}

/**
 * Main studio layout component
 * Orchestrates all capture components
 * Inspired by Orbitvu Station interface
 * Max lines: ~150
 */
export function StudioLayout({ 
  onSave,
  className 
}: StudioLayoutProps): JSX.Element {
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [selectedResolution, setSelectedResolution] = useState({ width: 1920, height: 1080 })
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  
  const cameraPreviewRef = useRef<CameraPreviewRef>(null)
  
  const handleCapture = async () => {
    if (!cameraPreviewRef.current) return
    
    setIsCapturing(true)
    
    // Small delay for visual feedback
    setTimeout(() => {
      const imageSrc = cameraPreviewRef.current?.capture()
      
      if (imageSrc) {
        const newImage: CapturedImage = {
          id: crypto.randomUUID(),
          dataUrl: imageSrc,
          timestamp: new Date(),
          resolution: selectedResolution
        }
        
        setCapturedImages(prev => [...prev, newImage])
      }
      
      setIsCapturing(false)
    }, 100)
  }
  
  const handleClear = () => {
    setCapturedImages([])
  }
  
  const handleSave = () => {
    onSave(capturedImages)
    setCapturedImages([])
  }
  
  const handleDeleteImage = (id: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id))
  }
  
  return (
    <div className={cn("h-full flex gap-2", className)}>
      {/* Left Panel - Settings */}
      <div className="w-72 flex flex-col gap-2 flex-shrink-0">
        {/* Camera Settings */}
        <Card className="p-3">
          <h3 className="font-medium text-sm mb-3">Camera Settings</h3>
          
          <div className="space-y-3">
            <CameraSelector 
              onCameraChange={setSelectedCamera}
            />
            
            <QuickResolutionSelector
              deviceId={selectedCamera}
              onResolutionChange={(w, h) => setSelectedResolution({ width: w, height: h })}
            />
          </div>
        </Card>
        
        {/* Capture Controls */}
        <CaptureControls
          onCapture={handleCapture}
          onClear={handleClear}
          onSave={handleSave}
          capturedCount={capturedImages.length}
          isCapturing={isCapturing}
        />
      </div>
      
      {/* Center - Camera Preview */}
      <div className="flex-1 min-w-0">
        <Card className="h-full p-1">
          <CameraPreview
            ref={cameraPreviewRef}
            deviceId={selectedCamera}
            resolution={selectedResolution}
            className="h-full"
          />
        </Card>
      </div>
      
      {/* Right Panel - Captured Images */}
      <div className="w-72 flex-shrink-0">
        <CapturedImages
          images={capturedImages}
          onDelete={handleDeleteImage}
          className="h-full"
        />
      </div>
    </div>
  )
}