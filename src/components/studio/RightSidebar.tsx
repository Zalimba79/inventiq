"use client"

import { Disc, Move, ZoomIn, Package, Layers, Hash } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface RightSidebarProps {
  className?: string
  quantity?: number
  onQuantityChange?: (quantity: number) => void
  zoomLevel?: number
  onZoomChange?: (zoom: number) => void
}

/**
 * Right sidebar with turntable and position controls
 * Inspired by Orbitvu Station interface
 */
export function RightSidebar({ 
  className,
  quantity = 1,
  onQuantityChange,
  zoomLevel = 100,
  onZoomChange
}: RightSidebarProps): JSX.Element {
  const [rotation, setRotation] = useState(0)
  const [selectedView, setSelectedView] = useState<'still' | 'multi' | '360' | 'video'>('still')
  const [localQuantity, setLocalQuantity] = useState(quantity.toString())
  const [localZoom, setLocalZoom] = useState(zoomLevel)
  
  const handleRotate = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360)
  }
  
  const handleQuantityChange = (value: string) => {
    setLocalQuantity(value)
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0) {
      onQuantityChange?.(numValue)
    }
  }
  
  const adjustQuantity = (delta: number) => {
    const current = parseInt(localQuantity, 10) || 0
    const newValue = Math.max(0, current + delta)
    handleQuantityChange(newValue.toString())
  }
  
  const handleZoomChange = (delta: number) => {
    const newZoom = Math.max(100, Math.min(300, localZoom + delta))
    setLocalZoom(newZoom)
    onZoomChange?.(newZoom)
  }
  
  const handleZoomReset = () => {
    setLocalZoom(100)
    onZoomChange?.(100)
  }
  
  return (
    <div className={cn("bg-card text-card-foreground p-2 overflow-y-auto border-l border-border", className)}>
      <div className="space-y-3">
      
      {/* Quantity Input */}
      <Card className="bg-background border-border p-3">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase">Bestand / Quantity</h3>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => adjustQuantity(-1)}
            disabled={localQuantity === '0'}
            className="h-8 w-8 p-0 bg-secondary hover:bg-secondary/80 border-border"
          >
            -
          </Button>
          
          <Input
            type="number"
            value={localQuantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="h-8 text-center bg-background border-border [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            min="0"
            step="1"
          />
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => adjustQuantity(1)}
            className="h-8 w-8 p-0 bg-secondary hover:bg-secondary/80 border-border"
          >
            +
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-1 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuantityChange('1')}
            className="h-6 text-xs bg-secondary hover:bg-secondary/80 border-border"
          >
            1
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuantityChange('5')}
            className="h-6 text-xs bg-secondary hover:bg-secondary/80 border-border"
          >
            5
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuantityChange('10')}
            className="h-6 text-xs bg-secondary hover:bg-secondary/80 border-border"
          >
            10
          </Button>
        </div>
      </Card>
      
      {/* View Mode Selector */}
      <Card className="bg-background border-border p-3">
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase">View Mode</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant={selectedView === 'still' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('still')}
            className={cn(
              "h-7 text-xs",
              selectedView === 'still' 
                ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                : "bg-secondary border-border hover:bg-secondary/80"
            )}
          >
            STILL
          </Button>
          <Button
            variant={selectedView === 'multi' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('multi')}
            className={cn(
              "h-7 text-xs",
              selectedView === 'multi' 
                ? "bg-cyan-500 hover:bg-cyan-600 text-black" 
                : "bg-slate-700 border-slate-600 hover:bg-slate-600"
            )}
          >
            MULTI
          </Button>
          <Button
            variant={selectedView === '360' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('360')}
            className={cn(
              "h-7 text-xs",
              selectedView === '360' 
                ? "bg-cyan-500 hover:bg-cyan-600 text-black" 
                : "bg-slate-700 border-slate-600 hover:bg-slate-600"
            )}
          >
            360°
          </Button>
          <Button
            variant={selectedView === 'video' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('video')}
            className={cn(
              "h-7 text-xs",
              selectedView === 'video' 
                ? "bg-cyan-500 hover:bg-cyan-600 text-black" 
                : "bg-slate-700 border-slate-600 hover:bg-slate-600"
            )}
          >
            VIDEO
          </Button>
        </div>
      </Card>
      
      {/* Turntable Control */}
      <Card className="bg-background border-border p-3">
        <div className="flex items-center gap-2 mb-3">
          <Disc className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase">Turntable</h3>
        </div>
        
        {/* Circular Control */}
        <div className="relative w-32 h-32 mx-auto mb-3">
          <div className="absolute inset-0 rounded-full border-2 border-slate-600 bg-slate-700/50">
            {/* Rotation indicator */}
            <div 
              className="absolute inset-2 rounded-full border-2 border-primary"
              style={{
                background: `conic-gradient(from ${rotation}deg, transparent 0deg, cyan 30deg, transparent 30deg)`
              }}
            />
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary" />
            {/* Rotation value */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-mono mt-6">
              {rotation}°
            </div>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex gap-1 justify-center">
          <Button 
            size="sm" 
            onClick={() => handleRotate(-90)}
            className="h-6 px-2 text-xs bg-slate-700 hover:bg-slate-600"
          >
            -90°
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleRotate(-15)}
            className="h-6 px-2 text-xs bg-slate-700 hover:bg-slate-600"
          >
            -15°
          </Button>
          <Button 
            size="sm" 
            onClick={() => setRotation(0)}
            className="h-6 px-2 text-xs bg-cyan-500 hover:bg-cyan-600 text-black"
          >
            0°
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleRotate(15)}
            className="h-6 px-2 text-xs bg-slate-700 hover:bg-slate-600"
          >
            +15°
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleRotate(90)}
            className="h-6 px-2 text-xs bg-slate-700 hover:bg-slate-600"
          >
            +90°
          </Button>
        </div>
      </Card>
      
      {/* Position Controls */}
      <Card className="bg-background border-border p-3">
        <div className="flex items-center gap-2 mb-3">
          <Move className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase">Position</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-1">
          <Button size="sm" className="h-6 p-0 bg-slate-700 hover:bg-slate-600">↖</Button>
          <Button size="sm" className="h-6 p-0 bg-slate-700 hover:bg-slate-600">↑</Button>
          <Button size="sm" className="h-6 p-0 bg-slate-700 hover:bg-slate-600">↗</Button>
          <Button size="sm" className="h-6 p-0 bg-slate-700 hover:bg-slate-600">←</Button>
          <Button size="sm" className="h-6 p-0 bg-cyan-500 hover:bg-cyan-600 text-black">●</Button>
          <Button size="sm" className="h-6 p-0 bg-slate-700 hover:bg-slate-600">→</Button>
          <Button size="sm" className="h-6 p-0 bg-slate-700 hover:bg-slate-600">↙</Button>
          <Button size="sm" className="h-6 p-0 bg-slate-700 hover:bg-slate-600">↓</Button>
          <Button size="sm" className="h-6 p-0 bg-slate-700 hover:bg-slate-600">↘</Button>
        </div>
      </Card>
      
      {/* Zoom Control */}
      <Card className="bg-background border-border p-3">
        <div className="flex items-center gap-2 mb-3">
          <ZoomIn className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase">Digital Zoom</h3>
        </div>
        
        <div className="flex gap-1 mb-2">
          <Button 
            size="sm" 
            className="flex-1 h-7 text-xs bg-slate-700 hover:bg-slate-600"
            onClick={() => handleZoomChange(-10)}
          >
            -
          </Button>
          <Button 
            size="sm"
            className="flex-1 text-center text-xs h-7 bg-slate-800"
            onClick={handleZoomReset}
          >
            {localZoom}%
          </Button>
          <Button 
            size="sm" 
            className="flex-1 h-7 text-xs bg-slate-700 hover:bg-slate-600"
            onClick={() => handleZoomChange(10)}
          >
            +
          </Button>
        </div>
        
        {/* Quick zoom buttons */}
        <div className="grid grid-cols-4 gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setLocalZoom(100); onZoomChange?.(100) }}
            className={cn(
              "h-6 text-xs",
              localZoom === 100 ? "bg-primary text-primary-foreground" : "bg-secondary border-border"
            )}
          >
            1x
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setLocalZoom(150); onZoomChange?.(150) }}
            className={cn(
              "h-6 text-xs",
              localZoom === 150 ? "bg-primary text-primary-foreground" : "bg-secondary border-border"
            )}
          >
            1.5x
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setLocalZoom(200); onZoomChange?.(200) }}
            className={cn(
              "h-6 text-xs",
              localZoom === 200 ? "bg-primary text-primary-foreground" : "bg-secondary border-border"
            )}
          >
            2x
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setLocalZoom(300); onZoomChange?.(300) }}
            className={cn(
              "h-6 text-xs",
              localZoom === 300 ? "bg-primary text-primary-foreground" : "bg-secondary border-border"
            )}
          >
            3x
          </Button>
        </div>
      </Card>
      
      {/* Positioning Layers */}
      <Card className="bg-background border-border p-3">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase">Layers</h3>
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="p-1 bg-slate-700 rounded">Background</div>
          <div className="p-1 bg-cyan-500/20 border border-cyan-500 rounded">Product</div>
          <div className="p-1 bg-slate-700 rounded">Shadow</div>
        </div>
      </Card>
      </div>
    </div>
  )
}