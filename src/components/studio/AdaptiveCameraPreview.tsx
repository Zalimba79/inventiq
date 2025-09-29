"use client"

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import Webcam from 'react-webcam'

import { cn } from '@/lib/utils'
import { IOSCameraOptimized, type IOSCameraRef } from './IOSCameraOptimized'

interface AdaptiveCameraPreviewProps {
  deviceId?: string
  resolution: { width: number; height: number }
  className?: string
  onCapture?: (imageSrc: string) => void
  zoomLevel?: number
}

export interface AdaptiveCameraRef {
  capture: () => string | null
  switchCamera?: () => void
}

/**
 * Adaptive Camera Preview
 * Automatically selects the best camera implementation based on device
 * - iOS devices: Uses IOSCameraOptimized with native optimizations
 * - Other devices: Uses react-webcam with full WebRTC support
 */
export const AdaptiveCameraPreview = forwardRef<AdaptiveCameraRef, AdaptiveCameraPreviewProps>(
  ({ deviceId, resolution, className, onCapture, zoomLevel = 100 }, ref) => {
    const webcamRef = useRef<Webcam>(null)
    const iosCameraRef = useRef<IOSCameraRef>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isIOS, setIsIOS] = useState(false)
    const [deviceCapabilities, setDeviceCapabilities] = useState<string>('')

    // Detect device type
    useEffect(() => {
      const ua = navigator.userAgent
      const platform = navigator.platform
      
      const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || 
                         (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      
      setIsIOS(isIOSDevice)
      
      // Set device capabilities string
      if (isIOSDevice) {
        const isIPad = /iPad/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
        const isIPhone = /iPhone/.test(ua)
        const browser = /CriOS/.test(ua) ? 'Chrome' : 
                       /FxiOS/.test(ua) ? 'Firefox' : 
                       /Safari/.test(ua) ? 'Safari' : 'Unknown'
        
        setDeviceCapabilities(`${isIPad ? 'iPad' : isIPhone ? 'iPhone' : 'iOS'} • ${browser}`)
      } else {
        const isAndroid = /Android/.test(ua)
        const isDesktop = !(/Mobile|Android/.test(ua))
        
        setDeviceCapabilities(
          isAndroid ? 'Android' : 
          isDesktop ? 'Desktop' : 
          'Mobile'
        )
      }
    }, [])

    // Expose capture method to parent with zoom support
    useImperativeHandle(ref, () => ({
      capture: () => {
        if (isIOS && iosCameraRef.current) {
          // TODO: Add zoom support for iOS
          return iosCameraRef.current.capture()
        } else if (webcamRef.current) {
          // Apply digital zoom during capture
          if (zoomLevel > 100 && canvasRef.current) {
            const video = webcamRef.current.video
            if (!video) return null
            
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (!ctx) return null
            
            // Calculate zoom crop area
            const zoomFactor = zoomLevel / 100
            const sourceWidth = video.videoWidth
            const sourceHeight = video.videoHeight
            const cropWidth = sourceWidth / zoomFactor
            const cropHeight = sourceHeight / zoomFactor
            const cropX = (sourceWidth - cropWidth) / 2
            const cropY = (sourceHeight - cropHeight) / 2
            
            // Set canvas size to desired output resolution
            canvas.width = resolution.width
            canvas.height = resolution.height
            
            // Draw zoomed image to canvas
            ctx.drawImage(
              video,
              cropX, cropY, cropWidth, cropHeight, // Source (cropped area)
              0, 0, canvas.width, canvas.height    // Destination (full canvas)
            )
            
            // Convert to data URL
            const imageSrc = canvas.toDataURL('image/jpeg', 0.95)
            if (imageSrc && onCapture) {
              onCapture(imageSrc)
            }
            return imageSrc
          } else {
            // No zoom, capture normally
            const imageSrc = webcamRef.current.getScreenshot({
              width: resolution.width,
              height: resolution.height
            })
            if (imageSrc && onCapture) {
              onCapture(imageSrc)
            }
            return imageSrc
          }
        }
        return null
      },
      switchCamera: () => {
        if (isIOS && iosCameraRef.current) {
          iosCameraRef.current.switchCamera()
        }
      }
    }))

    // Render iOS-optimized camera for iOS devices
    if (isIOS) {
      return (
        <div className={cn("relative w-full h-full", className)}>
          <IOSCameraOptimized
            ref={iosCameraRef}
            resolution={resolution}
            onCapture={onCapture}
            className="w-full h-full"
          />
          {deviceCapabilities && (
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs text-white z-10">
              {deviceCapabilities}
            </div>
          )}
        </div>
      )
    }

    // Standard webcam for non-iOS devices
    const videoConstraints = {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      width: { ideal: resolution.width },
      height: { ideal: resolution.height },
      facingMode: deviceId ? undefined : "environment"
    }

    // Calculate zoom transform
    const zoomTransform = zoomLevel > 100 ? `scale(${zoomLevel / 100})` : undefined

    return (
      <div className={cn("relative w-full h-full bg-black overflow-hidden", className)}>
        {/* Hidden canvas for zoom capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {deviceId || !deviceId ? (
          <div className="w-full h-full relative overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              width={resolution.width}
              height={resolution.height}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.95}
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ 
                objectFit: 'contain',
                transform: zoomTransform,
                transformOrigin: 'center'
              }}
              forceScreenshotSourceSize={true}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a camera to start preview</p>
          </div>
        )}
        
        {/* Device info overlay */}
        {deviceCapabilities && deviceId && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs text-white">
            {deviceCapabilities}
          </div>
        )}
        
        {/* Resolution indicator overlay */}
        {deviceId && (
          <div className="absolute top-2 right-2 flex gap-2">
            <div className="bg-black/70 backdrop-blur px-1.5 py-0.5 rounded text-xs text-white">
              {resolution.width} × {resolution.height}
            </div>
            {zoomLevel > 100 && (
              <div className="bg-primary/80 backdrop-blur px-1.5 py-0.5 rounded text-xs text-white">
                {(zoomLevel / 100).toFixed(1)}x Zoom
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)

AdaptiveCameraPreview.displayName = 'AdaptiveCameraPreview'