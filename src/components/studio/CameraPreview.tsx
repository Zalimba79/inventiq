"use client"

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import Webcam from 'react-webcam'

import { cn } from '@/lib/utils'

interface CameraPreviewProps {
  deviceId: string
  resolution: { width: number; height: number }
  className?: string
  onCapture?: (imageSrc: string) => void
}

export interface CameraPreviewRef {
  capture: () => string | null
}

/**
 * Camera preview component with capture capability
 * Uses react-webcam for camera feed
 * Max lines: ~80
 */
export const CameraPreview = forwardRef<CameraPreviewRef, CameraPreviewProps>(
  ({ deviceId, resolution, className, onCapture }, ref) => {
    const webcamRef = useRef<Webcam>(null)
    
    // Expose capture method to parent
    useImperativeHandle(ref, () => ({
      capture: () => {
        if (webcamRef.current) {
          // Capture with specified resolution
          const imageSrc = webcamRef.current.getScreenshot({
            width: resolution.width,
            height: resolution.height
          })
          if (imageSrc && onCapture) {
            onCapture(imageSrc)
          }
          return imageSrc
        }
        return null
      }
    }))
    
    // Video constraints based on selected device and resolution
    const videoConstraints = {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      width: { ideal: resolution.width },
      height: { ideal: resolution.height },
      facingMode: "user"
    }
    
    return (
      <div className={cn("relative w-full h-full bg-black overflow-hidden", className)}>
        {deviceId ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            width={resolution.width}
            height={resolution.height}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.95}
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
            style={{ objectFit: 'contain' }}
            forceScreenshotSourceSize={true}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a camera to start preview</p>
          </div>
        )}
        
        {/* Resolution indicator overlay */}
        {deviceId && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur px-1.5 py-0.5 rounded text-xs text-white">
            {resolution.width} × {resolution.height}
          </div>
        )}
      </div>
    )
  }
)

CameraPreview.displayName = 'CameraPreview'