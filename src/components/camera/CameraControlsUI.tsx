"use client"

import { 
  Camera, 
  CameraOff, 
  FlipHorizontal2, 
  Zap,
  ZapOff,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Settings
} from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface CameraControlsUIProps {
  className?: string
  isCapturing?: boolean
  hasPermission?: boolean | null
  isLoading?: boolean
  facingMode?: 'user' | 'environment'
  zoom?: number
  zoomRange?: { min: number; max: number; step: number }
  torch?: boolean
  canToggleTorch?: boolean
  onCapture?: () => void
  onSwitchCamera?: () => void
  onZoomChange?: (value: number) => void
  onTorchToggle?: () => void
  onClose?: () => void
  onOpenSettings?: () => void
}

export function CameraControlsUI({
  className,
  isCapturing = false,
  hasPermission,
  isLoading = false,
  facingMode = 'environment',
  zoom = 1,
  zoomRange,
  torch = false,
  canToggleTorch = false,
  onCapture,
  onSwitchCamera,
  onZoomChange,
  onTorchToggle,
  onClose,
  onOpenSettings
}: CameraControlsUIProps): JSX.Element {
  const canCapture = hasPermission && !isLoading && !isCapturing

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Top controls bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onSwitchCamera && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSwitchCamera}
              disabled={!hasPermission || isLoading}
              title="Switch camera"
            >
              <FlipHorizontal2 className="h-5 w-5" />
            </Button>
          )}
          
          {canToggleTorch && onTorchToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onTorchToggle}
              disabled={!hasPermission || isLoading}
              title={torch ? "Turn off flash" : "Turn on flash"}
            >
              {torch ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
            </Button>
          )}
          
          {onOpenSettings && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              title="Camera settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            title="Close camera"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Zoom control */}
      {zoomRange && onZoomChange && zoomRange.max > zoomRange.min && (
        <div className="flex items-center gap-3">
          <ZoomOut className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[zoom]}
            onValueChange={([value]) => onZoomChange(value)}
            min={zoomRange.min}
            max={zoomRange.max}
            step={zoomRange.step}
            className="flex-1"
            disabled={!hasPermission || isLoading}
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground min-w-[3ch]">
            {zoom.toFixed(1)}x
          </span>
        </div>
      )}

      {/* Main capture button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={onCapture}
          disabled={!canCapture}
          className={cn(
            "h-16 w-16 rounded-full",
            isCapturing && "animate-pulse"
          )}
        >
          {isCapturing ? (
            <RotateCw className="h-8 w-8 animate-spin" />
          ) : hasPermission === false ? (
            <CameraOff className="h-8 w-8" />
          ) : (
            <Camera className="h-8 w-8" />
          )}
        </Button>
      </div>

      {/* Status text */}
      {isLoading && (
        <p className="text-center text-sm text-muted-foreground">
          Initializing camera...
        </p>
      )}
      {hasPermission === false && (
        <p className="text-center text-sm text-destructive">
          Camera permission denied
        </p>
      )}
      {isCapturing && (
        <p className="text-center text-sm text-muted-foreground">
          Capturing...
        </p>
      )}
    </div>
  )
}

// Connected version that uses the camera context
interface ConnectedCameraControlsUIProps extends Omit<CameraControlsUIProps, 'hasPermission' | 'isLoading' | 'facingMode' | 'zoom' | 'torch' | 'isCapturing' | 'onCapture'> {
  onImageCapture?: (imageData: string) => void
}

export function ConnectedCameraControlsUI({ 
  onImageCapture,
  ...props 
}: ConnectedCameraControlsUIProps): JSX.Element {
  const { useCameraContext } = require('./CameraProvider')
  const { stream, camera, controls } = useCameraContext()

  const handleCapture = async (): Promise<void> => {
    if (stream.stream) {
      const imageData = await camera.capturePhoto(stream.stream)
      onImageCapture?.(imageData)
    }
  }

  return (
    <CameraControlsUI
      hasPermission={stream.hasPermission}
      isLoading={stream.isLoading}
      isCapturing={camera.isCapturing}
      facingMode={stream.facingMode}
      zoom={controls.zoom}
      zoomRange={controls.capabilities?.zoom}
      torch={controls.torch}
      canToggleTorch={controls.capabilities?.torch ?? false}
      onCapture={handleCapture}
      onSwitchCamera={stream.switchCamera}
      onZoomChange={controls.setZoom}
      onTorchToggle={() => controls.setTorch(!controls.torch)}
      {...props}
    />
  )
}