/**
 * Device Detection Utility
 * Detects device type and capabilities for optimized capture experience
 */

export type DeviceType = 'ios' | 'android' | 'desktop' | 'unknown'
export type CaptureMethod = 'camera' | 'webcam' | 'file-upload'

export interface DeviceCapabilities {
  type: DeviceType
  isMobile: boolean
  isTablet: boolean
  hasCamera: boolean
  hasTouchScreen: boolean
  supportedCaptureMethods: CaptureMethod[]
  cameraConstraints: MediaStreamConstraints
  recommendedSettings: DeviceSettings
}

export interface DeviceSettings {
  showGrid: boolean
  enableZoom: boolean
  enableFlash: boolean
  enableVolumeCapture: boolean // iOS/Android volume button capture
  enableTapToFocus: boolean
  enablePinchZoom: boolean
  maxResolution: string
  facingMode: 'user' | 'environment'
}

class DeviceDetector {
  private userAgent: string
  private platform: string
  
  constructor() {
    this.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    this.platform = typeof navigator !== 'undefined' ? navigator.platform : ''
  }

  /**
   * Detect device type from user agent and platform
   */
  getDeviceType(): DeviceType {
    // iOS Detection
    if (this.isIOS()) {
      return 'ios'
    }
    
    // Android Detection
    if (this.isAndroid()) {
      return 'android'
    }
    
    // Desktop Detection
    if (this.isDesktop()) {
      return 'desktop'
    }
    
    return 'unknown'
  }

