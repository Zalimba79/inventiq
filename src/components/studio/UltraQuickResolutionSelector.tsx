"use client"

import { Maximize2, Zap } from 'lucide-react'
import React, { useState, useEffect } from 'react'

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

interface UltraQuickResolutionSelectorProps {
  deviceId: string
  onResolutionChange: (width: number, height: number) => void
  className?: string
}

// Common resolutions - just offer them all
const QUICK_RESOLUTIONS: Resolution[] = [
  { width: 3840, height: 2160, label: '4K (3840×2160)' },
  { width: 2560, height: 1440, label: '2K (2560×1440)' },
  { width: 1920, height: 1080, label: 'Full HD (1920×1080)' },
  { width: 1280, height: 720, label: 'HD (1280×720)' },
  { width: 640, height: 480, label: 'VGA (640×480)' },
]

/**
 * Ultra quick resolution selector - no testing at all!
 * Just presents options and lets the camera do its best
 */
export function UltraQuickResolutionSelector({ 
  deviceId,
  onResolutionChange,
  className 
}: UltraQuickResolutionSelectorProps): JSX.Element {
  const [selectedResolution, setSelectedResolution] = useState<string>('')

  // Set default resolution only when component mounts or device changes
  useEffect(() => {
    if (!deviceId) return
    
    // Only set if not already set
    if (selectedResolution !== '1920x1080') {
      setSelectedResolution('1920x1080')
      // Use setTimeout to avoid the infinite loop
      setTimeout(() => {
        onResolutionChange(1920, 1080)
      }, 0)
    }
  }, [deviceId]) // Only depend on deviceId

  const handleResolutionChange = (value: string) => {
    setSelectedResolution(value)
    const [width, height] = value.split('x').map(Number)
    onResolutionChange(width, height)
  }

  return (
    <div className={className}>
      <Label className="flex items-center gap-2 mb-2">
        <Maximize2 className="h-4 w-4" />
        Resolution
        <span title="Ultra fast mode">
          <Zap className="h-3 w-3 text-yellow-500" />
        </span>
      </Label>
      <Select value={selectedResolution} onValueChange={handleResolutionChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select resolution" />
        </SelectTrigger>
        <SelectContent>
          {QUICK_RESOLUTIONS.map(res => {
            const key = `${res.width}x${res.height}`
            return (
              <SelectItem key={key} value={key}>
                {res.label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-1">
        Ultra fast mode - no checking
      </p>
    </div>
  )
}