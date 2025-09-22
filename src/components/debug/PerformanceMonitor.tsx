/**
 * Performance monitoring component for development
 * Shows real-time performance metrics for photo capture operations
 */

"use client"

import { Activity, Camera, Database, Zap } from 'lucide-react'
import React, { useState, useEffect, memo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getStorageQuota, type StorageQuotaInfo } from '@/lib/storage-utils'

interface PerformanceMetrics {
  captureTime: number
  processingTime: number
  storageTime: number
  totalTime: number
  imageSize: number
  compressionRatio: number
}

interface PerformanceMonitorProps {
  className?: string
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
}

export const PerformanceMonitor = memo(({
  className,
  onMetricsUpdate
}: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
  const [storageInfo, setStorageInfo] = useState<StorageQuotaInfo | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Update storage info periodically
    const updateStorageInfo = async (): Promise<void> => {
      const info = await getStorageQuota()
      setStorageInfo(info)
    }

    void updateStorageInfo()
    const interval = setInterval(() => { void updateStorageInfo() }, 5000) // Update every 5s

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Listen for performance events
    const handlePerformanceUpdate = (event: CustomEvent<PerformanceMetrics>): void => {
      const newMetrics = event.detail
      setMetrics(prev => [...prev.slice(-9), newMetrics]) // Keep last 10 metrics
      onMetricsUpdate?.(newMetrics)
    }

    window.addEventListener('performance-update', handlePerformanceUpdate as EventListener)
    return () => window.removeEventListener('performance-update', handlePerformanceUpdate as EventListener)
  }, [onMetricsUpdate])

  const averageMetrics = metrics.length > 0 ? {
    captureTime: metrics.reduce((sum, m) => sum + m.captureTime, 0) / metrics.length,
    processingTime: metrics.reduce((sum, m) => sum + m.processingTime, 0) / metrics.length,
    storageTime: metrics.reduce((sum, m) => sum + m.storageTime, 0) / metrics.length,
    totalTime: metrics.reduce((sum, m) => sum + m.totalTime, 0) / metrics.length,
    imageSize: metrics.reduce((sum, m) => sum + m.imageSize, 0) / metrics.length,
    compressionRatio: metrics.reduce((sum, m) => sum + m.compressionRatio, 0) / metrics.length,
  } : null

  if (!isVisible && process.env.NODE_ENV !== 'development') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="w-4 h-4" />
      </Button>
    )
  }

  if (!isVisible) return null

  return (
    <Card className={`fixed bottom-4 right-4 w-80 z-50 shadow-lg ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performance Monitor
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Storage Usage */}
        {storageInfo && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                Storage
              </span>
              <span>{storageInfo.percentage.toFixed(1)}% used</span>
            </div>
            <Progress 
              value={storageInfo.percentage} 
              className="h-1"
              max={100}
            />
            <div className="text-xs text-muted-foreground">
              {(storageInfo.used / 1024 / 1024).toFixed(1)}MB / {(storageInfo.total / 1024 / 1024).toFixed(1)}MB
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {averageMetrics && (
          <div className="space-y-2">
            <div className="text-xs font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Avg Performance ({metrics.length} samples)
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Capture</div>
                <Badge variant="outline" className="text-xs">
                  {averageMetrics.captureTime.toFixed(0)}ms
                </Badge>
              </div>
              
              <div>
                <div className="text-muted-foreground">Processing</div>
                <Badge variant="outline" className="text-xs">
                  {averageMetrics.processingTime.toFixed(0)}ms
                </Badge>
              </div>
              
              <div>
                <div className="text-muted-foreground">Storage</div>
                <Badge variant="outline" className="text-xs">
                  {averageMetrics.storageTime.toFixed(0)}ms
                </Badge>
              </div>
              
              <div>
                <div className="text-muted-foreground">Total</div>
                <Badge variant="outline" className="text-xs">
                  {averageMetrics.totalTime.toFixed(0)}ms
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Size</div>
                <Badge variant="outline" className="text-xs">
                  {(averageMetrics.imageSize / 1024).toFixed(0)}KB
                </Badge>
              </div>
              
              <div>
                <div className="text-muted-foreground">Compression</div>
                <Badge variant="outline" className="text-xs">
                  {(averageMetrics.compressionRatio * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Recent Performance */}
        {metrics.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium">Recent Captures</div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {metrics.slice(-3).reverse().map((metric, index) => (
                // Performance metrics don't have unique IDs, using index for display order
                // eslint-disable-next-line react/no-array-index-key
                <div key={index} className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    #{metrics.length - index}
                  </span>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {metric.totalTime.toFixed(0)}ms
                    </Badge>
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {(metric.imageSize / 1024).toFixed(0)}KB
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Status */}
        <div className="flex items-center justify-between text-xs">
          <span>Status</span>
          <Badge 
            variant={averageMetrics && averageMetrics.totalTime < 500 ? "default" : "destructive"}
            className="text-xs"
          >
            {averageMetrics && averageMetrics.totalTime < 500 ? "Good" : "Needs Optimization"}
          </Badge>
        </div>

        {/* Clear Data */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMetrics([])}
          className="w-full text-xs"
        >
          Clear Metrics
        </Button>
      </CardContent>
    </Card>
  )
})

/**
 * Hook to emit performance metrics
 */
export function usePerformanceEmitter(): { emitMetrics: (metrics: PerformanceMetrics) => void } {
  const emitMetrics = (metrics: PerformanceMetrics): void => {
    window.dispatchEvent(new CustomEvent('performance-update', { detail: metrics }))
  }

  return { emitMetrics }
}