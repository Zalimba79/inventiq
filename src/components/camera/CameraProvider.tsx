"use client"

import React, { createContext, useContext, type ReactNode } from 'react'

import { useCamera, type UseCameraReturn } from '@/hooks/camera/useCamera'
import { useCameraControls, type UseCameraControlsReturn } from '@/hooks/camera/useCameraControls'
import { useMediaStream, type MediaStreamOptions, type UseMediaStreamReturn } from '@/hooks/camera/useMediaStream'

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
  React.useEffect(() => {
    if (stream.stream) {
      controls.getCapabilities(stream.stream)
    }
  }, [stream.stream, controls])

  // Apply zoom and torch controls when they change
  React.useEffect(() => {
    if (stream.stream && controls.capabilities) {
      const constraints: any = {}
      
      if (controls.capabilities.zoom && controls.zoom !== 1) {
        constraints.advanced = [{ zoom: controls.zoom }]
      }
      
      if (controls.capabilities.torch) {
        constraints.advanced = constraints.advanced ?? []
        constraints.advanced.push({ torch: controls.torch })
      }
      
      if (Object.keys(constraints).length > 0) {
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