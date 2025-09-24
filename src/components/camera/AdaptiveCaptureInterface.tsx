"use client"

import { HelpCircle } from 'lucide-react'
import React from 'react'

import { Card } from '@/components/ui/card'
import { 
  getDeviceType,
  likelyHasCamera,
  type DeviceType
} from '@/lib/fast-device-detection'

import { IOSCaptureInterface } from './IosCaptureInterface'
import { WebcamCaptureInterface } from './WebcamCaptureInterface'

interface AdaptiveCaptureInterfaceProps {
  onCapture: (imageData: string) => void
  className?: string
  forceDevice?: DeviceType // Allow manual override for testing
}

/**
 * Adaptive capture interface with instant device detection
 * - Zero loading state (synchronous detection)
 * - Smooth interface switching
 * - Optimized performance patterns
 */
export function AdaptiveCaptureInterface({
  onCapture,
  className,
  forceDevice
}: AdaptiveCaptureInterfaceProps): JSX.Element {
  // ⚡ INSTANT: Fast synchronous device detection - no camera access needed
  const deviceType = forceDevice ?? getDeviceType()
  const hasCamera = likelyHasCamera()
  
  // 🚀 PERFORMANCE: No loading state needed - detection is instant!


  // Unknown device or no camera fallback
  if (deviceType === 'unknown' || !hasCamera) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Camera Not Available</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We could not detect a camera on your device or browser permissions are denied.
          </p>
          <p className="text-xs text-muted-foreground">
            Please check your browser settings and allow camera access, or use the file upload option instead.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Render appropriate interface based on device - no badge, automatic */}
      {deviceType === 'ios' && (
        <IOSCaptureInterface onCapture={onCapture} className={className} />
      )}
      
      {deviceType === 'android' && (
        // For now, Android uses iOS interface until we build specific Android optimizations
        <IOSCaptureInterface onCapture={onCapture} className={className} />
      )}
      
      {deviceType === 'desktop' && (
        <WebcamCaptureInterface onCapture={onCapture} className={className} />
      )}
    </div>
  )
}

// Export a hook for device info (fast version)
export function useDeviceInfo(): { type: DeviceType; hasCamera: boolean } {
  return {
    type: getDeviceType(),
    hasCamera: likelyHasCamera()
  }
}