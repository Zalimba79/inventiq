"use client"

import { Camera, Check } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CameraDevice {
  deviceId: string
  label: string
  kind: string
}

interface CameraSelectorProps {
  onCameraChange: (deviceId: string) => void
  className?: string
}

/**
 * Camera selection component
 * Lists all available cameras and allows selection
 * Max lines: ~80
 */
export function CameraSelector({ 
  onCameraChange,
  className 
}: CameraSelectorProps): JSX.Element {
  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [hasPermission, setHasPermission] = useState(false)

  // Get available cameras
  useEffect(() => {
    async function getCameras() {
      try {
        // Try to enumerate devices first (faster if already permitted)
        let devices = await navigator.mediaDevices.enumerateDevices()
        
        // Check if we have permission (devices will have labels if permitted)
        const hasLabels = devices.some(d => d.kind === 'videoinput' && d.label)
        
        if (!hasLabels) {
          // Only request permission if we don't have it yet
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } // Low res for speed
          })
          stream.getTracks().forEach(track => track.stop())
          // Re-enumerate to get labels
          devices = await navigator.mediaDevices.enumerateDevices()
        }
        
        setHasPermission(true)
        const videoDevices = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
            kind: device.kind
          }))
        
        setCameras(videoDevices)
        
        // Select first camera by default
        if (videoDevices.length > 0 && !selectedCamera) {
          setSelectedCamera(videoDevices[0].deviceId)
          onCameraChange(videoDevices[0].deviceId)
        }
      } catch (err) {
        console.error('Failed to get cameras:', err)
        setHasPermission(false)
      }
    }
    
    getCameras()
  }, [])

  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId)
    onCameraChange(deviceId)
  }

  if (!hasPermission) {
    return (
      <Card className={className}>
        <div className="p-4 text-center text-sm text-muted-foreground">
          Camera permission required
        </div>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Label className="flex items-center gap-2 mb-2">
        <Camera className="h-4 w-4" />
        Camera Selection
      </Label>
      <Select value={selectedCamera} onValueChange={handleCameraChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a camera" />
        </SelectTrigger>
        <SelectContent>
          {cameras.map(camera => (
            <SelectItem key={camera.deviceId} value={camera.deviceId}>
              <div className="flex items-center gap-2">
                {selectedCamera === camera.deviceId && (
                  <Check className="h-3 w-3" />
                )}
                {camera.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-1">
        {cameras.length} camera{cameras.length !== 1 ? 's' : ''} available
      </p>
    </div>
  )
}