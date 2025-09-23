"use client"

import { 
  HardDrive,
  TrendingUp,
  AlertTriangle,
  Info,
  Trash2
} from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StorageWidgetProps {
  used: number
  limit: number
  onClearStorage?: () => void
  className?: string
  showDetails?: boolean
}

export function StorageWidget({
  used,
  limit,
  onClearStorage,
  className,
  showDetails = true
}: StorageWidgetProps): JSX.Element {
  const percentage = Math.min((used / limit) * 100, 100)
  const isWarning = percentage > 80
  const isCritical = percentage > 90

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`
  }

  const getStorageColor = (): string => {
    if (isCritical) return 'text-red-600 dark:text-red-400'
    if (isWarning) return 'text-orange-600 dark:text-orange-400'
    return 'text-blue-600 dark:text-blue-400'
  }

  const getProgressColor = (): string => {
    if (isCritical) return 'bg-red-500'
    if (isWarning) return 'bg-orange-500'
    return 'bg-gradient-to-r from-blue-500 to-purple-500'
  }

  const getStatusIcon = (): React.ReactNode => {
    if (isCritical) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (isWarning) return <AlertTriangle className="h-4 w-4 text-orange-500" />
    return <TrendingUp className="h-4 w-4 text-green-500" />
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage
          </CardTitle>
          {(isWarning || isCritical) && getStatusIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Used</span>
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold", getStorageColor())}>
                {formatBytes(used)}
              </span>
              <span className="text-muted-foreground">
                / {formatBytes(limit)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  getProgressColor()
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div 
              className="absolute top-1/2 -translate-y-1/2 text-[10px] font-medium text-white"
              style={{ left: `${Math.min(percentage - 5, 85)}%` }}
            >
              {Math.round(percentage)}%
            </div>
          </div>

          {/* Scale */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Details Section */}
        {showDetails && (
          <div className="space-y-2 pt-2 border-t">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Photos</p>
                <p className="font-medium">
                  {Math.round((used * 0.7) / (1024 * 1024))} MB
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Data</p>
                <p className="font-medium">
                  {Math.round((used * 0.3) / (1024 * 1024))} MB
                </p>
              </div>
            </div>

            {/* Status Messages */}
            {isCritical && (
              <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-red-900 dark:text-red-100">
                    Storage Critical
                  </p>
                  <p className="text-red-700 dark:text-red-300">
                    Clear some data to continue using the app
                  </p>
                </div>
              </div>
            )}

            {isWarning && !isCritical && (
              <div className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <Info className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Storage Warning
                  </p>
                  <p className="text-orange-700 dark:text-orange-300">
                    You&apos;re running low on storage space
                  </p>
                </div>
              </div>
            )}

            {!isWarning && !isCritical && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Storage usage normal</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {onClearStorage && (isWarning || isCritical) && (
          <div className="pt-2">
            <Button
              variant={isCritical ? "destructive" : "outline"}
              size="sm"
              className="w-full gap-2"
              onClick={onClearStorage}
            >
              <Trash2 className="h-4 w-4" />
              Clear Storage
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}