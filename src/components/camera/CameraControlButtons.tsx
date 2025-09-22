"use client"

import { 
  Camera, 
  CameraOff, 
  FlipHorizontal2, 
  Zap,
  ZapOff,
  RotateCw,
  X,
  Settings
} from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SwitchCameraButtonProps {
  onSwitchCamera?: () => void
  hasPermission?: boolean | null
  isLoading?: boolean
  facingMode?: 'user' | 'environment'
}

export function SwitchCameraButton({
  onSwitchCamera,
  hasPermission,
  isLoading,
  facingMode = 'environment'
}: SwitchCameraButtonProps): JSX.Element | null {
  if (!onSwitchCamera) return null
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onSwitchCamera}
      disabled={!hasPermission || isLoading}
      title={`Switch to ${facingMode === 'user' ? 'back' : 'front'} camera`}
      className={cn(facingMode === 'user' && "bg-accent")}
    >
      <FlipHorizontal2 className="h-5 w-5" />
    </Button>
  )
}

interface TorchButtonProps {
  canToggleTorch?: boolean
  onTorchToggle?: () => void
  hasPermission?: boolean | null
  isLoading?: boolean
  torch?: boolean
}

export function TorchButton({
  canToggleTorch,
  onTorchToggle,
  hasPermission,
  isLoading,
  torch = false
}: TorchButtonProps): JSX.Element | null {
  if (!canToggleTorch || !onTorchToggle) return null
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onTorchToggle}
      disabled={!hasPermission || isLoading}
      title={torch ? "Turn off flash" : "Turn on flash"}
    >
      {torch ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
    </Button>
  )
}

interface SettingsButtonProps {
  onOpenSettings?: () => void
}

export function SettingsButton({
  onOpenSettings
}: SettingsButtonProps): JSX.Element | null {
  if (!onOpenSettings) return null
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onOpenSettings}
      title="Camera settings"
    >
      <Settings className="h-5 w-5" />
    </Button>
  )
}

interface CloseButtonProps {
  onClose?: () => void
}

export function CloseButton({
  onClose
}: CloseButtonProps): JSX.Element | null {
  if (!onClose) return null
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClose}
      title="Close camera"
    >
      <X className="h-5 w-5" />
    </Button>
  )
}

interface CaptureButtonProps {
  onCapture?: () => void
  isCapturing?: boolean
  hasPermission?: boolean | null
  isLoading?: boolean
}

export function CaptureButton({
  onCapture,
  isCapturing = false,
  hasPermission,
  isLoading = false
}: CaptureButtonProps): JSX.Element {
  const canCapture = hasPermission && !isLoading && !isCapturing
  
  return (
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
  )
}