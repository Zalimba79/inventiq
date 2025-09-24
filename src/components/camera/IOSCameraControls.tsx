"use client"

import { Camera, FlipHorizontal2, Grid, Zap, ZapOff } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface IOSCameraControlsProps {
  facingMode: 'user' | 'environment'
  showGrid: boolean
  flashMode: 'off' | 'on'
  zoom: number
  isCapturing: boolean
  onToggleCamera: () => void
  onToggleGrid: () => void
  onToggleFlash: () => void
  onZoomChange: (value: number[]) => void
  onCapture: () => void
  onNativeCapture: () => void
}

/**
 * iOS-specific camera controls with native patterns
 */
export function IOSCameraControls({
  facingMode,
  showGrid,
  flashMode,
  zoom,
  isCapturing,
  onToggleCamera,
  onToggleGrid,
  onToggleFlash,
  onZoomChange,
  onCapture,
  onNativeCapture
}: IOSCameraControlsProps): JSX.Element {
  return (
    <>
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFlash}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            {flashMode === 'on' ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleGrid}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <Grid className={`h-4 w-4 ${showGrid ? 'text-yellow-400' : 'text-white'}`} />
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCamera}
          className="bg-black/50 hover:bg-black/70 text-white"
        >
          <FlipHorizontal2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Control (Side) */}
      {zoom > 1 && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
          <div className="bg-black/50 p-2 rounded-full">
            <Slider
              orientation="vertical"
              value={[zoom]}
              max={3}
              min={1}
              step={0.1}
              onValueChange={onZoomChange}
              className="h-32"
            />
            <div className="text-white text-xs text-center mt-2">
              {zoom.toFixed(1)}x
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-20 px-8">
        <div className="flex items-center gap-8">
          {/* Native iOS Camera Button */}
          <Button
            variant="ghost"
            size="lg"
            onClick={onNativeCapture}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full"
            disabled={isCapturing}
          >
            <Camera className="h-6 w-6" />
          </Button>

          {/* WebRTC Capture Button */}
          <div className="relative">
            <Button
              onClick={onCapture}
              disabled={isCapturing}
              className={`
                w-20 h-20 rounded-full bg-white/90 hover:bg-white 
                border-4 border-white/50 transition-all duration-200
                ${isCapturing ? 'scale-95 bg-white/50' : 'active:scale-95'}
              `}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-lg" />
            </Button>
            
            {/* Capture ring animation */}
            {isCapturing && (
              <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-pulse" />
            )}
          </div>

          {/* Spacer for symmetry */}
          <div className="w-16 h-16" />
        </div>
      </div>
    </>
  )
}