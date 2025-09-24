"use client"

import { 
  Camera,
  Grid,
  Settings,
  Maximize,
  X
} from 'lucide-react'
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import Webcam from 'react-webcam'

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

interface WebcamCaptureCleanProps {
  onCapture: (imageData: string) => void
  className?: string
}

interface DeviceInfo {
  deviceId: string
  label: string
}

/**
 * Clean, minimalist webcam capture interface
 */
export function WebcamCaptureClean({ 
  onCapture, 
  className 
}: WebcamCaptureCleanProps): JSX.Element {
  const webcamRef = useRef<Webcam>(null)
  const [showGrid, setShowGrid] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>(undefined)
  const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null)
  const [captureCount, setCaptureCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  
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

  // Capture function
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
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        void handleCapture()
      }
      if (e.key === 'g' || e.key === 'G') {
        setShowGrid(prev => !prev)
      }
      if (e.key === 's' || e.key === 'S') {
        setShowSettings(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleCapture])

  return (
    <div className={cn("relative h-full bg-black", className)}>
      {/* Camera View */}
      <div className="relative h-full flex items-center justify-center">
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
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )}

        {/* Capture Flash Effect */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white animate-pulse pointer-events-none" 
               style={{ animationDuration: '300ms' }} />
        )}
      </div>

      {/* Minimal Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          {/* Left: Camera/Resolution (only if settings visible) */}
          {showSettings && (
            <div className="flex items-center gap-2">
              {devices.length > 1 && (
                <Select value={selectedDevice ?? ''} onValueChange={setSelectedDevice}>
                  <SelectTrigger className="w-40 h-8 text-xs bg-black/30 border-white/20 text-white">
                    <SelectValue placeholder="Camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {supportedResolutions.length > 0 && (
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
                  <SelectTrigger className="w-28 h-8 text-xs bg-black/30 border-white/20 text-white">
                    <SelectValue placeholder="Quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedResolutions.map(res => (
                      <SelectItem 
                        key={`${res.width}x${res.height}`} 
                        value={`${res.width}x${res.height}`}
                      >
                        {`${res.label}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Right: Grid and Settings Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGrid(!showGrid)}
              className={cn(
                "h-8 w-8 text-white hover:bg-white/20",
                showGrid && "bg-white/10"
              )}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "h-8 w-8 text-white hover:bg-white/20",
                showSettings && "bg-white/10"
              )}
            >
              {showSettings ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Capture Button - Clean and Centered */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-4">
          {/* Photo Counter */}
          {captureCount > 0 && (
            <div className="text-white/60 text-sm">
              {captureCount} {captureCount === 1 ? 'photo' : 'photos'}
            </div>
          )}
          
          {/* Capture Button */}
          <button
            onClick={handleCapture}
            disabled={isCapturing}
            className={cn(
              "relative w-20 h-20 rounded-full bg-white hover:scale-105",
              "transition-transform duration-200 ease-out",
              "focus:outline-none focus:ring-4 focus:ring-white/30",
              isCapturing && "scale-95"
            )}
          >
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
              <Camera className="h-8 w-8 text-gray-900" />
            </div>
            {/* Ring */}
            <div className="absolute inset-0 rounded-full ring-4 ring-white/50" />
          </button>

          {/* Keyboard Hint */}
          <div className="text-white/40 text-xs">
            Press SPACE to capture
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Legend (bottom right) */}
      <div className="absolute bottom-4 right-4 text-white/40 text-xs space-y-1">
        <div>G - Toggle grid</div>
        <div>S - Settings</div>
      </div>
    </div>
  )
}