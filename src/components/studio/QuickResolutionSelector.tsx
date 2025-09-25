"use client"

import { Maximize2, Zap } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Resolution {
  width: number
  height: number
  label: string
}

interface QuickResolutionSelectorProps {
  deviceId: string
  onResolutionChange: (width: number, height: number) => void
  className?: string
}

// Common resolutions - we'll show all and let the camera decide
const QUICK_RESOLUTIONS: Resolution[] = [
  { width: 3840, height: 2160, label: '4K (3840×2160)' },
  { width: 2560, height: 1440, label: '2K (2560×1440)' },
  { width: 1920, height: 1080, label: 'Full HD (1920×1080)' },
  { width: 1280, height: 720, label: 'HD (1280×720)' },
  { width: 640, height: 480, label: 'VGA (640×480)' },
]

/**
 * Quick resolution selector - doesn't test, just offers options
 * Much faster but may show unsupported resolutions
 */
export function QuickResolutionSelector({ 
  deviceId,
  onResolutionChange,
  className 
}: QuickResolutionSelectorProps): JSX.Element {
  const [selectedResolution, setSelectedResolution] = useState<string>('1920x1080')
  const [maxResolution, setMaxResolution] = useState<Resolution | null>(null)

  // Quick check for max supported resolution
  useEffect(() => {
    if (!deviceId) return

    async function checkMaxResolution() {
      try {
        // Try to get the highest possible resolution
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 4096 },
            height: { ideal: 2160 }
          }
        })
        
        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities ? track.getCapabilities() : null
        const settings = track.getSettings()
        
        if (capabilities && capabilities.width && capabilities.height) {
          // Use actual max from capabilities
          setMaxResolution({
            width: capabilities.width.max || settings.width || 1920,
            height: capabilities.height.max || settings.height || 1080,
            label: `Max: ${capabilities.width.max}×${capabilities.height.max}`
          })
        } else {
          // Use current settings as fallback
          setMaxResolution({
            width: settings.width || 1920,
            height: settings.height || 1080,
            label: `${settings.width || 1920}×${settings.height || 1080}`
          })
        }
        
        // Set default to Full HD or max if lower
        const settingsWidth = settings.width || 1920
        const settingsHeight = settings.height || 1080
        const defaultRes = settingsWidth >= 1920 ? '1920x1080' : `${settingsWidth}x${settingsHeight}`
        setSelectedResolution(defaultRes)
        onResolutionChange(
          defaultRes === '1920x1080' ? 1920 : settingsWidth,
          defaultRes === '1920x1080' ? 1080 : settingsHeight
        )
        
        stream.getTracks().forEach(track => track.stop())
      } catch (err) {
        console.error('Failed to check max resolution:', err)
        // Default to Full HD
        onResolutionChange(1920, 1080)
      }
    }
    
    checkMaxResolution()
  }, [deviceId])

  const handleResolutionChange = (value: string) => {
    setSelectedResolution(value)
    const [width, height] = value.split('x').map(Number)
    onResolutionChange(width, height)
  }

  // Filter resolutions based on max
  const availableResolutions = QUICK_RESOLUTIONS.filter(res => {
    if (!maxResolution) return true
    return res.width <= maxResolution.width && res.height <= maxResolution.height
  })

  return (
    <div className={className}>
      <Label className="flex items-center gap-2 mb-2">
        <Maximize2 className="h-4 w-4" />
        Resolution
        <Zap className="h-3 w-3 text-yellow-500" />
      </Label>
      <Select value={selectedResolution} onValueChange={handleResolutionChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select resolution" />
        </SelectTrigger>
        <SelectContent>
          {availableResolutions.map(res => {
            const key = `${res.width}x${res.height}`
            return (
              <SelectItem key={key} value={key}>
                {res.label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {maxResolution && (
        <p className="text-xs text-muted-foreground mt-1">
          Max detected: {maxResolution.width}×{maxResolution.height}
        </p>
      )}
    </div>
  )
}