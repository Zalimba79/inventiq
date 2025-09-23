/**
 * Safe Camera Hook
 * Provides safe camera access with Safari crash prevention
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { 
  requestCamera, 
  releaseCamera, 
  checkCameraPermission,
  type CameraAccessResult
} from '@/lib/safe-camera-access'

interface UseSafeCameraOptions {
  constraints?: MediaStreamConstraints
  autoStart?: boolean
  onError?: (error: string) => void
}

interface UseSafeCameraReturn {
  stream: MediaStream | null
  isLoading: boolean
  error: string | null
  permission: PermissionState | 'unsupported' | null
  startCamera: () => Promise<void>
  stopCamera: () => void
  retryCamera: () => Promise<void>
}

export function useSafeCamera(
  options: UseSafeCameraOptions = {}
): UseSafeCameraReturn {
  const { 
    constraints, 
    autoStart = false,
    onError 
  } = options

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permission, setPermission] = useState<PermissionState | 'unsupported' | null>(null)
  
  const streamRef = useRef<MediaStream | null>(null)

  // Start camera with safe access
  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      console.warn('Camera already started')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check permission first
      const permissionStatus = await checkCameraPermission()
      setPermission(permissionStatus)

      if (permissionStatus === 'denied') {
        const errorMsg = 'Camera permission denied. Please enable camera access in your browser settings.'
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      // Request camera with safe access
      const result: CameraAccessResult = await requestCamera(constraints)

      if (result.success && result.stream) {
        streamRef.current = result.stream
        setStream(result.stream)
        setPermission(result.permission || 'granted')
      } else {
        const errorMsg = result.error || 'Failed to access camera'
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown camera error'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [constraints, onError])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      releaseCamera(streamRef.current)
      streamRef.current = null
      setStream(null)
    }
  }, [])

  // Retry camera access
  const retryCamera = useCallback(async () => {
    stopCamera()
    await startCamera()
  }, [stopCamera, startCamera])

  // Auto-start if requested
  useEffect(() => {
    if (autoStart) {
      void startCamera()
    }

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        releaseCamera(streamRef.current)
        streamRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    stream,
    isLoading,
    error,
    permission,
    startCamera,
    stopCamera,
    retryCamera
  }
}

// Hook for safe camera with React Webcam component
export function useSafeCameraForWebcam(options: UseSafeCameraOptions = {}) {
  const camera = useSafeCamera(options)
  
  // Get video constraints from stream for react-webcam
  const getVideoConstraints = useCallback(() => {
    if (!camera.stream) return undefined
    
    const videoTrack = camera.stream.getVideoTracks()[0]
    if (!videoTrack) return undefined
    
    const settings = videoTrack.getSettings()
    return {
      deviceId: settings.deviceId,
      width: settings.width,
      height: settings.height,
      aspectRatio: settings.aspectRatio
    }
  }, [camera.stream])

  return {
    ...camera,
    videoConstraints: getVideoConstraints()
  }
}