  /**
   * Check if device is iOS (iPhone/iPad)
   */
  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(this.userAgent) && !('MSStream' in window)
  }

  /**
   * Check if device is Android
   */
  isAndroid(): boolean {
    return /Android/.test(this.userAgent)
  }

  /**
   * Check if device is desktop/laptop
   */
  isDesktop(): boolean {
    return !this.isIOS() && !this.isAndroid() && !this.isMobile()
  }

  /**
   * Check if device is mobile (phone size)
   */
  isMobile(): boolean {
    if (typeof window === 'undefined') return false
    
    // Check viewport width
    if (window.innerWidth <= 768) return true
    
    // Check user agent for mobile indicators
    return /Mobi|Android|iPhone/i.test(this.userAgent)
  }

  /**
   * Check if device is tablet
   */
  isTablet(): boolean {
    if (typeof window === 'undefined') return false
    
    // iPad detection
    if (/iPad/.test(this.userAgent)) return true
    
    // Android tablet (larger screen + Android)
    if (this.isAndroid() && window.innerWidth > 768) return true
    
    return false
  }

  /**
   * Check if device has camera access
   */
  async hasCamera(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return false
    }
    
    try {
      // Import safe camera access utility
      const { getCameraDevices } = await import('./safe-camera-access')
      const devices = await getCameraDevices()
      return devices.length > 0
    } catch {
      return false
    }
  }

  /**
   * Check if device has touch screen
   */
  hasTouchScreen(): boolean {
    if (typeof window === 'undefined') return false
    
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 ||
           'msMaxTouchPoints' in navigator && (navigator as { msMaxTouchPoints: number }).msMaxTouchPoints > 0
  }

  /**
   * Get supported capture methods for device
   */
  getSupportedCaptureMethods(): CaptureMethod[] {
    const methods: CaptureMethod[] = []
    
    const deviceType = this.getDeviceType()
    
    switch (deviceType) {
      case 'ios':
        // iOS supports camera and file upload
        methods.push('camera', 'file-upload')
        break
        
      case 'android':
        // Android supports camera and file upload
        methods.push('camera', 'file-upload')
        break
        
      case 'desktop':
        // Desktop primarily uses webcam, but also supports file upload
        methods.push('webcam', 'file-upload')
        break
        
      default:
        // Unknown devices get file upload as fallback
        methods.push('file-upload')
    }
    
    return methods
  }

  /**
   * Get optimal camera constraints for device
   */
  getCameraConstraints(): MediaStreamConstraints {
    const deviceType = this.getDeviceType()
    const isTablet = this.isTablet()
    
    switch (deviceType) {
      case 'ios':
        return {
          video: {
            facingMode: 'environment', // Default to rear camera
            width: { ideal: isTablet ? 2048 : 1920 },
            height: { ideal: isTablet ? 1536 : 1080 },
            aspectRatio: { ideal: 4/3 }
          },
          audio: false
        }
        
      case 'android':
        return {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920, max: 3840 },
            height: { ideal: 1080, max: 2160 },
            aspectRatio: { ideal: 16/9 }
          },
          audio: false
        }
        
      case 'desktop':
        return {
          video: {
            facingMode: 'user', // Desktop usually uses front camera/webcam
            width: { ideal: 1920, max: 3840 },
            height: { ideal: 1080, max: 2160 },
            frameRate: { ideal: 30 },
            aspectRatio: { ideal: 16/9 }
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

  /**
   * Get recommended settings for device
   */
  getRecommendedSettings(): DeviceSettings {
    const deviceType = this.getDeviceType()
    const isTablet = this.isTablet()
    
    switch (deviceType) {
      case 'ios':
        return {
          showGrid: true,
          enableZoom: true,
          enableFlash: true,
          enableVolumeCapture: true, // iOS can use volume buttons for capture
          enableTapToFocus: true,
          enablePinchZoom: true,
          maxResolution: isTablet ? '4K' : '1080p',
          facingMode: 'environment'
        }
        
      case 'android':
        return {
          showGrid: true,
          enableZoom: true,
          enableFlash: true,
          enableVolumeCapture: true,
          enableTapToFocus: true,
          enablePinchZoom: true,
          maxResolution: '1080p',
          facingMode: 'environment'
        }
        
      case 'desktop':
        return {
          showGrid: true,
          enableZoom: false, // Most webcams don't support zoom
          enableFlash: false, // Webcams don't have flash
          enableVolumeCapture: false,
          enableTapToFocus: false,
          enablePinchZoom: false,
          maxResolution: '1080p',
          facingMode: 'user'
        }
        
      default:
        return {
          showGrid: false,
          enableZoom: false,
          enableFlash: false,
          enableVolumeCapture: false,
          enableTapToFocus: false,
          enablePinchZoom: false,
          maxResolution: '720p',
          facingMode: 'user'
        }
    }
  }

  /**
   * Get all device capabilities
   */
  async getCapabilities(): Promise<DeviceCapabilities> {
    const type = this.getDeviceType()
    const hasCamera = await this.hasCamera()
    
    return {
      type,
      isMobile: this.isMobile(),
      isTablet: this.isTablet(),
      hasCamera,
      hasTouchScreen: this.hasTouchScreen(),
      supportedCaptureMethods: this.getSupportedCaptureMethods(),
      cameraConstraints: this.getCameraConstraints(),
      recommendedSettings: this.getRecommendedSettings()
    }
  }

  /**
   * Get device-specific UI recommendations
   */
  getUIRecommendations(): {
    captureButtonPosition: string
    showGestureHints: boolean
    showKeyboardShortcuts: boolean
    useFloatingControls: boolean
    showAdvancedSettings: boolean
    enableSwipeGestures: boolean
    buttonSize: string
    showDeviceOrientation: boolean
    enableHapticFeedback: boolean
  } {
    const deviceType = this.getDeviceType()
    const isMobile = this.isMobile()
    
    return {
      captureButtonPosition: isMobile ? 'bottom' : 'side',
      showGestureHints: isMobile,
      showKeyboardShortcuts: !isMobile,
      useFloatingControls: isMobile,
      showAdvancedSettings: !isMobile,
      enableSwipeGestures: isMobile,
      buttonSize: isMobile ? 'large' : 'normal',
      showDeviceOrientation: isMobile,
      enableHapticFeedback: deviceType === 'ios' || deviceType === 'android'
    }
  }
}

// Export singleton instance
export const deviceDetector = new DeviceDetector()

// Export convenience functions
export const getDeviceType = (): DeviceType => deviceDetector.getDeviceType()
export const getDeviceCapabilities = async (): Promise<DeviceCapabilities> => 
  deviceDetector.getCapabilities()
export const getUIRecommendations = (): ReturnType<typeof deviceDetector.getUIRecommendations> => deviceDetector.getUIRecommendations()
export const getCameraConstraints = (): MediaStreamConstraints => deviceDetector.getCameraConstraints()