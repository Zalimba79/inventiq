"use client"

import { RotateCcw } from 'lucide-react'
import React from 'react'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { 
  type CameraConfiguration, 
  RESOLUTION_OPTIONS, 
  IMAGE_FORMAT_OPTIONS,
  type CameraResolution,
  type ImageFormat
} from '@/lib/camera/camera-config'

interface UnifiedCameraSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: CameraConfiguration
  onConfigChange: (config: Partial<CameraConfiguration>) => void
  onReset?: () => void
}

export function UnifiedCameraSettings({
  open,
  onOpenChange,
  config,
  onConfigChange,
  onReset
}: UnifiedCameraSettingsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Camera Settings</DialogTitle>
          <DialogDescription>
            Configure camera capture settings for optimal product photos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Resolution */}
          <div className="grid gap-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Select 
              value={config.resolution} 
              onValueChange={(value: CameraResolution) => onConfigChange({ resolution: value })}
            >
              <SelectTrigger id="resolution">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RESOLUTION_OPTIONS).map(([value, details]) => (
                  <SelectItem key={value} value={value}>
                    {details.label} ({details.width}x{details.height})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Quality */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="quality">Image Quality</Label>
              <span className="text-sm text-muted-foreground">{config.quality}%</span>
            </div>
            <Slider
              id="quality"
              min={50}
              max={100}
              step={5}
              value={[config.quality]}
              onValueChange={([value]) => onConfigChange({ quality: value })}
            />
          </div>

          {/* Image Format */}
          <div className="grid gap-2">
            <Label htmlFor="format">Image Format</Label>
            <Select 
              value={config.format} 
              onValueChange={(value: ImageFormat) => onConfigChange({ format: value })}
            >
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(IMAGE_FORMAT_OPTIONS).map(([value, details]) => (
                  <SelectItem key={value} value={value}>
                    {details.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Photos Per Product */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="photos-per-product">Photos Per Product</Label>
              <span className="text-sm text-muted-foreground">{config.photosPerProduct}</span>
            </div>
            <Slider
              id="photos-per-product"
              min={1}
              max={10}
              step={1}
              value={[config.photosPerProduct]}
              onValueChange={([value]) => onConfigChange({ photosPerProduct: value })}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-advance">Auto Advance</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create product after reaching photo limit
                </p>
              </div>
              <Switch
                id="auto-advance"
                checked={config.autoAdvance}
                onCheckedChange={(checked) => onConfigChange({ autoAdvance: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-grid">Show Grid</Label>
                <p className="text-sm text-muted-foreground">
                  Display grid overlay for better composition
                </p>
              </div>
              <Switch
                id="show-grid"
                checked={config.showGrid}
                onCheckedChange={(checked) => onConfigChange({ showGrid: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-guide">Show Photography Guide</Label>
                <p className="text-sm text-muted-foreground">
                  Display tips for better product photos
                </p>
              </div>
              <Switch
                id="show-guide"
                checked={config.showGuide}
                onCheckedChange={(checked) => onConfigChange({ showGuide: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="capture-sound">Capture Sound</Label>
                <p className="text-sm text-muted-foreground">
                  Play sound when photo is captured
                </p>
              </div>
              <Switch
                id="capture-sound"
                checked={config.captureSound}
                onCheckedChange={(checked) => onConfigChange({ captureSound: checked })}
              />
            </div>
          </div>
        </div>

        {onReset && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}