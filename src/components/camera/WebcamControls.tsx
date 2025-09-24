"use client"

import { Camera, Grid, Monitor, Maximize, Info } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Resolution {
  width: number
  height: number
  label: string
}

interface DeviceInfo {
  deviceId: string
  label: string
}

interface WebcamControlsProps {
  devices: DeviceInfo[]
  selectedDevice?: string
  supportedResolutions: Resolution[]
  selectedResolution: Resolution | null
  showGrid: boolean
  isCapturing: boolean
  captureCount: number
  isLoadingCameras: boolean
  onDeviceChange: (deviceId: string) => void
  onResolutionChange: (resolution: Resolution) => void
  onToggleGrid: () => void
  onCapture: () => void
}

/**
 * Desktop/Webcam controls with device and resolution selection
 */
export function WebcamControls({
  devices,
  selectedDevice,
  supportedResolutions,
  selectedResolution,
  showGrid,
  isCapturing,
  captureCount,
  isLoadingCameras,
  onDeviceChange,
  onResolutionChange,
  onToggleGrid,
  onCapture
}: WebcamControlsProps): JSX.Element {
  return (
    <>
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 bg-black/50 p-3 rounded-lg backdrop-blur">
        <div className="flex items-center gap-3">
          {/* Camera Selection */}
          {!isLoadingCameras && devices.length > 1 && (
            <Select value={selectedDevice} onValueChange={onDeviceChange}>
              <SelectTrigger className="w-48 text-white bg-black/50 border-gray-600">
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      {device.label || 'Camera'}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Resolution Selection */}
          {supportedResolutions.length > 1 && (
            <Select 
              value={selectedResolution ? `${selectedResolution.width}x${selectedResolution.height}` : undefined}
              onValueChange={(value) => {
                const [width, height] = value.split('x').map(Number)
                const resolution = supportedResolutions.find(r => r.width === width && r.height === height)
                if (resolution) onResolutionChange(resolution)
              }}
            >
              <SelectTrigger className="w-32 text-white bg-black/50 border-gray-600">
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                {supportedResolutions.map((resolution) => (
                  <SelectItem 
                    key={`${resolution.width}x${resolution.height}`} 
                    value={`${resolution.width}x${resolution.height}`}
                  >
                    <div className="flex items-center gap-2">
                      <Maximize className="h-4 w-4" />
                      {resolution.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Grid Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleGrid}
            className="text-white hover:bg-white/20"
          >
            <Grid className={`h-4 w-4 ${showGrid ? 'text-yellow-400' : 'text-white'}`} />
          </Button>

          {/* Info */}
          <div className="text-white text-xs">
            Photos: {captureCount}
          </div>
        </div>
      </div>

      {/* Bottom Capture Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-6">
          {/* Capture Count */}
          <div className="text-white text-sm font-mono">
            #{captureCount + 1}
          </div>

          {/* Main Capture Button */}
          <Button
            onClick={onCapture}
            disabled={isCapturing}
            className={`
              w-20 h-20 rounded-full bg-white/90 hover:bg-white 
              border-4 border-white/50 transition-all duration-200
              ${isCapturing ? 'scale-95 bg-white/50' : 'active:scale-95'}
            `}
          >
            <Camera className="h-8 w-8 text-gray-900" />
          </Button>

          {/* Keyboard Hint */}
          <div className="text-white/60 text-xs">
            Space
          </div>
        </div>
      </div>

      {/* Capture Animation */}
      {isCapturing && (
        <div className="absolute inset-0 bg-white/20 animate-pulse z-10 pointer-events-none" />
      )}
    </>
  )
}