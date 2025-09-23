"use client"

import { Camera, X, Check } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useRef, useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface NativeCameraCaptureProps {
  onCapture: (imageData: string) => void
  onCancel?: () => void
  className?: string
}

/**
 * Native camera capture component
 * Uses device's native camera app for optimal quality
 * Perfect for iOS and Android devices
 */
export function NativeCameraCapture({
  onCapture,
  onCancel,
  className
}: NativeCameraCaptureProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Trigger native camera
  const openNativeCamera = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  // Handle file selection from native camera
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsProcessing(true)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setPreview(base64String)
        setIsProcessing(false)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // Confirm and use the captured image
  const handleConfirm = useCallback(() => {
    if (preview) {
      onCapture(preview)
      setPreview(null)
      
      // Reset input for next capture
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [preview, onCapture])

  // Cancel and retake
  const handleRetake = useCallback(() => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    openNativeCamera()
  }, [openNativeCamera])

  // Cancel entirely
  const handleCancel = useCallback(() => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onCancel?.()
  }, [onCancel])

  return (
    <div className={cn("flex items-center justify-center min-h-screen bg-black", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Native camera input"
      />

      {/* No preview - show camera trigger */}
      {!preview && !isProcessing && (
        <Card className="p-8 m-4 text-center max-w-md">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Camera className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Native Camera Mode</h2>
            <p className="text-muted-foreground">
              Use your device camera app for the best photo quality
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full gap-2"
              onClick={openNativeCamera}
            >
              <Camera className="h-5 w-5" />
              Open Camera
            </Button>

            {onCancel && (
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-900">
            <p className="font-medium mb-1">📱 iOS Users:</p>
            <p>Your iPhone camera will open with all its features</p>
            <p className="font-medium mb-1 mt-3">🤖 Android Users:</p>
            <p>Your default camera app will launch</p>
          </div>
        </Card>
      )}

      {/* Processing */}
      {isProcessing && (
        <Card className="p-8 m-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Processing photo...</p>
        </Card>
      )}

      {/* Preview captured image */}
      {preview && !isProcessing && (
        <div className="relative w-full h-full flex flex-col">
          {/* Preview Image */}
          <div className="flex-1 relative">
            <Image
              src={preview}
              alt="Captured photo"
              fill
              className="object-contain"
            />
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex justify-center gap-4 max-w-sm mx-auto">
              <Button
                size="lg"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 gap-2 bg-white/10 backdrop-blur text-white border-white/30"
              >
                <X className="h-5 w-5" />
                Cancel
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleRetake}
                className="flex-1 gap-2 bg-white/10 backdrop-blur text-white border-white/30"
              >
                <Camera className="h-5 w-5" />
                Retake
              </Button>

              <Button
                size="lg"
                onClick={handleConfirm}
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-5 w-5" />
                Use Photo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Hook to detect if native camera is available and recommended
 */
export function useNativeCameraSupport(): {
  isSupported: boolean
  isRecommended: boolean
  reason: string
} {
  const [support, setSupport] = useState({
    isSupported: false,
    isRecommended: false,
    reason: 'Checking device capabilities...'
  })

  useEffect(() => {
    const checkSupport = (): void => {
      const userAgent = navigator.userAgent
      const isIOS = /iPad|iPhone|iPod/.test(userAgent)
      const isAndroid = /Android/.test(userAgent)
      const isMobile = /Mobi/.test(userAgent)

      if (isIOS) {
        setSupport({
          isSupported: true,
          isRecommended: true,
          reason: 'Native iOS camera provides best quality and features'
        })
      } else if (isAndroid) {
        setSupport({
          isSupported: true,
          isRecommended: true,
          reason: 'Native Android camera app offers optimal performance'
        })
      } else if (isMobile) {
        setSupport({
          isSupported: true,
          isRecommended: false,
          reason: 'Mobile device detected, native camera available'
        })
      } else {
        setSupport({
          isSupported: false,
          isRecommended: false,
          reason: 'Desktop browser - webcam mode recommended'
        })
      }
    }

    checkSupport()
  }, [])

  return support
}