"use client"

import { Camera, Edit, Upload, Settings, HelpCircle } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TopToolbarProps {
  activeTab: 'capture' | 'edit' | 'publish'
  onTabChange: (tab: 'capture' | 'edit' | 'publish') => void
  className?: string
}

/**
 * Top toolbar with main navigation tabs
 * Inspired by Orbitvu Station interface
 */
export function TopToolbar({ 
  activeTab, 
  onTabChange,
  className 
}: TopToolbarProps): JSX.Element {
  return (
    <div className={cn("bg-background border-b border-border flex items-center justify-between px-2 py-1", className)}>
      {/* Left side - Logo/Title */}
      <div className="flex items-center gap-2">
        <div className="bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold rounded">
          INVENTIQ
        </div>
        <span className="text-xs text-muted-foreground">Studio</span>
      </div>
      
      {/* Center - Main Tabs */}
      <div className="flex gap-1">
        <Button
          variant={activeTab === 'capture' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('capture')}
          className={cn(
            "gap-1 h-7 px-3",
            activeTab === 'capture' 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Camera className="h-3.5 w-3.5" />
          CAPTURE
        </Button>
        
        <Button
          variant={activeTab === 'edit' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('edit')}
          className={cn(
            "gap-1 h-7 px-3",
            activeTab === 'edit' 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Edit className="h-3.5 w-3.5" />
          EDIT
        </Button>
        
        <Button
          variant={activeTab === 'publish' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('publish')}
          className={cn(
            "gap-1 h-7 px-3",
            activeTab === 'publish' 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          PUBLISH
        </Button>
      </div>
      
      {/* Right side - Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <Settings className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}