/**
 * Type definitions for the experimental ImageCapture API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ImageCapture
 */

declare global {
  interface Window {
    ImageCapture: typeof ImageCapture
  }
}

/**
 * PhotoCapabilities interface representing the photo capabilities of a camera
 */
interface PhotoCapabilities {
  /** Supported image widths */
  imageWidth: MediaSettingsRange
  /** Supported image heights */
  imageHeight: MediaSettingsRange
  /** Supported fill light modes */
  fillLightMode: FillLightMode[]
  /** Red-eye reduction capabilities */
  redEyeReduction: RedEyeReduction
}

/**
 * PhotoSettings interface for configuring photo capture
 */
interface PhotoSettings {
  /** Image width in pixels */
  imageWidth?: number
  /** Image height in pixels */
  imageHeight?: number
  /** Fill light mode */
  fillLightMode?: FillLightMode
  /** Red-eye reduction setting */
  redEyeReduction?: boolean
}

/**
 * MediaSettingsRange interface for capability ranges
 */
interface MediaSettingsRange {
  max: number
  min: number
  step: number
}

/**
 * Fill light mode options
 */
type FillLightMode = 'auto' | 'off' | 'flash'

/**
 * Red-eye reduction options
 */
type RedEyeReduction = 'never' | 'always' | 'controllable'

/**
 * Extended ImageCapture interface with custom properties for photo settings
 */
interface ExtendedImageCapture extends ImageCapture {
  /** Custom property to store photo settings */
  _photoSettings?: PhotoSettings
}

/**
 * ImageCapture API class
 */
declare class ImageCapture {
  /**
   * Constructor
   * @param videoTrack - MediaStreamTrack for video
   */
  constructor(videoTrack: MediaStreamTrack)

  /**
   * Get the video track associated with this ImageCapture
   */
  readonly track: MediaStreamTrack

  /**
   * Take a photo and return as Blob
   * @param photoSettings - Optional photo settings
   */
  takePhoto(photoSettings?: PhotoSettings): Promise<Blob>

  /**
   * Get photo capabilities
   */
  getPhotoCapabilities(): Promise<PhotoCapabilities>

  /**
   * Get photo settings
   */
  getPhotoSettings(): Promise<PhotoSettings>

  /**
   * Grab a frame from the video stream
   */
  grabFrame(): Promise<ImageBitmap>
}

export type {
  PhotoCapabilities,
  PhotoSettings,
  MediaSettingsRange,
  FillLightMode,
  RedEyeReduction,
  ExtendedImageCapture
}