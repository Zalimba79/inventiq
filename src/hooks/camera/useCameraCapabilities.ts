import { useEffect, useState } from 'react'

export interface CameraCapabilities {
  deviceId: string
  label: string
  supportedResolutions: Resolution[]
  maxResolution: Resolution | null
}

export interface Resolution {
  width: number
  height: number
  label: string
}

/**
 * Hook to detect camera capabilities and supported resolutions
 */
export function useCameraCapabilities(): {
  cameras: CameraCapabilities[]
  isLoading: boolean
  error: string | null
  checkResolutionSupport: (deviceId: string, width: number, height: number) => Promise<boolean>
} {
  const [cameras, setCameras] = useState<CameraCapabilities[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Common resolutions to test
  const testResolutions: Resolution[] = [
    { width: 640, height: 480, label: '480p' },
    { width: 1280, height: 720, label: '720p HD' },
    { width: 1920, height: 1080, label: '1080p FHD' },
    { width: 2560, height: 1440, label: '1440p QHD' },
    { width: 3840, height: 2160, label: '4K UHD' },
    { width: 7680, height: 4320, label: '8K UHD' }
  ]

  /**
   * Test if a specific resolution is supported by attempting to get a stream
   */
  const checkResolutionSupport = async (
    deviceId: string,
    width: number,
    height: number
  ): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { exact: width },
          height: { exact: height }
        }
      })

      // Check actual resolution
      const videoTrack = stream.getVideoTracks()[0]
      const settings = videoTrack.getSettings()
      const isSupported = settings.width === width && settings.height === height

      // Clean up
      stream.getTracks().forEach(track => track.stop())

      return isSupported
    } catch {
      return false
    }
  }

  /**
   * Get supported resolutions for a camera using binary search approach
   */
  const getSupportedResolutions = async (deviceId: string): Promise<Resolution[]> => {
    const supported: Resolution[] = []
    
    // Test each resolution
    for (const resolution of testResolutions) {
      const isSupported = await checkResolutionSupport(
        deviceId,
        resolution.width,
        resolution.height
      )
      if (isSupported) {
        supported.push(resolution)
      }
    }

    // Also check for the actual maximum resolution using capabilities API if available
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 10000 }, // Request very high to get maximum
          height: { ideal: 10000 }
        }
      })

      const videoTrack = stream.getVideoTracks()[0]
      const capabilities = videoTrack.getCapabilities?.()
      
      if (capabilities?.width?.max && capabilities?.height?.max) {
        // Check if this max resolution is not already in our list
        const maxWidth = capabilities.width.max
        const maxHeight = capabilities.height.max
        
        const exists = supported.some(
          r => r.width === maxWidth && r.height === maxHeight
        )
        
        if (!exists && maxWidth && maxHeight) {
          // Verify this resolution actually works
          const isSupported = await checkResolutionSupport(deviceId, maxWidth, maxHeight)
          if (isSupported) {
            supported.push({
              width: maxWidth,
              height: maxHeight,
              label: `${maxWidth}×${maxHeight}`
            })
          }
        }
      }

      // Get actual resolution being used
      const settings = videoTrack.getSettings()
      if (settings.width && settings.height) {
        const exists = supported.some(
          r => r.width === settings.width && r.height === settings.height
        )
        
        if (!exists) {
          supported.push({
            width: settings.width,
            height: settings.height,
            label: `${settings.width}×${settings.height}`
          })
        }
      }

      stream.getTracks().forEach(track => track.stop())
    } catch (err) {
      console.warn('Could not get camera capabilities:', err)
    }

    // Sort by resolution (width * height)
    supported.sort((a, b) => (a.width * a.height) - (b.width * b.height))

    return supported
  }

  useEffect(() => {
    const detectCameras = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)

        // Request camera permission first
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())

        // Get all video input devices
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')

        // Check capabilities for each camera
        const cameraCapabilities: CameraCapabilities[] = []

        for (const device of videoDevices) {
          const supportedResolutions = await getSupportedResolutions(device.deviceId)
          
          cameraCapabilities.push({
            deviceId: device.deviceId,
            label: device.label || `Camera ${cameraCapabilities.length + 1}`,
            supportedResolutions,
            maxResolution: supportedResolutions[supportedResolutions.length - 1] || null
          })
        }

        setCameras(cameraCapabilities)
      } catch (err) {
        console.error('Error detecting cameras:', err)
        setError(err instanceof Error ? err.message : 'Failed to detect cameras')
      } finally {
        setIsLoading(false)
      }
    }

    void detectCameras()

    // Re-detect when devices change
    const handleDeviceChange = (): void => {
      void detectCameras()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [])

  return {
    cameras,
    isLoading,
    error,
    checkResolutionSupport
  }
}

/**
 * Get the best matching resolution from supported resolutions
 */
export function getBestSupportedResolution(
  supportedResolutions: Resolution[],
  targetWidth: number,
  targetHeight: number
): Resolution | null {
  if (supportedResolutions.length === 0) return null

  // First, check for exact match
  const exactMatch = supportedResolutions.find(
    r => r.width === targetWidth && r.height === targetHeight
  )
  if (exactMatch) return exactMatch

  // Find the closest resolution that's not larger than target
  const targetPixels = targetWidth * targetHeight
  const smaller = supportedResolutions.filter(
    r => (r.width * r.height) <= targetPixels
  )

  if (smaller.length > 0) {
    // Return the largest resolution that's still smaller than target
    return smaller[smaller.length - 1]
  }

  // If no smaller resolution, return the smallest available
  return supportedResolutions[0]
}