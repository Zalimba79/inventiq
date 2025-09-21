export interface CapturedPhoto {
  id: string
  dataUrl: string
  timestamp: Date
  fileName: string
  size: number
  mimeType: string
}

export interface CaptureSession {
  id: string
  productName?: string
  photos: CapturedPhoto[]
  startTime: Date
  endTime?: Date
  status: 'active' | 'completed' | 'cancelled'
}

export interface CameraSettings {
  facingMode: 'user' | 'environment'
  resolution: {
    width: number
    height: number
  }
  aspectRatio?: number
}