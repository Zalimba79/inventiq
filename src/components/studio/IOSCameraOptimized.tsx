"use client"

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Camera, Smartphone, AlertCircle, Info, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface IOSCameraProps {
  onCapture?: (imageSrc: string) => void
  resolution?: { width: number; height: number }
  className?: string
}

export interface IOSCameraRef {
  capture: () => string | null
  switchCamera: () => void
}

/**
 * iOS-optimized Camera Component
 * Implements best practices for iOS Safari/WebView camera access
 * Uses features available through WebRTC on iOS
 */
export const IOSCameraOptimized = forwardRef<IOSCameraRef, IOSCameraProps>(
  ({ onCapture, resolution = { width: 1920, height: 1080 }, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    
    const [isIOS, setIsIOS] = useState(false)
    const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>('environment')
    const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
    const [cameraCapabilities, setCameraCapabilities] = useState<any>(null)
    const [error, setError] = useState<string>('')
    const [isInitializing, setIsInitializing] = useState(true)

    // Detect iOS
    useEffect(() => {
      const ua = navigator.userAgent
      const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || 
                         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      setIsIOS(isIOSDevice)
    }, [])

    // Initialize camera
    useEffect(() => {
      initializeCamera()
      
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }
    }, [currentFacingMode])

    const initializeCamera = async () => {
      setIsInitializing(true)
      setError('')
      
      try {
        // Stop existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }

        // Check for multiple cameras
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(d => d.kind === 'videoinput')
        setHasMultipleCameras(videoDevices.length > 1)

        // iOS-optimized constraints
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: currentFacingMode,
            width: { 
              min: 640,
              ideal: resolution.width,
              max: 3840
            },
            height: { 
              min: 480,
              ideal: resolution.height,
              max: 2160
            },
            // iOS-specific optimizations
            aspectRatio: { ideal: 16/9 },
            frameRate: { ideal: 30, max: 60 }
          },
          audio: false
        }

        // Special handling for iOS
        if (isIOS) {
          // iOS prefers exact facingMode
          constraints.video = {
            ...constraints.video,
            facingMode: { exact: currentFacingMode }
          } as MediaTrackConstraints
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          
          // iOS-specific attributes
          if (isIOS) {
            videoRef.current.setAttribute('playsinline', 'true')
            videoRef.current.setAttribute('webkit-playsinline', 'true')
            videoRef.current.setAttribute('x5-playsinline', 'true')
            videoRef.current.setAttribute('x5-video-player-type', 'h5')
            videoRef.current.setAttribute('x5-video-player-fullscreen', 'false')
          }

          // Get capabilities
          const track = stream.getVideoTracks()[0]
          if (track.getCapabilities) {
            const caps = track.getCapabilities()
            setCameraCapabilities(caps)
          }

          // Ensure video plays
          await videoRef.current.play()
        }

      } catch (err: any) {
        console.error('Camera initialization error:', err)
        setError(err.message || 'Failed to access camera')
        
        // Fallback for iOS permission issues
        if (isIOS && err.name === 'NotAllowedError') {
          setError('Camera access denied. Please enable camera in Settings > Safari > Camera')
        }
      } finally {
        setIsInitializing(false)
      }
    }

    // Capture image
    const capture = (): string | null => {
      if (!videoRef.current || !canvasRef.current) return null

      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (!context) return null

      // Set canvas size to match video
      canvas.width = video.videoWidth || resolution.width
      canvas.height = video.videoHeight || resolution.height

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to base64
      const imageSrc = canvas.toDataURL('image/jpeg', 0.95)
      
      if (onCapture) {
        onCapture(imageSrc)
      }

      // iOS haptic feedback (if available)
      if (isIOS && 'vibrate' in navigator) {
        navigator.vibrate(50)
      }

      return imageSrc
    }

    // Switch between front/back camera
    const switchCamera = () => {
      setCurrentFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    }

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      capture,
      switchCamera
    }))

    return (
      <div className={cn("relative w-full h-full bg-black", className)}>
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ 
            objectFit: 'contain',
            transform: currentFacingMode === 'user' ? 'scaleX(-1)' : 'none'
          }}
        />

        {/* Hidden canvas for capture */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* iOS indicator */}
        {isIOS && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs text-white">
            <Smartphone className="h-3 w-3" />
            iOS Mode
          </div>
        )}

        {/* Camera info overlay */}
        {cameraCapabilities && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs text-white">
            {videoRef.current?.videoWidth} × {videoRef.current?.videoHeight}
            {cameraCapabilities.facingMode && ` • ${currentFacingMode}`}
          </div>
        )}

        {/* Camera switch button (if multiple cameras) */}
        {hasMultipleCameras && !isInitializing && (
          <Button
            onClick={switchCamera}
            size="sm"
            className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30"
          >
            <Camera className="h-5 w-5" />
          </Button>
        )}

        {/* Loading state */}
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-sm">Initializing camera...</div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4">
            <Card className="p-4 max-w-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Camera Access Error</p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                  {isIOS && (
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="font-medium">iOS Camera Tips:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Use Safari for best compatibility</li>
                        <li>Check Settings → Safari → Camera</li>
                        <li>Allow camera for this website</li>
                        <li>Reload page after granting permission</li>
                      </ul>
                    </div>
                  )}
                  <Button
                    onClick={initializeCamera}
                    size="sm"
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* iOS-specific features info */}
        {isIOS && !error && !isInitializing && (
          <div className="absolute bottom-4 left-4 max-w-xs">
            <Card className="bg-black/70 backdrop-blur border-white/20 p-2">
              <div className="flex items-start gap-2">
                <Info className="h-3 w-3 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-[10px] text-white/80 space-y-1">
                  <p className="font-medium text-white">iOS Camera Features:</p>
                  <ul className="space-y-0.5">
                    <li>• {hasMultipleCameras ? 'Multiple cameras detected' : 'Single camera'}</li>
                    <li>• Tap capture button to take photo</li>
                    <li>• {currentFacingMode === 'user' ? 'Front' : 'Back'} camera active</li>
                    {hasMultipleCameras && <li>• Tap camera icon to switch</li>}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    )
  }
)

IOSCameraOptimized.displayName = 'IOSCameraOptimized'