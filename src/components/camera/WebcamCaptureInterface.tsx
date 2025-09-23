"use client"

import { 
  Camera,
  Grid,
  Monitor,
  Maximize,
  Info,
  AlertCircle
} from 'lucide-react'
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import Webcam from 'react-webcam'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCameraCapabilities, getBestSupportedResolution, type Resolution } from '@/hooks/camera/useCameraCapabilities'
import { cn } from '@/lib/utils'

interface WebcamCaptureInterfaceProps {
  onCapture: (imageData: string) => void
  className?: string
}

interface DeviceInfo {
  deviceId: string
  label: string
}

/**
 * Desktop/Webcam optimized capture interface
 * - Multiple camera support
 * - Keyboard shortcuts
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
      // Try to find a 1080p resolution, or use the best available
      const preferred = getBestSupportedResolution(
        supportedResolutions,
        1920,
        1080
      )
      setSelectedResolution(preferred)
    }
  }, [currentCamera, supportedResolutions])

  const videoConstraints = {
    deviceId: selectedDevice ?? undefined,
    width: selectedResolution?.width ?? 1920,
    height: selectedResolution?.height ?? 1080,
    aspectRatio: 16/9
  }

  // Load available cameras
  useEffect(() => {
    const loadDevices = async (): Promise<void> => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = deviceList
          .filter(device => device.kind === 'videoinput' && device.deviceId)
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 5)}`
          }))
        
        setDevices(videoDevices)
        if (videoDevices.length > 0 && !selectedDevice) {
          setSelectedDevice(videoDevices[0].deviceId)
        }
      } catch (error) {
        console.error('Error enumerating devices:', error)
      }
    }

    void loadDevices()
  }, [])

  // Capture function (defined before use)
  const handleCapture = useCallback(() => {
    if (isCapturing || !webcamRef.current) return
    
    setIsCapturing(true)
    
    // Add capture animation
    const video = webcamRef.current.video
    if (video) {
      video.style.filter = 'brightness(1.5)'
      setTimeout(() => {
        video.style.filter = 'brightness(1)'
      }, 100)
    }
    
    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      onCapture(imageSrc)
      setCaptureCount(prev => prev + 1)
    }
    
    setTimeout(() => setIsCapturing(false), 500)
  }, [isCapturing, onCapture])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      // Spacebar or Enter to capture
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        void handleCapture()
      }
      // G to toggle grid
      if (e.key === 'g' || e.key === 'G') {
        setShowGrid(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleCapture])


  return (
    <div className={cn("flex h-full bg-gray-50", className)}>
      {/* Main Camera View */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        <div className="relative max-w-full max-h-full">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.95}
            forceScreenshotSourceSize={true}
            videoConstraints={videoConstraints}
            className="w-full h-full object-contain"
            style={{ maxHeight: '80vh' }}
          />
          
          {/* Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="desktop-grid" width="10%" height="10%" patternUnits="objectBoundingBox">
                    <path d="M 0.1 0 V 1 M 0.2 0 V 1 M 0.3 0 V 1 M 0.4 0 V 1 M 0.5 0 V 1 M 0.6 0 V 1 M 0.7 0 V 1 M 0.8 0 V 1 M 0.9 0 V 1" 
                          stroke="rgba(255,255,255,0.2)" 
                          strokeWidth="0.5" 
                          fill="none" />
                    <path d="M 0 0.1 H 1 M 0 0.2 H 1 M 0 0.3 H 1 M 0 0.4 H 1 M 0 0.5 H 1 M 0 0.6 H 1 M 0 0.7 H 1 M 0 0.8 H 1 M 0 0.9 H 1" 
                          stroke="rgba(255,255,255,0.2)" 
                          strokeWidth="0.5" 
                          fill="none" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#desktop-grid)" />
              </svg>
            </div>
          )}

          {/* Capture Counter */}
          {captureCount > 0 && (
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">
                {captureCount} captured
              </span>
            </div>
          )}
        </div>

        {/* Keyboard Hints */}
        <div className="absolute bottom-4 left-4 text-white/60 text-sm space-y-1">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Space</kbd>
            <span>Capture</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">G</kbd>
            <span>Toggle Grid</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">S</kbd>
            <span>Grid</span>
          </div>
        </div>
      </div>

      {/* Side Panel Controls */}
      <div className="w-80 bg-white border-l p-6 space-y-6">
        {/* Camera Selection */}
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Camera Device
          </h3>
          <Select value={selectedDevice ?? ''} onValueChange={setSelectedDevice}>
            <SelectTrigger>
              <SelectValue placeholder="Select camera" />
            </SelectTrigger>
            <SelectContent>
              {devices.map(device => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Resolution Settings */}
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Maximize className="h-4 w-4" />
            Resolution
          </h3>
          {supportedResolutions.length > 0 ? (
            <Select 
              value={selectedResolution ? `${selectedResolution.width}x${selectedResolution.height}` : ''}
              onValueChange={(value) => {
                const [width, height] = value.split('x').map(Number)
                const resolution = supportedResolutions.find(
                  r => r.width === width && r.height === height
                )
                if (resolution) {
                  setSelectedResolution(resolution)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                {supportedResolutions.map(res => (
                  <SelectItem 
                    key={`${res.width}x${res.height}`} 
                    value={`${res.width}x${res.height}`}
                  >
                    {`${res.label} (${res.width}×${res.height})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-muted-foreground">
              {isLoadingCameras ? 'Loading...' : 'No camera selected'}
            </div>
          )}
          
          {/* Show warning if 4K is not supported but was expected */}
          {currentCamera && !supportedResolutions.some(r => r.width >= 3840) && (
            <Alert className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This camera does not support 4K resolution. Maximum: {currentCamera.maxResolution?.label}
              </AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Grid Toggle */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              <span className="text-sm font-medium">Grid Overlay</span>
            </div>
            <Button
              size="sm"
              variant={showGrid ? "default" : "outline"}
              onClick={() => setShowGrid(!showGrid)}
            >
              {showGrid ? "ON" : "OFF"}
            </Button>
          </div>
        </Card>

        {/* Capture Button */}
        <Button
          size="lg"
          className="w-full h-14 text-lg"
          onClick={handleCapture}
          disabled={isCapturing}
        >
          <Camera className="h-6 w-6 mr-2" />
          {isCapturing ? "Capturing..." : "Capture Photo"}
        </Button>

        {/* Current Resolution Info */}
        {selectedResolution && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-sm">
              <div className="font-medium text-green-900 mb-1">Active Resolution</div>
              <div className="text-xs text-green-700">
                {selectedResolution.label}: {selectedResolution.width} × {selectedResolution.height}px
              </div>
            </div>
          </Card>
        )}

        {/* Info Section */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-2">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 space-y-1">
              <p>For best results:</p>
              <ul className="list-disc list-inside text-xs space-y-0.5 ml-2">
                <li>Ensure good lighting</li>
                <li>Keep products centered</li>
                <li>Avoid reflections</li>
                <li>Use a neutral background</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}