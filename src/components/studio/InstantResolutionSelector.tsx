"use client"

import { Maximize2, Zap } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'

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
  priority: number // für schnelle Vorauswahl
}

interface InstantResolutionSelectorProps {
  deviceId: string
  onResolutionChange: (width: number, height: number) => void
  className?: string
}

// Resolutions mit Priorität - höhere Priorität = wahrscheinlicher unterstützt
const INSTANT_RESOLUTIONS: Resolution[] = [
  { width: 1920, height: 1080, label: 'Full HD (1920×1080)', priority: 100 }, // Fast immer unterstützt
  { width: 1280, height: 720, label: 'HD (1280×720)', priority: 95 },
  { width: 640, height: 480, label: 'VGA (640×480)', priority: 90 },
  { width: 2560, height: 1440, label: '2K (2560×1440)', priority: 50 },
  { width: 3840, height: 2160, label: '4K (3840×2160)', priority: 30 },
]

/**
 * Instant resolution selector - KEINE Verzögerung, KEINE Tests
 * Setzt sofort Full HD als Standard und zeigt alle Optionen
 */
export function InstantResolutionSelector({ 
  deviceId,
  onResolutionChange,
  className 
}: InstantResolutionSelectorProps): JSX.Element {
  const [selectedResolution, setSelectedResolution] = useState<string>('1920x1080')
  const [availableResolutions, setAvailableResolutions] = useState<Resolution[]>(INSTANT_RESOLUTIONS)
  const hasInitialized = useRef(false)
  const testingRef = useRef(false)

  // Sofort beim Mount Full HD setzen - KEINE Verzögerung
  useEffect(() => {
    if (!hasInitialized.current && deviceId) {
      hasInitialized.current = true
      // Sofort Full HD setzen
      onResolutionChange(1920, 1080)
      
      // Parallel im Hintergrund testen welche Auflösungen wirklich funktionieren
      // Das blockiert NICHT die UI und updated nur die verfügbaren Optionen
      testResolutionsInBackground(deviceId)
    }
  }, [deviceId, onResolutionChange])

  // Hintergrund-Test für bessere UX (läuft parallel, blockiert nichts)
  const testResolutionsInBackground = async (deviceId: string) => {
    if (testingRef.current) return
    testingRef.current = true

    try {
      // Teste alle Auflösungen PARALLEL für maximale Geschwindigkeit
      const tests = INSTANT_RESOLUTIONS.map(async (res) => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: deviceId },
              width: { exact: res.width },
              height: { exact: res.height }
            }
          })
          
          // Stream sofort stoppen
          stream.getTracks().forEach(track => track.stop())
          
          return { ...res, supported: true }
        } catch {
          // Diese Auflösung wird nicht unterstützt
          return { ...res, supported: false }
        }
      })

      // Warte auf ALLE Tests gleichzeitig (parallel)
      const results = await Promise.all(tests)
      
      // Update nur die unterstützten Auflösungen
      const supported = results
        .filter(r => r.supported)
        .sort((a, b) => b.priority - a.priority)

      if (supported.length > 0) {
        setAvailableResolutions(supported)
      }
    } catch (error) {
      console.log('Background resolution test failed:', error)
    } finally {
      testingRef.current = false
    }
  }

  const handleResolutionChange = (value: string) => {
    setSelectedResolution(value)
    const [width, height] = value.split('x').map(Number)
    onResolutionChange(width, height)
  }

  // Reset wenn Kamera wechselt
  useEffect(() => {
    if (deviceId && hasInitialized.current) {
      hasInitialized.current = false
      testingRef.current = false
      setAvailableResolutions(INSTANT_RESOLUTIONS)
      setSelectedResolution('1920x1080')
    }
  }, [deviceId])

  return (
    <div className={className}>
      <Label className="flex items-center gap-2 mb-2">
        <Maximize2 className="h-4 w-4" />
        Resolution
        <span title="Instant mode - no delay">
          <Zap className="h-3 w-3 text-green-500 animate-pulse" />
        </span>
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
      <p className="text-xs text-muted-foreground mt-1">
        Instant mode - zero delay
      </p>
    </div>
  )
}