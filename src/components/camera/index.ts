// Main components
export { CameraViewRefactored } from './CameraViewRefactored'
export { CameraProvider, useCameraContext } from './CameraProvider'
export { CameraPreview } from './CameraPreview'
export { CameraControlsUI } from './CameraControlsUi'

// Hooks
export { useMediaStream } from '@/hooks/camera/useMediaStream'
export { useCamera } from '@/hooks/camera/useCamera'
export { useCameraControls } from '@/hooks/camera/useCameraControls'

// Types
export type { MediaStreamOptions, UseMediaStreamReturn } from '@/hooks/camera/useMediaStream'
export type { CaptureOptions, UseCameraReturn } from '@/hooks/camera/useCamera'
export type { CameraCapabilities, UseCameraControlsReturn } from '@/hooks/camera/useCameraControls'