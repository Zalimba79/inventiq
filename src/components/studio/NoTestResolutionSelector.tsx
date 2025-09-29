"use client"

import { Maximize2, Zap } from 'lucide-react'
import React, { useState } from 'react'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface NoTestResolutionSelectorProps {
  deviceId: string
  onResolutionChange: (width: number, height: number) => void
  className?: string
}

// Alle gängigen Auflösungen - keine Tests!
const ALL_RESOLUTIONS = [
  { width: 3840, height: 2160, label: '4K (3840×2160)' },
  { width: 2560, height: 1440, label: '2K (2560×1440)' },
  { width: 1920, height: 1080, label: 'Full HD (1920×1080)' },
  { width: 1280, height: 720, label: 'HD (1280×720)' },
  { width: 640, height: 480, label: 'VGA (640×480)' },
]

/**
 * Zero-Test Resolution Selector
 * Absolut KEINE Tests - zeigt einfach alle Optionen
 */
export function NoTestResolutionSelector({ 
  onResolutionChange,
  className 
}: NoTestResolutionSelectorProps): JSX.Element {
  const [selectedResolution, setSelectedResolution] = useState<string>('1920x1080')

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
        <Zap className="h-3 w-3 text-yellow-500" />
      </Label>
      <Select 
        value={selectedResolution} 
        onValueChange={handleResolutionChange}
        defaultValue="1920x1080"
      >
        <SelectTrigger>
          <SelectValue placeholder="Select resolution" />
        </SelectTrigger>
        <SelectContent>
          {ALL_RESOLUTIONS.map(res => {
            const key = `${res.width}x${res.height}`
            return (
              <SelectItem key={key} value={key}>
                {res.label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}