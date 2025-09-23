"use client"

import { 
  Camera, 
  FlipHorizontal2, 
  Zap, 
  ZapOff,
  Grid
} from 'lucide-react'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import Webcam from 'react-webcam'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface IOSCaptureInterfaceProps {
  onCapture: (imageData: string) => void
  className?: string
}

/**
 * iOS-optimized capture interface
 * - Native iOS camera input support
 * - Volume button capture support
 * - Tap to focus
 * - Pinch to zoom
 * - Native iOS UI patterns
 */
export function IOSCaptureInterface({ 
  onCapture, 
  className 
}: IOSCaptureInterfaceProps): JSX.Element {
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [showGrid, setShowGrid] = useState(true)
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off')
  const [zoom, setZoom] = useState(1)
  const [isCapturing, setIsCapturing] = useState(false)
  const [showFocusRing, setShowFocusRing] = useState(false)
  const [focusPosition, setFocusPosition] = useState({ x: 50, y: 50 })

  // iOS-specific camera constraints
  const videoConstraints = {
    facingMode,
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    aspectRatio: { ideal: 4/3 }
  }

  // Define handleCapture first, before it's used in useEffect
  const handleCapture = useCallback(() => {
    if (isCapturing || !webcamRef.current) return
    
    setIsCapturing(true)
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
    
    // Simulate flash effect
    if (flashMode === 'on') {
      const flashEl = document.getElementById('camera-flash')
      if (flashEl) {
        flashEl.style.opacity = '1'
        setTimeout(() => {
          flashEl.style.opacity = '0'
        }, 100)
      }
    }
    
    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      onCapture(imageSrc)
    }
    
    setTimeout(() => setIsCapturing(false), 500)
  }, [isCapturing, flashMode, onCapture])

  // Auto-trigger native camera on mount for iOS
  useEffect(() => {
    // Check if running on iOS and auto-open native camera
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
                       !('MSStream' in window) &&
                       /Safari/.test(navigator.userAgent) &&
                       !/Chrome/.test(navigator.userAgent)
    
    if (isIOSSafari) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        if (fileInputRef.current) {
          // Auto-trigger native camera on iOS
          fileInputRef.current.click()
        }
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [])

  // Handle volume button capture (iOS Safari supports this)
  useEffect(() => {
    const handleVolumeButton = (e: KeyboardEvent): void => {
      // Volume down button on iOS triggers capture
      if (e.key === 'VolumeDown' || e.key === 'AudioVolumeDown') {
        e.preventDefault()
        // If we have a preview from native camera, use it
        // Otherwise use WebRTC capture
        void handleCapture()
      }
    }

    window.addEventListener('keydown', handleVolumeButton)
    return () => window.removeEventListener('keydown', handleVolumeButton)
  }, [handleCapture])

  // Handle tap to focus
  const handleTapToFocus = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100
    const y = ((e.touches[0].clientY - rect.top) / rect.height) * 100
    
    setFocusPosition({ x, y })
    setShowFocusRing(true)
    
    // Trigger haptic feedback on iOS
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
    
    // Hide focus ring after animation
    setTimeout(() => setShowFocusRing(false), 1500)
  }, [])

  // Handle pinch to zoom
  useEffect(() => {
    let initialDistance = 0
    let currentZoom = zoom

    const handleTouchStart = (e: TouchEvent): void => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        currentZoom = zoom
      }
    }

    const handleTouchMove = (e: TouchEvent): void => {
      if (e.touches.length === 2 && initialDistance > 0) {
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        const scale = distance / initialDistance
        const newZoom = Math.max(1, Math.min(3, currentZoom * scale))
        setZoom(newZoom)
      }
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [zoom])

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }, [])

  const toggleFlash = useCallback(() => {
    setFlashMode(prev => prev === 'off' ? 'on' : 'off')
  }, [])

  // Handle native iOS camera input
  const handleNativeCameraCapture = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  // Process native camera file
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        onCapture(base64String)
        
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(30)
        }
      }
      reader.readAsDataURL(file)
    }
    // Reset input for next capture
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onCapture])

  return (
    <div className={cn("relative h-full bg-black", className)}>
      {/* Hidden native camera input for iOS */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Native camera capture"
      />

      {/* Camera View */}
      <div 
        className="relative h-full flex items-center justify-center"
        onTouchStart={handleTapToFocus}
      >
        <div 
          className="relative max-w-full max-h-full"
          style={{ transform: `scale(${zoom})` }}
        >
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.95}
            forceScreenshotSourceSize={true}
            videoConstraints={videoConstraints}
            className="w-full h-full object-contain"
          />
          
          {/* Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="grid" width="33.33%" height="33.33%" patternUnits="objectBoundingBox">
                    <path d="M 0.333 0 V 1 M 0.667 0 V 1 M 0 0.333 H 1 M 0 0.667 H 1" 
                          stroke="white" 
                          strokeWidth="0.5" 
                          opacity="0.3" 
                          fill="none" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          )}
          
          {/* Focus Ring */}
          {showFocusRing && (
            <div 
              className="absolute w-16 h-16 border-2 border-yellow-400 rounded-lg pointer-events-none animate-pulse"
              style={{
                left: `${focusPosition.x}%`,
                top: `${focusPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
        </div>
      </div>

      {/* Flash Effect Overlay */}
      <div 
        id="camera-flash"
        className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-100"
        style={{ opacity: 0 }}
      />

      {/* Top Controls - iOS Style */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleFlash}
          className="text-white hover:bg-white/20"
        >
          {flashMode === 'on' ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
        </Button>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowGrid(!showGrid)}
          className="text-white hover:bg-white/20"
        >
          <Grid className="h-5 w-5" />
        </Button>
      </div>

      {/* Bottom Controls - iOS Style */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {/* Camera Switch / Native Camera */}
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleCamera}
            className="text-white hover:bg-white/20"
          >
            <FlipHorizontal2 className="h-6 w-6" />
          </Button>

          {/* Main Capture Button - Opens native camera on iOS */}
          <button
            onClick={handleNativeCameraCapture}
            disabled={isCapturing}
            className={cn(
              "w-20 h-20 rounded-full border-4 border-white bg-white/20 backdrop-blur",
              "active:scale-95 transition-all duration-200",
              "shadow-2xl",
              isCapturing && "opacity-50"
            )}
            aria-label="Capture photo"
          >
            <Camera className="h-8 w-8 text-white mx-auto" />
          </button>

          {/* WebRTC Preview Option (secondary) */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCapture}
            className="text-white hover:bg-white/20"
            title="Use live preview"
          >
            <div className="w-6 h-6 rounded-full border-2 border-white" />
          </Button>
        </div>

        {/* Zoom Slider */}
        {zoom > 1 && (
          <div className="mt-4 px-8">
            <Slider
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
        )}

        {/* iOS Hint */}
        <p className="text-center text-white/60 text-xs mt-4">
          Native iOS camera ready • Tap capture button to start
        </p>
      </div>
    </div>
  )
}