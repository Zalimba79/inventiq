/**
 * Fast Device Detection Utility
 * Optimized for quick device type detection without camera access
 */

export type DeviceType = 'ios' | 'android' | 'desktop' | 'unknown'

class FastDeviceDetector {
  private userAgent: string
  private cachedType: DeviceType | null = null
  
  constructor() {
    this.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  }

  /**
   * Fast device type detection from user agent only
   * No camera access required
   */
  getDeviceType(): DeviceType {
    // Return cached result if available
    if (this.cachedType) {
      return this.cachedType
    }
    
    // Default to desktop for SSR (server-side rendering)
    if (typeof window === 'undefined') {
      return 'desktop'
    }

    let type: DeviceType = 'unknown'
    
    // iOS Detection
    if (/iPad|iPhone|iPod/.test(this.userAgent) && !('MSStream' in window)) {
      type = 'ios'
    }
    // Android Detection
    else if (/Android/.test(this.userAgent)) {
      type = 'android'
    }
    // Desktop Detection
    else if (!this.isMobile()) {
      type = 'desktop'
    }
    
    // Cache the result
    this.cachedType = type
    return type
  }

  /**
   * Quick mobile check without viewport measurements
   */
  private isMobile(): boolean {
    return /Mobi|Android|iPhone/i.test(this.userAgent)
  }

  /**
   * Check if device likely has camera (heuristic)
   * Doesn't actually access camera
   */
  likelyHasCamera(): boolean {
    if (typeof navigator === 'undefined') return false
    
    // Most modern devices have cameras
    const deviceType = this.getDeviceType()
    
    // Mobile devices almost always have cameras
    if (deviceType === 'ios' || deviceType === 'android') {
      return true
    }
    
    // Check if mediaDevices API is available (doesn't trigger permissions)
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      return true
    }
    
    return false
  }

  /**
   * Get recommended camera constraints without accessing camera
   */
  getRecommendedConstraints(): MediaStreamConstraints {
    const deviceType = this.getDeviceType()
    
    switch (deviceType) {
      case 'ios':
        return {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        }
        
      case 'android':
        return {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        }
        
      case 'desktop':
        return {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        }
        
      default:
        return {
          video: true,
          audio: false
        }
    }
  }
}

// Export singleton instance
export const fastDeviceDetector = new FastDeviceDetector()

// Export convenience functions
export const getDeviceType = (): DeviceType => fastDeviceDetector.getDeviceType()
export const likelyHasCamera = (): boolean => fastDeviceDetector.likelyHasCamera()
export const getRecommendedConstraints = (): MediaStreamConstraints => fastDeviceDetector.getRecommendedConstraints()