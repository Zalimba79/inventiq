"use client"

import { HelpCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { Card } from '@/components/ui/card'
import { 
  deviceDetector, 
  type DeviceType, 
  type DeviceCapabilities 
} from '@/lib/device-detection'
import { checkCameraPermission } from '@/lib/safe-camera-access'

import { IOSCaptureInterface } from './IosCaptureInterface'
import { WebcamCaptureInterface } from './WebcamCaptureInterface'

interface AdaptiveCaptureInterfaceProps {
  onCapture: (imageData: string) => void
  className?: string
  forceDevice?: DeviceType // Allow manual override for testing
}

/**
 * Adaptive capture interface that automatically selects
 * the best capture UI based on the detected device
 */
export function AdaptiveCaptureInterface({
  onCapture,
  className,
  forceDevice
}: AdaptiveCaptureInterfaceProps): JSX.Element {
  const [deviceType, setDeviceType] = useState<DeviceType>('unknown')
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const detectDevice = async (): Promise<void> => {
      try {
        // Check camera permission status first
        const permissionStatus = await checkCameraPermission()
        
        // If permission is denied, skip device detection
        if (permissionStatus === 'denied') {
          setDeviceType('unknown')
          setIsLoading(false)
          return
        }
        
        const caps = await deviceDetector.getCapabilities()
        setCapabilities(caps)
        setDeviceType(forceDevice ?? caps.type)
      } catch (error) {
        console.error('Error detecting device:', error)
        setDeviceType('unknown')
      } finally {
        setIsLoading(false)
      }
    }

    void detectDevice()
  }, [forceDevice])


  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Detecting device capabilities...</p>
        </Card>
      </div>
    )
  }

  // Unknown device fallback
  if (deviceType === 'unknown' || (capabilities && !capabilities.hasCamera)) {
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

// Export a hook for device info
export function useDeviceInfo(): { type: DeviceType; capabilities: DeviceCapabilities | null } {
  const [deviceInfo, setDeviceInfo] = useState<{
    type: DeviceType
    capabilities: DeviceCapabilities | null
  }>({
    type: 'unknown',
    capabilities: null
  })

  useEffect(() => {
    const loadDeviceInfo = async (): Promise<void> => {
      const caps = await deviceDetector.getCapabilities()
      setDeviceInfo({
        type: caps.type,
        capabilities: caps
      })
    }

    void loadDeviceInfo()
  }, [])

  return deviceInfo
}