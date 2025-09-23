/**
 * Safe Camera Access Utility
 * Handles camera permissions safely to avoid Safari WebKit crashes
 */

export interface CameraAccessResult {
  success: boolean
  error?: string
  stream?: MediaStream
  permission?: PermissionState
}

class SafeCameraAccess {
  private isSafari: boolean
  private safariVersion: number | null
  
  constructor() {
    // Detect Safari and version
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    this.isSafari = /^((?!chrome|android).)*safari/i.test(ua)
    
    // Extract Safari version
    const safariMatch = ua.match(/Version\/(\d+)/i)
    this.safariVersion = safariMatch ? parseInt(safariMatch[1], 10) : null
  }

  /**
   * Check camera permission status without triggering WebKit crash
   */
  async checkPermission(): Promise<PermissionState | 'unsupported'> {
    if (typeof navigator === 'undefined' || !navigator.permissions) {
      return 'unsupported'
    }

    try {
      // Safari doesn't support permissions.query for camera yet
      // Attempting it can cause issues, so we skip for Safari
      if (this.isSafari) {
        return 'prompt' // Default to prompt state for Safari
      }

      // For other browsers, try to query permission
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      return result.state
    } catch (error) {
      console.warn('Permission check failed:', error)
      return 'unsupported'
    }
  }

  /**
   * Safely request camera access with Safari crash prevention
   */
  async requestCameraAccess(constraints?: MediaStreamConstraints): Promise<CameraAccessResult> {
    // Default constraints if not provided
    const defaultConstraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
        facingMode: 'environment'
      },
      audio: false
    }

    const finalConstraints = constraints || defaultConstraints

    // Safari-specific handling
    if (this.isSafari) {
      return this.requestSafariCamera(finalConstraints)
    }

    // Standard camera request for other browsers
    return this.requestStandardCamera(finalConstraints)
  }

  /**
   * Safari-specific camera request with crash prevention
   */
  private async requestSafariCamera(constraints: MediaStreamConstraints): Promise<CameraAccessResult> {
    try {
      // For Safari, use simpler constraints to avoid crashes
      const safeConstraints: MediaStreamConstraints = {
        video: true, // Start with basic video request
        audio: false
      }

      // Add small delay to let Safari initialize properly
      await this.delay(100)

      // First try with basic constraints
      let stream: MediaStream | null = null
      
      try {
        stream = await navigator.mediaDevices.getUserMedia(safeConstraints)
      } catch (basicError) {
        // If basic request fails, it's likely a permission issue
        return {
          success: false,
          error: 'Camera access denied or not available'
        }
      }

      // If basic request succeeded, try to apply full constraints
      if (stream && typeof constraints.video === 'object') {
        try {
          // Stop the basic stream
          stream.getTracks().forEach(track => track.stop())
          
          // Request with full constraints
          stream = await navigator.mediaDevices.getUserMedia(constraints)
        } catch (advancedError) {
          console.warn('Failed to apply advanced constraints, using basic stream:', advancedError)
          // Re-request with basic constraints
          stream = await navigator.mediaDevices.getUserMedia(safeConstraints)
        }
      }

      return {
        success: true,
        stream: stream!,
        permission: 'granted'
      }
    } catch (error) {
      console.error('Safari camera access failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Safari camera error'
      }
    }
  }

  /**
   * Standard camera request for non-Safari browsers
   */
  private async requestStandardCamera(constraints: MediaStreamConstraints): Promise<CameraAccessResult> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      return {
        success: true,
        stream,
        permission: 'granted'
      }
    } catch (error) {
      console.error('Camera access failed:', error)
      
      let errorMessage = 'Camera access failed'
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please check your browser permissions.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.'
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.'
        } else {
          errorMessage = error.message
        }
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Release camera stream safely
   */
  releaseCamera(stream: MediaStream): void {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
      })
    }
  }

  /**
   * Check if browser supports camera access
   */
  isCameraSupported(): boolean {
    return !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    )
  }

  /**
   * Get available camera devices
   */
  async getCameraDevices(): Promise<MediaDeviceInfo[]> {
    if (!this.isCameraSupported()) {
      return []
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter(device => device.kind === 'videoinput')
    } catch (error) {
      console.error('Failed to enumerate devices:', error)
      return []
    }
  }

  /**
   * Helper to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get browser info for debugging
   */
  getBrowserInfo(): {
    isSafari: boolean
    safariVersion: number | null
    userAgent: string
    cameraSupported: boolean
  } {
    return {
      isSafari: this.isSafari,
      safariVersion: this.safariVersion,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      cameraSupported: this.isCameraSupported()
    }
  }
}

// Export singleton instance
export const safeCameraAccess = new SafeCameraAccess()

// Export convenience functions
export const requestCamera = async (
  constraints?: MediaStreamConstraints
): Promise<CameraAccessResult> => {
  return safeCameraAccess.requestCameraAccess(constraints)
}

export const releaseCamera = (stream: MediaStream): void => {
  safeCameraAccess.releaseCamera(stream)
}

export const checkCameraPermission = async (): Promise<PermissionState | 'unsupported'> => {
  return safeCameraAccess.checkPermission()
}

export const getCameraDevices = async (): Promise<MediaDeviceInfo[]> => {
  return safeCameraAccess.getCameraDevices()
}

export const isCameraSupported = (): boolean => {
  return safeCameraAccess.isCameraSupported()
}