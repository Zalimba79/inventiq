"use client"

import { 
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import React from 'react'

import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

import { 
  CaptureButton,
  CloseButton,
  SettingsButton,
  SwitchCameraButton,
  TorchButton
} from './CameraControlButtons'

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
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Top controls bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SwitchCameraButton
            onSwitchCamera={onSwitchCamera}
            hasPermission={hasPermission}
            isLoading={isLoading}
            facingMode={facingMode}
          />
          
          <TorchButton
            canToggleTorch={canToggleTorch}
            onTorchToggle={onTorchToggle}
            hasPermission={hasPermission}
            isLoading={isLoading}
            torch={torch}
          />
          
          <SettingsButton onOpenSettings={onOpenSettings} />
        </div>
        
        <CloseButton onClose={onClose} />
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
        <CaptureButton
          onCapture={onCapture}
          isCapturing={isCapturing}
          hasPermission={hasPermission}
          isLoading={isLoading}
        />
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
      {!isLoading && !isCapturing && hasPermission && (
        <p className="text-center text-xs text-muted-foreground">
          {facingMode === 'user' ? 'Front camera' : 'Back camera'}
        </p>
      )}
    </div>
  )
}

// Note: ConnectedCameraControlsUI wurde entfernt
// Verwende stattdessen CameraControlsUI direkt mit useCameraContext in der Parent-Komponente
// Dies vermeidet zirkuläre Abhängigkeiten