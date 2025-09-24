"use client"

import React, { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getDeviceType, likelyHasCamera } from '@/lib/fast-device-detection'

interface PerformanceMetrics {
  detectionTime: number
  deviceType: string
  cameraDetected: boolean
  renderTime: number
  timestamp: number
}

/**
 * Performance monitoring for camera detection and interface switching
 * Shows real-time metrics during development
 */
export function CameraPerformanceMonitor(): JSX.Element | null {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [showMonitor, setShowMonitor] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return

    const startTime = performance.now()
    
    // Measure device detection performance
    const deviceType = getDeviceType()
    const cameraDetected = likelyHasCamera()
    const detectionTime = performance.now() - startTime
    
    // Measure render time
    const renderStartTime = performance.now()
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStartTime
      
      setMetrics({
        detectionTime,
        deviceType,
        cameraDetected,
        renderTime,
        timestamp: Date.now()
      })
      setShowMonitor(true)
    })
  }, [])

  // Hide in production
  if (process.env.NODE_ENV !== 'development' || !metrics || !showMonitor) {
    return null
  }

  const getPerformanceColor = (time: number): string => {
    if (time < 10) return 'bg-green-500' // Excellent
    if (time < 50) return 'bg-yellow-500' // Good
    return 'bg-red-500' // Needs improvement
  }

  return (
    <Card className="fixed bottom-4 right-4 p-3 text-xs bg-black/90 text-white border-gray-700 z-50">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="font-mono font-semibold">Camera Performance</span>
      </div>
      
      <div className="space-y-1 font-mono">
        <div className="flex items-center justify-between gap-4">
          <span>Detection:</span>
          <Badge 
            variant="outline" 
            className={`${getPerformanceColor(metrics.detectionTime)} text-white border-0`}
          >
            {metrics.detectionTime.toFixed(1)}ms
          </Badge>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span>Render:</span>
          <Badge 
            variant="outline" 
            className={`${getPerformanceColor(metrics.renderTime)} text-white border-0`}
          >
            {metrics.renderTime.toFixed(1)}ms
          </Badge>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span>Device:</span>
          <Badge variant="secondary">{metrics.deviceType}</Badge>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span>Camera:</span>
          <Badge 
            variant={metrics.cameraDetected ? "default" : "destructive"}
          >
            {metrics.cameraDetected ? '✓' : '✗'}
          </Badge>
        </div>
        
        {metrics.detectionTime < 10 && (
          <div className="text-green-400 text-center mt-2">
            ⚡ Instant Detection Achieved!
          </div>
        )}
      </div>
    </Card>
  )
}