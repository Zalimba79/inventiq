// Extended camera API types that aren't in standard TypeScript definitions

interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  zoom?: {
    min: number
    max: number
    step: number
  }
  torch?: boolean
  focusMode?: string[]
  exposureMode?: string[]
  whiteBalanceMode?: string[]
}

interface ExtendedMediaTrackConstraints extends MediaTrackConstraints {
  advanced?: Array<{
    zoom?: number
    torch?: boolean
    focusMode?: string
    exposureMode?: string
    whiteBalanceMode?: string
  }>
}

declare global {
  interface MediaStreamTrack {
    getCapabilities?(): ExtendedMediaTrackCapabilities
    applyConstraints(constraints: ExtendedMediaTrackConstraints): Promise<void>
  }
  
  interface ImageCapture {
    takePhoto(settings?: PhotoSettings): Promise<Blob>
    grabFrame(): Promise<ImageBitmap>
  }
  
  interface PhotoSettings {
    imageHeight?: number
    imageWidth?: number
    fillLightMode?: 'auto' | 'off' | 'flash'
  }
  
  const ImageCapture: {
    new(track: MediaStreamTrack): ImageCapture
  }
}

export type {
  ExtendedMediaTrackCapabilities,
  ExtendedMediaTrackConstraints
}