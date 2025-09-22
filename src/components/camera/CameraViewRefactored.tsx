"use client"

import React, { useEffect } from 'react'

import { cn } from '@/lib/utils'

import { CameraControlsUI } from './CameraControlsUi'
import { CameraPreview } from './CameraPreview'
import { CameraProvider, useCameraContext } from './CameraProvider'

interface CameraViewRefactoredProps {
  onCapture: (imageSrc: string) => void
  onClose?: () => void
  className?: string
  showGrid?: boolean
  facingMode?: 'user' | 'environment'
  resolution?: { width: number; height: number }
}

// Inner component that uses the camera context
function CameraViewContent({ 
  onCapture, 
  onClose, 
  className,
  showGrid = false 
}: Omit<CameraViewRefactoredProps, 'facingMode' | 'resolution'>): JSX.Element {
  const { stream, camera } = useCameraContext()

  // Start stream on mount
  useEffect(() => {
    void stream.startStream()
    
    return () => {
      stream.stopStream()
    }
  }, [stream])

  const handleCapture = async (): Promise<void> => {
    if (stream.stream) {
      try {
        const imageData = await camera.capturePhoto(stream.stream, {
          quality: 0.9,
          format: 'jpeg'
        })
        onCapture(imageData)
      } catch (error) {
        console.error('Failed to capture photo:', error)
      }
    }
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Camera preview takes most of the space */}
      <div className="flex-1 relative">
        <CameraPreview
          stream={stream.stream}
          className="h-full"
          showGrid={showGrid}
          mirrored={stream.facingMode === 'user'}
        />
      </div>
      
      {/* Controls at the bottom */}
      <div className="p-4 bg-background/80 backdrop-blur">
        <CameraControlsUI
          hasPermission={stream.hasPermission}
          isLoading={stream.isLoading}
          isCapturing={camera.isCapturing}
          facingMode={stream.facingMode}
          onCapture={() => void handleCapture()}
          onSwitchCamera={() => void stream.switchCamera()}
          onClose={onClose}
        />
      </div>
      
      {/* Error display */}
      {stream.error && (
        <div className="absolute top-4 left-4 right-4 bg-destructive/90 text-destructive-foreground p-3 rounded-lg">
          {stream.error}
        </div>
      )}
    </div>
  )
}

// Main component that provides the camera context
export function CameraViewRefactored({ 
  facingMode = 'environment',
  resolution = { width: 1280, height: 720 },
  ...props 
}: CameraViewRefactoredProps): JSX.Element {
  return (
    <CameraProvider
      options={{
        facingMode,
        resolution,
        video: true,
        audio: false
      }}
    >
      <CameraViewContent {...props} />
    </CameraProvider>
  )
}