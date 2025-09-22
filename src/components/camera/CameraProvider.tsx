"use client"

import React, { createContext, useContext, useEffect, type ReactNode } from 'react'

import { useCamera, type UseCameraReturn } from '@/hooks/camera/useCamera'
import { useCameraControls, type UseCameraControlsReturn } from '@/hooks/camera/useCameraControls'
import { useMediaStream, type MediaStreamOptions, type UseMediaStreamReturn } from '@/hooks/camera/useMediaStream'
import type { ExtendedMediaTrackConstraints } from '@/types/camera-extended'

interface CameraContextValue {
  stream: UseMediaStreamReturn
  camera: UseCameraReturn
  controls: UseCameraControlsReturn
}

const CameraContext = createContext<CameraContextValue | null>(null)

export function useCameraContext(): CameraContextValue {
  const context = useContext(CameraContext)
  if (!context) {
    throw new Error('useCameraContext must be used within CameraProvider')
  }
  return context
}

interface CameraProviderProps {
  children: ReactNode
  options?: MediaStreamOptions
}

export function CameraProvider({ children, options = {} }: CameraProviderProps): JSX.Element {
  const stream = useMediaStream(options)
  const camera = useCamera()
  const controls = useCameraControls()

  // Initialize capabilities when stream is ready
  useEffect(() => {
    if (stream.stream) {
      controls.getCapabilities(stream.stream)
    }
  }, [stream.stream, controls])

  // Apply zoom and torch controls when they change
  useEffect(() => {
    if (stream.stream && controls.capabilities) {
      const constraints: ExtendedMediaTrackConstraints = {}
      const advanced: ExtendedMediaTrackConstraints['advanced'] = []
      
      if (controls.capabilities.zoom && controls.zoom !== 1) {
        advanced.push({ zoom: controls.zoom })
      }
      
      if (controls.capabilities.torch) {
        advanced.push({ torch: controls.torch })
      }
      
      if (advanced.length > 0) {
        constraints.advanced = advanced
        void controls.applyConstraints(stream.stream, constraints)
      }
    }
  }, [stream.stream, controls])

  const value: CameraContextValue = {
    stream,
    camera,
    controls
  }

  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  )
}