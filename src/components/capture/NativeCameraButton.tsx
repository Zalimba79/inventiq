"use client"

import React, { useRef, ChangeEvent } from 'react'
import { Camera, Smartphone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NativeCameraButtonProps {
  onCapture: (files: FileList) => void
  multiple?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * Native Camera Button Component
 * Provides access to device camera through native file input
 * Works on all devices but optimized for mobile
 */
export function NativeCameraButton({ 
  onCapture, 
  multiple = true, 
  className,
  children
}: NativeCameraButtonProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onCapture(files)
      // Reset input to allow capturing same image again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  const triggerCamera = () => {
    fileInputRef.current?.click()
  }
  
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={isMobile ? "environment" : undefined}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Camera input"
      />
      
      <Button
        onClick={triggerCamera}
        className={cn("gap-2", className)}
        variant="default"
      >
        {isMobile ? (
          <>
            <Smartphone className="h-4 w-4" />
            {children || 'Use Device Camera'}
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            {children || 'Select Photos'}
          </>
        )}
      </Button>
    </>
  )
}