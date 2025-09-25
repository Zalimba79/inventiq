"use client"

import { Disc, Move, RotateCw, ZoomIn, Package, Layers } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RightSidebarProps {
  className?: string
}

/**
 * Right sidebar with turntable and position controls
 * Inspired by Orbitvu Station interface
 */
export function RightSidebar({ className }: RightSidebarProps): JSX.Element {
  const [rotation, setRotation] = useState(0)
  const [selectedView, setSelectedView] = useState<'still' | 'multi' | '360' | 'video'>('still')
  
  const handleRotate = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360)
  }
  
  return (
    <div className={cn("bg-card text-card-foreground p-2 overflow-y-auto border-l border-border", className)}>
      <div className="space-y-3">
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
          <h3 className="text-xs font-semibold uppercase">Zoom</h3>
        </div>
        
        <div className="flex gap-1">
          <Button size="sm" className="flex-1 h-7 text-xs bg-slate-700 hover:bg-slate-600">
            -
          </Button>
          <div className="flex-1 text-center text-xs py-1">100%</div>
          <Button size="sm" className="flex-1 h-7 text-xs bg-slate-700 hover:bg-slate-600">
            +
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