"use client"

import { useCallback, useEffect, useRef, useState } from 'react'

export interface MediaStreamOptions {
  video?: boolean | MediaTrackConstraints
  audio?: boolean | MediaTrackConstraints
  facingMode?: 'user' | 'environment'
  resolution?: { width: number; height: number }
}

export interface UseMediaStreamReturn {
  stream: MediaStream | null
  isLoading: boolean
  error: string | null
  hasPermission: boolean | null
  facingMode: 'user' | 'environment'
  startStream: () => Promise<void>
  stopStream: () => void
  switchCamera: () => Promise<void>
  getDevices: () => Promise<MediaDeviceInfo[]>
}

export function useMediaStream(options: MediaStreamOptions = {}): UseMediaStreamReturn {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    options.facingMode ?? 'environment'
  )
  const streamRef = useRef<MediaStream | null>(null)

  const getDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter(device => device.kind === 'videoinput')
    } catch (err) {
      console.error('Failed to enumerate devices:', err)
      return []
    }
  }, [])

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
      setStream(null)
    }
  }, [])

  const startStream = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Stop existing stream if any
      stopStream()

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode,
          width: options.resolution?.width ?? 1280,
          height: options.resolution?.height ?? 720,
          ...(typeof options.video === 'object' ? options.video : {})
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = mediaStream
      setStream(mediaStream)
      setHasPermission(true)
      setError(null)
    } catch (err) {
      console.error('Failed to start camera stream:', err)
      setError(err instanceof Error ? err.message : 'Failed to access camera')
      setHasPermission(false)
    } finally {
      setIsLoading(false)
    }
  }, [facingMode, options.resolution, options.video, stopStream])

  const switchCamera = useCallback(async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newMode)
    await startStream()
  }, [facingMode, startStream])

  // Cleanup on unmount
  useEffect(() => stopStream, [stopStream])

  return {
    stream,
    isLoading,
    error,
    hasPermission,
    facingMode,
    startStream,
    stopStream,
    switchCamera,
    getDevices
  }
}