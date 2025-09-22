"use client"

import { Camera, CameraOff, RotateCw, X, Info } from 'lucide-react'
import React, { useRef, useCallback, useState, useEffect, memo } from 'react'
import Webcam from 'react-webcam'

import { usePerformanceEmitter } from '@/components/debug/PerformanceMonitor'
import { Button } from '@/components/ui/button'
import { compressImage, getOptimalImageFormat, PerformanceMonitor } from '@/lib/image-utils'
import { cn } from '@/lib/utils'
import { type CameraSettings } from '@/types/capture'
import type { ExtendedImageCapture, PhotoSettings } from '@/types/image-capture'

interface CameraViewProps {
  onCapture: (imageSrc: string) => void
  onClose?: () => void
  settings?: CameraSettings
  className?: string
  showPreviewOverlay?: boolean
  previewContent?: React.ReactNode
  showGrid?: boolean
}

export const CameraView = memo(({
  onCapture,
  onClose,
  settings = {
    facingMode: 'environment',
    resolution: { width: 800, height: 600 } // Optimized default resolution
  },
  className,
  showPreviewOverlay = false,
  previewContent,
  showGrid = false
}: CameraViewProps) => {
  const webcamRef = useRef<Webcam>(null)
  const captureButtonRef = useRef<HTMLButtonElement>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(settings.facingMode)
  const [isLoading, setIsLoading] = useState(true)
  const [isCapturing, setIsCapturing] = useState(false)
  const [optimalFormat, setOptimalFormat] = useState<'jpeg' | 'webp'>('jpeg')
  const [imageCapture, setImageCapture] = useState<ExtendedImageCapture | null>(null)
  const [isBrio, setIsBrio] = useState(false)
  const [showBrioInfo, setShowBrioInfo] = useState(false)
  const { emitMetrics } = usePerformanceEmitter()

  useEffect(() => {
    const initializeCamera = async (): Promise<void> => {
      try {
        console.log('Starting camera initialization...')
        
        // Detect optimal image format for this device
        const format = await getOptimalImageFormat()
        setOptimalFormat(format)
        console.log('Optimal format detected:', format)
        
        // Check camera permission - just check if we can access it
        // Don't create a stream here as the Webcam component will do it
        try {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const hasVideoInput = devices.some(device => device.kind === 'videoinput')
          
          if (hasVideoInput) {
            console.log('Video input devices found')
            // Try to get permission
            const testStream = await navigator.mediaDevices.getUserMedia({ video: true })
            testStream.getTracks().forEach(track => track.stop()) // Clean up test stream
            console.log('Camera permission granted')
            setHasPermission(true)
          } else {
            console.error('No video input devices found')
            setHasPermission(false)
          }
        } catch (permError) {
          console.error('Camera permission denied:', permError)
          setHasPermission(false)
        }
      } catch (error) {
        console.error('Camera initialization error:', error)
        setHasPermission(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    void initializeCamera()
  }, [])

  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
      return true
    } catch (error) {
      console.error('Camera permission denied:', error)
      setHasPermission(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to capture using ImageCapture API
  const captureWithImageCapture = useCallback(async (): Promise<string | undefined> => {
    if (!imageCapture) return undefined
    
    try {
      PerformanceMonitor.start('capture-phase')
      const photoSettings: PhotoSettings = imageCapture._photoSettings ?? {}
      console.log('📸 Taking photo with settings:', photoSettings)
      
      const blob = await imageCapture.takePhoto(photoSettings)
      const imageSrc = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
      console.log('Photo captured using ImageCapture API (higher quality)')
      
      // Verify captured image dimensions
      const verifyImg = new Image()
      await new Promise<void>((resolve) => {
        verifyImg.onload = () => {
          console.log(`✅ ImageCapture photo dimensions: ${verifyImg.width}x${verifyImg.height}`)
          resolve()
        }
        verifyImg.src = imageSrc
      })
      
      return imageSrc
    } catch (err: unknown) {
      console.log('ImageCapture failed, falling back to canvas:', err)
      setImageCapture(null)
      return undefined
    }
  }, [imageCapture])

  // Helper function to capture using canvas
  const captureWithCanvas = useCallback((): string | undefined => {
    const video = webcamRef.current?.video
    if (!video) return undefined
    
    PerformanceMonitor.start('capture-phase')
    const canvas = document.createElement('canvas')
    const actualWidth = video.videoWidth
    const actualHeight = video.videoHeight
    
    console.log(`📷 Canvas capture at: ${actualWidth}x${actualHeight}`)
    canvas.width = actualWidth
    canvas.height = actualHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
    
    ctx.drawImage(video, 0, 0, actualWidth, actualHeight)
    
    const dataUrl = canvas.toDataURL(
      `image/${optimalFormat}`,
      0.8 // Default quality, since quality is not in CameraSettings
    )
    
    PerformanceMonitor.end('capture-phase')
    console.log(`Canvas capture complete: ${actualWidth}x${actualHeight}`)
    return dataUrl
  }, [optimalFormat])

  const capture = useCallback(async (): Promise<void> => {
    if (isCapturing) return // Prevent double captures
    
    setIsCapturing(true)
    PerformanceMonitor.start('photo-capture')
    
    try {
      // Try ImageCapture API first for better quality
      let imageSrc = await captureWithImageCapture()
      
      // Fallback to canvas capture if ImageCapture failed
      imageSrc ??= captureWithCanvas()
      
      // Only use react-webcam screenshot as last resort
      if (!imageSrc) {
        const screenshot = webcamRef.current?.getScreenshot()
        if (screenshot) {
          imageSrc = screenshot
          console.log('⚠️ Using react-webcam screenshot fallback')
        }
      }
      
      const captureTime = PerformanceMonitor.end('capture-phase')
      
      if (imageSrc) {
        // Processing phase
        PerformanceMonitor.start('processing-phase')
        const originalSize = (imageSrc.length * 3) / 4 // Estimate original size
        
        // Debug: Check image dimensions before compression
        const debugImg = new Image()
        await new Promise<void>((resolve) => {
          debugImg.onload = () => {
            console.log(`📏 Before compression: ${debugImg.width}x${debugImg.height}`)
            resolve()
          }
          debugImg.src = imageSrc!
        })
        
        // Use the actual resolution from settings, not hardcoded values
        console.log(`🎯 Compression settings: maxWidth=${settings.resolution.width}, maxHeight=${settings.resolution.height}`)
        const compressed = await compressImage(imageSrc, {
          maxWidth: settings.resolution.width,
          maxHeight: settings.resolution.height,
          quality: 0.9, // Higher quality for better images
          format: optimalFormat
        })
        console.log(`📐 After compression: ${compressed.width}x${compressed.height}`)
        const processingTime = PerformanceMonitor.end('processing-phase')
        
        // Storage phase
        PerformanceMonitor.start('storage-phase')
        onCapture(compressed.dataUrl)
        const storageTime = PerformanceMonitor.end('storage-phase')
        
        const totalTime = PerformanceMonitor.end('photo-capture')
        
        // Emit performance metrics
        emitMetrics({
          captureTime,
          processingTime,
          storageTime,
          totalTime,
          imageSize: compressed.size,
          compressionRatio: compressed.size / originalSize
        })
      }
    } catch (error) {
      console.error('Failed to capture photo:', error)
      PerformanceMonitor.end('photo-capture')
    } finally {
      setIsCapturing(false)
    }
  }, [onCapture, settings.resolution, optimalFormat, isCapturing, emitMetrics, captureWithImageCapture, captureWithCanvas])

  const toggleCamera = useCallback(() => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user')
  }, [])

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      // Spacebar to capture
      if (e.code === 'Space' && !isCapturing && !showPreviewOverlay) {
        e.preventDefault()
        void capture()
      }
      // Escape to close
      if (e.code === 'Escape' && onClose) {
        e.preventDefault()
        onClose()
      }
      // C key to toggle camera (mobile simulation)
      if (e.code === 'KeyC' && !isCapturing) {
        e.preventDefault()
        toggleCamera()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [capture, isCapturing, showPreviewOverlay, onClose, toggleCamera])

  // Auto-focus capture button when camera is ready
  useEffect(() => {
    if (!isLoading && hasPermission && captureButtonRef.current) {
      captureButtonRef.current.focus()
    }
  }, [isLoading, hasPermission])

  // Determine optimal framerate based on resolution
  // Helper function to setup Logitech Brio specific features
  const setupLogitechBrio = (track: MediaStreamTrack, trackSettings: MediaTrackSettings): void => {
    setIsBrio(true)
    setShowBrioInfo(true)
    console.log('🎯 Logitech Brio detected')
    
    // Check if we got the requested resolution
    if (trackSettings?.width && trackSettings.height) {
      const requestedWidth = settings.resolution.width
      const requestedHeight = settings.resolution.height
      if (trackSettings.width < requestedWidth || trackSettings.height < requestedHeight) {
        console.warn('⚠️ Camera could not provide requested resolution!')
        console.warn('Requested:', requestedWidth, 'x', requestedHeight)
        console.warn('Got:', trackSettings.width, 'x', trackSettings.height)
      }
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowBrioInfo(false)
    }, 5000)
  }

  // Helper function to setup ImageCapture API
  const setupImageCapture = async (track: MediaStreamTrack): Promise<void> => {
    if ('ImageCapture' in window && track.readyState === 'live') {
      try {
        const imgCapture = new window.ImageCapture(track) as ExtendedImageCapture
        setImageCapture(imgCapture)
        console.log('ImageCapture API initialized for enhanced photo quality')
        
        // Check if it's a Logitech MX Brio
        if (track.label.toLowerCase().includes('brio')) {
          console.log('🎯 Logitech MX Brio detected - 4K capabilities available!')
          console.log('Tip: Use 4K resolution in settings for best quality')
        }
        
        // Log photo capabilities
        const photoCapabilities = await imgCapture.getPhotoCapabilities()
        console.log('Photo capabilities:', photoCapabilities)
        
        // Store 4K photo settings if available
        if (photoCapabilities.imageWidth?.max && photoCapabilities.imageWidth.max >= 3840) {
          imgCapture._photoSettings = {
            imageWidth: photoCapabilities.imageWidth.max,
            imageHeight: photoCapabilities.imageHeight?.max
          }
          console.log('4K photo mode available:', imgCapture._photoSettings)
        }
      } catch (err) {
        console.log('Could not initialize ImageCapture:', err)
      }
    }
  }

  const getOptimalFramerate = (): { ideal: number; max: number } => {
    const width = settings.resolution.width
    const height = settings.resolution.height
    
    // 4K: up to 30fps
    if (width >= 3840 || height >= 2160) {
      return { ideal: 30, max: 30 }
    }
    // 1440p: up to 60fps
    if (width >= 2560 || height >= 1440) {
      return { ideal: 60, max: 60 }
    }
    // 1080p: up to 60fps (90fps on some cameras)
    if (width >= 1920 || height >= 1080) {
      return { ideal: 60, max: 90 }
    }
    // 720p and below: up to 90fps
    return { ideal: 60, max: 90 }
  }

  // For 4K, we need to use exact constraints to force the resolution
  const videoConstraints = settings.resolution.width >= 3840 ? {
    width: { exact: settings.resolution.width },
    height: { exact: settings.resolution.height },
    facingMode,
    frameRate: getOptimalFramerate(),
  } : {
    width: { 
      min: settings.resolution.width, 
      ideal: settings.resolution.width,
      max: settings.resolution.width 
    },
    height: { 
      min: settings.resolution.height, 
      ideal: settings.resolution.height,
      max: settings.resolution.height
    },
    facingMode,
    aspectRatio: settings.aspectRatio ?? 16/9,
    frameRate: getOptimalFramerate(),
    resizeMode: 'none' as const, // Prevent browser scaling
  }

  if (isLoading && hasPermission === null) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-black", className)}>
        <div className="text-center">
          <Camera className="w-12 h-12 mx-auto mb-4 text-white animate-pulse" />
          <p className="text-white">Initializing camera...</p>
          <p className="text-white/60 text-sm mt-2">Please allow camera access when prompted</p>
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
          <Button 
            onClick={() => { void checkCameraPermission() }}
            aria-label="Try to enable camera access again"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative h-full flex items-center justify-center bg-black", className)}>
      {/* Video container with grid that matches video size */}
      <div className="relative inline-flex max-w-full max-h-full">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={1.0}
          videoConstraints={videoConstraints}
          className="block max-w-full max-h-full object-contain"
          aria-label="Camera viewfinder"
          role="img"
          forceScreenshotSourceSize={true}
          onUserMedia={(stream) => {
            console.log('Camera stream initialized:', stream)
            setIsLoading(false)
            setHasPermission(true)
            // Get video track for enhanced capture
            const tracks = stream.getVideoTracks()
            if (tracks.length > 0) {
              const track = tracks[0]
              console.log('Camera label:', track.label)
              
              // Log the actual resolution being used
              const trackSettings = track.getSettings()
              console.log('🎥 Actual camera resolution:', trackSettings.width, 'x', trackSettings.height)
              console.log('📐 Requested resolution:', settings.resolution.width, 'x', settings.resolution.height)
              
              // Also check video element dimensions
              setTimeout(() => {
                if (webcamRef.current?.video) {
                  const video = webcamRef.current.video
                  console.log(`📹 Video element dimensions: ${video.videoWidth}x${video.videoHeight}`)
                  console.log(`📺 Video display dimensions: ${video.clientWidth}x${video.clientHeight}`)
                }
              }, 1000) // Wait a second for video to stabilize
              
              // Check if it's a Logitech Brio
              if (track.label?.toLowerCase().includes('brio')) {
                setupLogitechBrio(track, trackSettings)
              }
              
              // Initialize ImageCapture API for better photo quality
              void setupImageCapture(track)
            }
          }}
          onUserMediaError={(error) => {
            console.error('Camera error:', error)
            setHasPermission(false)
            setIsLoading(false)
          }}
        />
        
        {/* Grid overlay - now exactly matches video size */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={`grid-cell-${i}`} className="border border-white/20" />
            ))}
          </div>
        )}
      </div>

      {/* Preview overlay - shown over camera when capturing */}
      {showPreviewOverlay && previewContent && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20 transition-all duration-200">
          {previewContent}
        </div>
      )}


      {/* Logitech Brio Info */}
      {isBrio && showBrioInfo && (
        <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md bg-blue-900/90 backdrop-blur-sm p-4 rounded-lg z-30 border border-blue-400/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-white">
                  Logitech Brio detected
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowBrioInfo(false)}
                  className="h-5 w-5 p-0 text-blue-200 hover:text-white hover:bg-blue-800/50 -mt-1 -mr-1"
                  aria-label="Close info"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-blue-100">
                For advanced camera controls (zoom, field of view, exposure), please use:
              </p>
              <ul className="text-xs text-blue-100 ml-2 space-y-1">
                <li>• <strong>Logi Options+</strong> (recommended)</li>
                <li>• <strong>Logi Tune</strong></li>
              </ul>
              <p className="text-xs text-blue-200 mt-2">
                These tools provide full access to your Brio&apos;s 4K capabilities and advanced features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Camera controls overlay */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-200",
        showPreviewOverlay && "opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center justify-center gap-3">
          {/* Switch camera button (only on mobile) */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleCamera}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 md:hidden min-w-[44px] min-h-[44px]"
            aria-label="Switch between front and back camera (Press C)"
            title="Switch camera"
          >
            <RotateCw className="w-4 h-4" />
          </Button>

          {/* Capture button */}
          <Button
            ref={captureButtonRef}
            size="lg"
            onClick={() => { void capture() }}
            disabled={isCapturing || showPreviewOverlay}
            className={cn(
              "w-16 h-16 min-w-[64px] min-h-[64px] rounded-full bg-white hover:bg-gray-100 text-black transition-transform focus:ring-4 focus:ring-white/50",
              (isCapturing || showPreviewOverlay) && "scale-95 opacity-75"
            )}
            aria-label="Capture photo (Press Spacebar)"
            aria-describedby="capture-help"
            title="Capture photo"
          >
            <Camera className={cn("w-6 h-6", isCapturing && "animate-pulse")} />
            <span className="sr-only">Capture photo</span>
          </Button>

          {/* Close button */}
          {onClose && (
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 min-w-[44px] min-h-[44px]"
              aria-label="Close camera (Press Escape)"
              title="Close camera"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        {/* Screen reader help text */}
        <div id="capture-help" className="sr-only" aria-live="polite">
          Press spacebar or click the capture button to take a photo. Press C to switch cameras. Press Escape to close.
        </div>
      </div>

    </div>
  )
})