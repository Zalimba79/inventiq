"use client"

import React, { useRef, useCallback, useState, useEffect } from 'react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, RotateCw, X } from 'lucide-react'
import { CameraSettings } from '@/types/capture'
import { cn } from '@/lib/utils'

interface CameraViewProps {
  onCapture: (imageSrc: string) => void
  onClose?: () => void
  settings?: CameraSettings
  className?: string
}

export function CameraView({
  onCapture,
  onClose,
  settings = {
    facingMode: 'environment',
    resolution: { width: 1280, height: 720 }
  },
  className
}: CameraViewProps) {
  const webcamRef = useRef<Webcam>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(settings.facingMode)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
    } catch (error) {
      console.error('Camera permission denied:', error)
      setHasPermission(false)
    } finally {
      setIsLoading(false)
    }
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot({
      width: 800,
      height: 600
    })
    if (imageSrc) {
      onCapture(imageSrc)
    }
  }, [onCapture])

  const toggleCamera = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user')
  }

  const videoConstraints = {
    width: { ideal: settings.resolution.width },
    height: { ideal: settings.resolution.height },
    facingMode: facingMode,
    aspectRatio: settings.aspectRatio || 16/9
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center">
          <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Initializing camera...</p>
        </div>
      </div>
    )
  }

  if (hasPermission === false) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center">
          <CameraOff className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2">Camera Permission Denied</h3>
          <p className="text-muted-foreground mb-4">
            Please enable camera access to capture product photos
          </p>
          <Button onClick={checkCameraPermission}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative h-full flex items-center justify-center bg-black", className)}>
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.7}
        videoConstraints={videoConstraints}
        className="w-full h-full object-contain"
        style={{ maxHeight: '100%', maxWidth: '100%' }}
        onUserMedia={() => setIsLoading(false)}
        onUserMediaError={(error) => {
          console.error('Camera error:', error)
          setHasPermission(false)
          setIsLoading(false)
        }}
      />
      
      {/* Camera controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-center gap-3">
          {/* Switch camera button (only on mobile) */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleCamera}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            <RotateCw className="w-4 h-4" />
          </Button>

          {/* Capture button */}
          <Button
            size="lg"
            onClick={capture}
            className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 text-black"
          >
            <Camera className="w-6 h-6" />
          </Button>

          {/* Close button */}
          {onClose && (
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Grid overlay for composition */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full grid grid-cols-3 grid-rows-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-white/10" />
          ))}
        </div>
      </div>
    </div>
  )
}