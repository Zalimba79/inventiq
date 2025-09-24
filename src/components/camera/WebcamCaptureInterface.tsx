"use client"

import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import Webcam from 'react-webcam'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useCameraCapabilities, getBestSupportedResolution, type Resolution } from '@/hooks/camera/useCameraCapabilities'
import { cn } from '@/lib/utils'

import { WebcamControls } from './WebcamControls'
import { WebcamGrid } from './WebcamGrid'

interface WebcamCaptureInterfaceProps {
  onCapture: (imageData: string) => void
  className?: string
}

interface DeviceInfo {
  deviceId: string
  label: string
}

/**
 * Desktop/Webcam optimized capture interface (refactored to <200 lines)
 * - Multiple camera support with device selection
 * - Keyboard shortcuts (Space = capture)
 * - High resolution options
 * - Desktop-friendly controls
 */
export function WebcamCaptureInterface({ 
  onCapture, 
  className 
}: WebcamCaptureInterfaceProps): JSX.Element {
  const webcamRef = useRef<Webcam>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [isCapturing, setIsCapturing] = useState(false)
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>(undefined)
  const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null)
  const [captureCount, setCaptureCount] = useState(0)
  
  // Get camera capabilities
  const { cameras, isLoading: isLoadingCameras } = useCameraCapabilities()

  // Get supported resolutions for selected camera
  const currentCamera = cameras.find(cam => cam.deviceId === selectedDevice)
  const supportedResolutions = useMemo(
    () => currentCamera?.supportedResolutions ?? [],
    [currentCamera]
  )

  // Update selected resolution when camera changes
  useEffect(() => {
    if (currentCamera && supportedResolutions.length > 0) {
      const preferred = getBestSupportedResolution(supportedResolutions, 1920, 1080)
      setSelectedResolution(preferred)
    }
  }, [currentCamera, supportedResolutions])

  // Video constraints
  const videoConstraints = {
    deviceId: selectedDevice ?? undefined,
    width: selectedResolution?.width ?? 1920,
    height: selectedResolution?.height ?? 1080,
    facingMode: 'user' // Desktop default
  }

  // Load available devices
  useEffect(() => {
    const loadDevices = async (): Promise<void> => {
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = mediaDevices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 8)}`
          }))
        
        setDevices(videoDevices)
        if (videoDevices.length > 0 && !selectedDevice) {
          setSelectedDevice(videoDevices[0].deviceId)
        }
      } catch (error) {
        console.error('Failed to load camera devices:', error)
      }
    }

    void loadDevices()
  }, [selectedDevice])

  // Capture handler
  const handleCapture = useCallback(() => {
    if (isCapturing || !webcamRef.current) return
    
    setIsCapturing(true)
    
    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      onCapture(imageSrc)
      setCaptureCount(prev => prev + 1)
    }
    
    setTimeout(() => setIsCapturing(false), 300)
  }, [isCapturing, onCapture])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        void handleCapture()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleCapture])

  // Control handlers
  const handleDeviceChange = useCallback((deviceId: string) => {
    setSelectedDevice(deviceId)
  }, [])

  const handleResolutionChange = useCallback((resolution: Resolution) => {
    setSelectedResolution(resolution)
  }, [])

  const toggleGrid = useCallback(() => {
    setShowGrid(prev => !prev)
  }, [])

  // Error state
  if (!isLoadingCameras && devices.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No cameras detected. Please check your camera permissions and try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={cn("relative h-full bg-black", className)}>
      {/* Webcam Preview */}
      <div className="relative h-full">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.9}
          forceScreenshotSourceSize={true}
          videoConstraints={videoConstraints}
          className="w-full h-full object-contain"
          onUserMediaError={(error) => {
            console.error('Webcam error:', error)
          }}
        />
        
        {/* Grid Overlay */}
        <WebcamGrid show={showGrid} />
      </div>

      {/* Controls */}
      <WebcamControls
        devices={devices}
        selectedDevice={selectedDevice}
        supportedResolutions={supportedResolutions}
        selectedResolution={selectedResolution}
        showGrid={showGrid}
        isCapturing={isCapturing}
        captureCount={captureCount}
        isLoadingCameras={isLoadingCameras}
        onDeviceChange={handleDeviceChange}
        onResolutionChange={handleResolutionChange}
        onToggleGrid={toggleGrid}
        onCapture={handleCapture}
      />
    </div>
  )
}