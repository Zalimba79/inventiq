"use client"

import { useCallback, useEffect, useState } from 'react'

import type { ExtendedMediaTrackCapabilities, ExtendedMediaTrackConstraints } from '@/types/camera-extended'

export interface CameraCapabilities {
  zoom?: { min: number; max: number; step: number }
  torch?: boolean
  focusMode?: string[]
  exposureMode?: string[]
  whiteBalanceMode?: string[]
}

export interface UseCameraControlsReturn {
  zoom: number
  torch: boolean
  capabilities: CameraCapabilities | null
  setZoom: (value: number) => void
  setTorch: (enabled: boolean) => void
  applyConstraints: (stream: MediaStream, constraints: ExtendedMediaTrackConstraints) => Promise<void>
  getCapabilities: (stream: MediaStream) => CameraCapabilities | null
}

export function useCameraControls(): UseCameraControlsReturn {
  const [zoom, setZoomState] = useState(1)
  const [torch, setTorchState] = useState(false)
  const [capabilities, setCapabilities] = useState<CameraCapabilities | null>(null)

  const getCapabilities = useCallback((stream: MediaStream): CameraCapabilities | null => {
    if (!stream) return null
    
    const videoTrack = stream.getVideoTracks()[0]
    if (!videoTrack) return null
    
    if (typeof videoTrack.getCapabilities === 'function') {
      try {
        const caps = videoTrack.getCapabilities() as ExtendedMediaTrackCapabilities
        const capabilities: CameraCapabilities = {}
        
        if (caps.zoom) {
          capabilities.zoom = {
            min: caps.zoom.min ?? 1,
            max: caps.zoom.max ?? 1,
            step: caps.zoom.step ?? 0.1
          }
        }
        
        if (caps.torch !== undefined) {
          capabilities.torch = true
        }
        
        if (caps.focusMode) {
          capabilities.focusMode = caps.focusMode
        }
        
        if (caps.exposureMode) {
          capabilities.exposureMode = caps.exposureMode
        }
        
        if (caps.whiteBalanceMode) {
          capabilities.whiteBalanceMode = caps.whiteBalanceMode
        }
        
        setCapabilities(capabilities)
        return capabilities
      } catch (err) {
        console.error('Failed to get capabilities:', err)
      }
    }
    
    return null
  }, [])

  const applyConstraints = useCallback(
    async (stream: MediaStream, constraints: ExtendedMediaTrackConstraints): Promise<void> => {
      if (!stream) return
      
      const videoTrack = stream.getVideoTracks()[0]
      if (!videoTrack) return
      
      try {
        await videoTrack.applyConstraints(constraints)
      } catch (err) {
        console.error('Failed to apply constraints:', err)
      }
    },
    []
  )

  const setZoom = useCallback(
    (value: number) => {
      setZoomState(value)
      // Zoom will be applied via applyConstraints when needed
    },
    []
  )

  const setTorch = useCallback(
    (enabled: boolean) => {
      setTorchState(enabled)
      // Torch will be applied via applyConstraints when needed
    },
    []
  )

  // Apply zoom and torch when they change
  useEffect(() => {
    // This effect would be connected to the stream in the parent component
    // Parent would call applyConstraints when zoom/torch change
  }, [zoom, torch])

  return {
    zoom,
    torch,
    capabilities,
    setZoom,
    setTorch,
    applyConstraints,
    getCapabilities
  }
}