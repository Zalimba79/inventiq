export type CameraResolution = '640x480' | '800x600' | '1280x720' | '1920x1080' | '2560x1440' | '3840x2160'
export type ImageFormat = 'jpeg' | 'webp' | 'png'
export type CameraFacingMode = 'user' | 'environment'

export interface Resolution {
  width: number
  height: number
  label: string
}

export interface CameraConfiguration {
  // Core settings
  resolution: CameraResolution
  quality: number // 0-100
  format: ImageFormat
  facingMode: CameraFacingMode
  
  // Capture settings
  photosPerProduct: number
  autoAdvance: boolean
  captureSound: boolean
  captureDelay: number // milliseconds
  
  // UI settings
  showGrid: boolean
  showGuide: boolean
  showPreview: boolean
  previewDuration: number // milliseconds
}

export const RESOLUTION_OPTIONS: Record<CameraResolution, Resolution> = {
  '640x480': { width: 640, height: 480, label: '480p' },
  '800x600': { width: 800, height: 600, label: 'SVGA' },
  '1280x720': { width: 1280, height: 720, label: '720p HD' },
  '1920x1080': { width: 1920, height: 1080, label: '1080p FHD' },
  '2560x1440': { width: 2560, height: 1440, label: '1440p QHD' },
  '3840x2160': { width: 3840, height: 2160, label: '4K UHD' }
}

export const IMAGE_FORMAT_OPTIONS: Record<ImageFormat, { label: string; mimeType: string }> = {
  jpeg: { label: 'JPEG', mimeType: 'image/jpeg' },
  webp: { label: 'WebP', mimeType: 'image/webp' },
  png: { label: 'PNG', mimeType: 'image/png' }
}

export const DEFAULT_CAMERA_CONFIG: CameraConfiguration = {
  // Core settings
  resolution: '1280x720',
  quality: 85,
  format: 'jpeg',
  facingMode: 'environment',
  
  // Capture settings
  photosPerProduct: 3,
  autoAdvance: false,
  captureSound: false,
  captureDelay: 0,
  
  // UI settings
  showGrid: false,
  showGuide: true,
  showPreview: true,
  previewDuration: 600
}

// Helper functions
export function getResolutionDetails(resolution: CameraResolution): Resolution {
  return RESOLUTION_OPTIONS[resolution]
}

export function getFormatDetails(format: ImageFormat): { label: string; mimeType: string } {
  return IMAGE_FORMAT_OPTIONS[format]
}

export function validateCameraConfig(config: Partial<CameraConfiguration>): CameraConfiguration {
  return {
    ...DEFAULT_CAMERA_CONFIG,
    ...config,
    quality: Math.max(0, Math.min(100, config.quality ?? DEFAULT_CAMERA_CONFIG.quality)),
    photosPerProduct: Math.max(1, Math.min(10, config.photosPerProduct ?? DEFAULT_CAMERA_CONFIG.photosPerProduct)),
    captureDelay: Math.max(0, Math.min(5000, config.captureDelay ?? DEFAULT_CAMERA_CONFIG.captureDelay)),
    previewDuration: Math.max(100, Math.min(3000, config.previewDuration ?? DEFAULT_CAMERA_CONFIG.previewDuration))
  }
}