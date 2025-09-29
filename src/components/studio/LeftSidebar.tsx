"use client"

import { Camera, Sliders, Lightbulb, Grid3x3, Move, Circle, RotateCw } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

import { CameraSelector } from './CameraSelector'
import { NoTestResolutionSelector } from './NoTestResolutionSelector'


interface LeftSidebarProps {
  onCameraChange: (deviceId: string) => void
  onResolutionChange: (width: number, height: number) => void
  selectedCamera: string
  onToggleGrid?: () => void
  onToggleCross?: () => void
  onToggleGoldenRatio?: () => void
  onToggle360?: () => void
  showGrid?: boolean
  showCross?: boolean
  showGoldenRatio?: boolean
  show360?: boolean
  className?: string
}

/**
 * Left sidebar with camera and capture settings
 * Inspired by Orbitvu Station interface
 */
export function LeftSidebar({ 
  onCameraChange,
  onResolutionChange,
  selectedCamera,
  onToggleGrid,
  onToggleCross,
  onToggleGoldenRatio,
  onToggle360,
  showGrid = false,
  showCross = false,
  showGoldenRatio = false,
  show360 = false,
  className 
}: LeftSidebarProps): JSX.Element {
  
  return (
    <div className={cn("bg-card text-card-foreground p-2 overflow-y-auto border-r border-border", className)}>
      <div className="space-y-3">
      {/* Camera Settings */}
      <Card className="bg-background border-border p-3">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase">Camera Settings</h3>
        </div>
        
        <div className="space-y-3">
          <CameraSelector 
            onCameraChange={onCameraChange}
            className="text-xs"
          />
          
          <NoTestResolutionSelector
            deviceId={selectedCamera}
            onResolutionChange={onResolutionChange}
            className="text-xs"
          />
        </div>
      </Card>
      
      {/* Lighting Controls (Placeholder) */}
      <Card className="bg-background border-border p-3">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase">Lighting</h3>
        </div>
        
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Brightness</Label>
            <Slider defaultValue={[75]} max={100} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Contrast</Label>
            <Slider defaultValue={[50]} max={100} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Temperature</Label>
            <Slider defaultValue={[50]} max={100} className="mt-1" />
          </div>
        </div>
      </Card>
      
      {/* Grid & Guides (Placeholder) */}
      <Card className="bg-background border-border p-3">
        <div className="flex items-center gap-2 mb-3">
          <Grid3x3 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase">Guides</h3>
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleGrid}
            className={cn(
              "w-full h-7 text-xs",
              showGrid 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-secondary border-border hover:bg-secondary/80"
            )}
          >
            <Grid3x3 className="h-3 w-3 mr-1" />
            Grid Overlay
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleCross}
            className={cn(
              "w-full h-7 text-xs",
              showCross 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-secondary border-border hover:bg-secondary/80"
            )}
          >
            <Move className="h-3 w-3 mr-1" />
            Center Cross
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleGoldenRatio}
            className={cn(
              "w-full h-7 text-xs",
              showGoldenRatio 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-secondary border-border hover:bg-secondary/80"
            )}
          >
            <Circle className="h-3 w-3 mr-1" />
            Golden Ratio
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggle360}
            className={cn(
              "w-full h-7 text-xs",
              show360 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-secondary border-border hover:bg-secondary/80"
            )}
          >
            <RotateCw className="h-3 w-3 mr-1" />
            360° Markers
          </Button>
        </div>
      </Card>
      
      {/* Advanced Settings (Placeholder) */}
      <Card className="bg-background border-border p-3">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase">Advanced</h3>
        </div>
        
        <div className="space-y-2 text-xs text-slate-400">
          <div>ISO: Auto</div>
          <div>Shutter: 1/60</div>
          <div>Aperture: f/5.6</div>
          <div>White Balance: Auto</div>
        </div>
      </Card>
      </div>
    </div>
  )
}