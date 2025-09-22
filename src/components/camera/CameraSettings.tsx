"use client"

import { Settings, Camera, ImageIcon, Hash } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

export interface CameraSettingsConfig {
  resolution: {
    width: number
    height: number
    label: string
  }
  quality: number
  format: 'jpeg' | 'webp' | 'png'
  photosPerProduct: number
  autoCapture: boolean
  captureDelay: number
  enableGrid: boolean
  mirror: boolean
}

interface CameraSettingsProps {
  settings: CameraSettingsConfig
  onSettingsChange: (settings: CameraSettingsConfig) => void
  isOpen?: boolean
  onClose?: () => void
}

const RESOLUTION_OPTIONS = [
  { width: 640, height: 480, label: 'VGA (640x480)' },
  { width: 800, height: 600, label: 'SVGA (800x600)' },
  { width: 1280, height: 720, label: 'HD (1280x720)' },
  { width: 1920, height: 1080, label: 'Full HD (1920x1080)' },
  { width: 2560, height: 1440, label: '2K (2560x1440)' },
  { width: 3840, height: 2160, label: '4K (3840x2160)' }
]

export function CameraSettings({ settings, onSettingsChange, isOpen = true, onClose }: CameraSettingsProps): JSX.Element {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleResolutionChange = (value: string): void => {
    const resolution = RESOLUTION_OPTIONS.find(r => r.label === value)
    if (resolution) {
      const updated = { ...localSettings, resolution }
      setLocalSettings(updated)
      onSettingsChange(updated)
    }
  }

  const handleQualityChange = (value: number[]): void => {
    const updated = { ...localSettings, quality: value[0] }
    setLocalSettings(updated)
    onSettingsChange(updated)
  }

  const handleFormatChange = (value: string): void => {
    const updated = { ...localSettings, format: value as 'jpeg' | 'webp' | 'png' }
    setLocalSettings(updated)
    onSettingsChange(updated)
  }

  const handlePhotosPerProductChange = (value: number[]): void => {
    const updated = { ...localSettings, photosPerProduct: value[0] }
    setLocalSettings(updated)
    onSettingsChange(updated)
  }

  const handleAutoCaptureChange = (checked: boolean) => {
    const updated = { ...localSettings, autoCapture: checked }
    setLocalSettings(updated)
    onSettingsChange(updated)
  }

  const handleCaptureDelayChange = (value: number[]) => {
    const updated = { ...localSettings, captureDelay: value[0] }
    setLocalSettings(updated)
    onSettingsChange(updated)
  }

  const handleGridChange = (checked: boolean) => {
    const updated = { ...localSettings, enableGrid: checked }
    setLocalSettings(updated)
    onSettingsChange(updated)
  }

  const handleMirrorChange = (checked: boolean) => {
    const updated = { ...localSettings, mirror: checked }
    setLocalSettings(updated)
    onSettingsChange(updated)
  }

  if (!isOpen) return <div style={{ display: 'none' }} />

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Camera Settings
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resolution */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Resolution
          </Label>
          <Select value={localSettings.resolution.label} onValueChange={handleResolutionChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESOLUTION_OPTIONS.map(res => (
                <SelectItem key={res.label} value={res.label}>
                  {res.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Image Quality */}
        <div className="space-y-2">
          <Label className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Image Quality
            </span>
            <span className="text-sm text-muted-foreground">{localSettings.quality}%</span>
          </Label>
          <Slider
            value={[localSettings.quality]}
            onValueChange={handleQualityChange}
            min={50}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lower (smaller files)</span>
            <span>Higher (better quality)</span>
          </div>
        </div>

        {/* Image Format */}
        <div className="space-y-2">
          <Label>Image Format</Label>
          <Select value={localSettings.format} onValueChange={handleFormatChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jpeg">JPEG (Best compatibility)</SelectItem>
              <SelectItem value="webp">WebP (Smaller size)</SelectItem>
              <SelectItem value="png">PNG (Lossless)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Photos per Product */}
        <div className="space-y-2">
          <Label className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Photos per Product
            </span>
            <span className="text-sm text-muted-foreground">{localSettings.photosPerProduct}</span>
          </Label>
          <Slider
            value={[localSettings.photosPerProduct]}
            onValueChange={handlePhotosPerProductChange}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Number of photos to capture for each product
          </p>
        </div>

        {/* Auto Capture */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-capture" className="flex-1">
            <div>Auto-Capture Mode</div>
            <p className="text-xs text-muted-foreground font-normal">
              Automatically capture after delay
            </p>
          </Label>
          <Switch
            id="auto-capture"
            checked={localSettings.autoCapture}
            onCheckedChange={handleAutoCaptureChange}
          />
        </div>

        {/* Capture Delay (if auto-capture is on) */}
        {localSettings.autoCapture && (
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Capture Delay</span>
              <span className="text-sm text-muted-foreground">{localSettings.captureDelay}s</span>
            </Label>
            <Slider
              value={[localSettings.captureDelay]}
              onValueChange={handleCaptureDelayChange}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {/* Grid Overlay */}
        <div className="flex items-center justify-between">
          <Label htmlFor="grid" className="flex-1">
            <div>Grid Overlay</div>
            <p className="text-xs text-muted-foreground font-normal">
              Show composition grid
            </p>
          </Label>
          <Switch
            id="grid"
            checked={localSettings.enableGrid}
            onCheckedChange={handleGridChange}
          />
        </div>

        {/* Mirror Image */}
        <div className="flex items-center justify-between">
          <Label htmlFor="mirror" className="flex-1">
            <div>Mirror Image</div>
            <p className="text-xs text-muted-foreground font-normal">
              Flip image horizontally
            </p>
          </Label>
          <Switch
            id="mirror"
            checked={localSettings.mirror}
            onCheckedChange={handleMirrorChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}