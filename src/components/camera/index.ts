// Main components
export { CameraViewRefactored } from './CameraViewRefactored'
export { CameraProvider, useCameraContext } from './CameraProvider'
export { CameraPreview, ConnectedCameraPreview } from './CameraPreview'
export { CameraControlsUI, ConnectedCameraControlsUI } from './CameraControlsUI'

// Legacy components (to be deprecated)
export { CameraView } from './CameraView'

// Hooks
export { useMediaStream } from '@/hooks/camera/useMediaStream'
export { useCamera } from '@/hooks/camera/useCamera'
export { useCameraControls } from '@/hooks/camera/useCameraControls'

// Types
export type { MediaStreamOptions, UseMediaStreamReturn } from '@/hooks/camera/useMediaStream'
export type { CaptureOptions, UseCameraReturn } from '@/hooks/camera/useCamera'
export type { CameraCapabilities, UseCameraControlsReturn } from '@/hooks/camera/useCameraControls'