"use client"

import { Maximize2, Check } from 'lucide-react'
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

interface Resolution {
  width: number
  height: number
  label: string
}

interface ResolutionSelectorProps {
  deviceId: string
  onResolutionChange: (width: number, height: number) => void
  className?: string
}

// Common resolutions to test
const COMMON_RESOLUTIONS: Resolution[] = [
  { width: 3840, height: 2160, label: '4K (3840×2160)' },
  { width: 2560, height: 1440, label: '2K (2560×1440)' },
  { width: 1920, height: 1080, label: 'Full HD (1920×1080)' },
  { width: 1280, height: 720, label: 'HD (1280×720)' },
  { width: 640, height: 480, label: 'VGA (640×480)' },
]

/**
 * Resolution selector component
 * Tests and displays only supported resolutions for selected camera
 * Max lines: ~120
 */
export function ResolutionSelector({ 
  deviceId,
  onResolutionChange,
  className 
}: ResolutionSelectorProps): JSX.Element {
  const [supportedResolutions, setSupportedResolutions] = useState<Resolution[]>([])
  const [selectedResolution, setSelectedResolution] = useState<string>('')
  const [testing, setTesting] = useState(false)

  // Test which resolutions the camera supports - OPTIMIZED VERSION
  useEffect(() => {
    if (!deviceId) return

    async function testResolutions() {
      setTesting(true)
      
      // Test all resolutions in parallel for speed
      const testPromises = COMMON_RESOLUTIONS.map(async (resolution) => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: deviceId },
              width: { ideal: resolution.width },  // Use 'ideal' instead of 'exact'
              height: { ideal: resolution.height }
            }
          })
          
          // Check actual resolution we got
          const track = stream.getVideoTracks()[0]
          const settings = track.getSettings()
          
          // Stop the stream immediately
          stream.getTracks().forEach(track => track.stop())
          
          // Only include if we got the resolution we asked for
          if (settings.width === resolution.width && settings.height === resolution.height) {
            return resolution
          }
          return null
        } catch (err) {
          return null // Resolution not supported
        }
      })
      
      // Wait for all tests to complete
      const results = await Promise.all(testPromises)
      const supported = results.filter(r => r !== null) as Resolution[]
      
      // Sort by resolution (highest first)
      supported.sort((a, b) => (b.width * b.height) - (a.width * a.height))
      
      setSupportedResolutions(supported)
      
      // Select the highest resolution by default
      if (supported.length > 0) {
        const best = supported[0]
        const key = `${best.width}x${best.height}`
        setSelectedResolution(key)
        onResolutionChange(best.width, best.height)
      }
      
      setTesting(false)
    }
    
    testResolutions()
  }, [deviceId])

  const handleResolutionChange = (value: string) => {
    setSelectedResolution(value)
    const [width, height] = value.split('x').map(Number)
    onResolutionChange(width, height)
  }

  if (testing) {
    return (
      <div className={className}>
        <Label className="flex items-center gap-2 mb-2">
          <Maximize2 className="h-4 w-4" />
          Resolution
        </Label>
        <Card className="p-3 text-center text-sm text-muted-foreground">
          Testing camera capabilities...
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <Label className="flex items-center gap-2 mb-2">
        <Maximize2 className="h-4 w-4" />
        Resolution
      </Label>
      <Select value={selectedResolution} onValueChange={handleResolutionChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select resolution" />
        </SelectTrigger>
        <SelectContent>
          {supportedResolutions.map(res => {
            const key = `${res.width}x${res.height}`
            return (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  {selectedResolution === key && (
                    <Check className="h-3 w-3" />
                  )}
                  {res.label}
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-1">
        {supportedResolutions.length} resolution{supportedResolutions.length !== 1 ? 's' : ''} supported
      </p>
    </div>
  )
}