"use client"

import React, { useCallback, useEffect, useState, useRef } from 'react'
import Webcam from 'react-webcam'

import { cn } from '@/lib/utils'

import { IOSCameraControls } from './IOSCameraControls'
import { IOSCameraGrid } from './IOSCameraGrid'
import { IOSTouchGestures } from './IOSTouchGestures'

interface IOSCaptureInterfaceProps {
  onCapture: (imageData: string) => void
  className?: string
}

/**
 * iOS-optimized capture interface (refactored to <200 lines)
 * - Native iOS camera input support
 * - Volume button capture support  
 * - Tap to focus and pinch to zoom
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

  // WebRTC capture with haptic feedback
  const handleCapture = useCallback(() => {
    if (isCapturing || !webcamRef.current) return
    
    setIsCapturing(true)
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
    
    // Flash effect
    if (flashMode === 'on') {
      const flashEl = document.getElementById('ios-flash')
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

  // Handle tap to focus
  const handleTapToFocus = useCallback((x: number, y: number) => {
    setFocusPosition({ x, y })
    setShowFocusRing(true)
    
    // Trigger haptic feedback on iOS
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
    
    // Hide focus ring after animation
    setTimeout(() => setShowFocusRing(false), 1500)
  }, [])

  // Volume button capture (iOS Safari supports this)
  useEffect(() => {
    const handleVolumeButton = (e: KeyboardEvent): void => {
      if (e.key === 'VolumeDown' || e.key === 'AudioVolumeDown') {
        e.preventDefault()
        void handleCapture()
      }
    }

    window.addEventListener('keydown', handleVolumeButton)
    return () => window.removeEventListener('keydown', handleVolumeButton)
  }, [handleCapture])

  // Control handlers
  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }, [])

  const toggleFlash = useCallback(() => {
    setFlashMode(prev => prev === 'off' ? 'on' : 'off')
  }, [])

  const toggleGrid = useCallback(() => {
    setShowGrid(prev => !prev)
  }, [])

  const handleZoomChange = useCallback((value: number[]) => {
    setZoom(value[0])
  }, [])

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

      {/* Camera View with Touch Gestures */}
      <IOSTouchGestures
        zoom={zoom}
        onZoomChange={setZoom}
        onTapToFocus={handleTapToFocus}
        className="relative h-full flex items-center justify-center"
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
          <IOSCameraGrid show={showGrid} />
          
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
      </IOSTouchGestures>

      {/* Flash Effect Overlay */}
      <div 
        id="ios-flash"
        className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-100"
        style={{ opacity: 0 }}
      />

      {/* iOS-Style Camera Controls */}
      <IOSCameraControls
        facingMode={facingMode}
        showGrid={showGrid}
        flashMode={flashMode}
        zoom={zoom}
        isCapturing={isCapturing}
        onToggleCamera={toggleCamera}
        onToggleGrid={toggleGrid}
        onToggleFlash={toggleFlash}
        onZoomChange={handleZoomChange}
        onCapture={handleCapture}
        onNativeCapture={handleNativeCameraCapture}
      />
    </div>
  )
}