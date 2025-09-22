"use client"

import { Settings, Camera, ImageIcon, Hash } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

export interface CameraConfig {
  resolution: string
  quality: number
  photosPerProduct: number
  autoAdvance: boolean
  showGrid: boolean
  captureSound: boolean
}

interface CameraSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: CameraConfig
  onConfigChange: (config: CameraConfig) => void
}

const RESOLUTIONS = [
  { value: '800x600', label: 'Standard (800x600)' },
  { value: '1280x720', label: 'HD 720p (1280x720)' },
  { value: '1920x1080', label: 'Full HD 1080p (1920x1080)' },
  { value: '2560x1440', label: '2K 1440p (2560x1440)' },
  { value: '3840x2160', label: '4K UHD (3840x2160) - MX Brio' },
  { value: '4096x2160', label: '4K Cinema (4096x2160) - Pro' },
]

export function CameraSettingsDialog({
  open,
  onOpenChange,
  config,
  onConfigChange
}: CameraSettingsDialogProps) {
  const handleChange = (key: keyof CameraConfig, value: string | number | boolean) => {
    onConfigChange({ ...config, [key]: value })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Camera Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Resolution */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Camera Resolution
            </Label>
            <Select value={config.resolution} onValueChange={(v) => handleChange('resolution', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOLUTIONS.map(res => (
                  <SelectItem key={res.value} value={res.value}>
                    {res.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Higher resolution = better quality but larger files
            </p>
          </div>

          <Separator />

          {/* Image Quality */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                JPEG Quality
              </Label>
              <span className="text-sm font-medium">{config.quality}%</span>
            </div>
            <Slider
              value={[config.quality]}
              onValueChange={(v) => handleChange('quality', v[0])}
              min={60}
              max={100}
              step={5}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller files</span>
              <span>Better quality</span>
            </div>
          </div>

          <Separator />

          {/* Photos per Product */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Photos per Product
              </Label>
              <span className="text-sm font-medium">{config.photosPerProduct}</span>
            </div>
            <Slider
              value={[config.photosPerProduct]}
              onValueChange={(v) => handleChange('photosPerProduct', v[0])}
              min={1}
              max={10}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 3-5 photos for good coverage
            </p>
          </div>

          <Separator />

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-advance">Auto-advance</Label>
                <p className="text-xs text-muted-foreground">
                  Create product after reaching photo limit
                </p>
              </div>
              <Switch
                id="auto-advance"
                checked={config.autoAdvance}
                onCheckedChange={(v) => handleChange('autoAdvance', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-grid">Composition Grid</Label>
                <p className="text-xs text-muted-foreground">
                  Rule of thirds overlay
                </p>
              </div>
              <Switch
                id="show-grid"
                checked={config.showGrid}
                onCheckedChange={(v) => handleChange('showGrid', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="capture-sound">Capture Sound</Label>
                <p className="text-xs text-muted-foreground">
                  Play shutter sound on capture
                </p>
              </div>
              <Switch
                id="capture-sound"
                checked={config.captureSound}
                onCheckedChange={(v) => handleChange('captureSound', v)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}