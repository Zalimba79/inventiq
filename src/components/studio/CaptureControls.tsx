"use client"

import { Camera, Trash2, Save, Image as ImageIcon } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CaptureControlsProps {
  onCapture: () => void
  onClear: () => void
  onSave: () => void
  capturedCount: number
  isCapturing?: boolean
  className?: string
}

/**
 * Control buttons for capture workflow
 * Inspired by Orbitvu control panel
 * Max lines: ~100
 */
export function CaptureControls({ 
  onCapture,
  onClear,
  onSave,
  capturedCount,
  isCapturing = false,
  className 
}: CaptureControlsProps): JSX.Element {
  return (
    <Card className={cn("p-4", className)}>
      {/* Capture status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Captured Images
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{capturedCount}</span>
          <span className="text-sm text-muted-foreground">photos</span>
        </div>
      </div>
      
      {/* Main capture button */}
      <Button
        onClick={onCapture}
        disabled={isCapturing}
        size="lg"
        className="w-full mb-3 h-16"
      >
        <Camera className="h-6 w-6 mr-2" />
        {isCapturing ? 'Capturing...' : 'Capture Photo'}
      </Button>
      
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={onClear}
          variant="outline"
          disabled={capturedCount === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
        
        <Button
          onClick={onSave}
          variant="default"
          disabled={capturedCount === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Save ({capturedCount})
        </Button>
      </div>
      
      {/* Tips */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Position product in center, ensure good lighting, 
          and capture from multiple angles for best results.
        </p>
      </div>
    </Card>
  )
}