"use client"

import { 
  Lightbulb,
  RefreshCw,
  X,
  ChevronRight,
  Camera,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react'
import React, { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Tip {
  id: string
  title: string
  description: string
  category: 'capture' | 'ai' | 'workflow' | 'performance'
  icon: React.ReactNode
  actionLabel?: string
  actionPath?: string
}

interface TipsWidgetProps {
  className?: string
  onNavigate?: (path: string) => void
  showDismiss?: boolean
}

const allTips: Tip[] = [
  {
    id: 'lighting',
    title: 'Use Natural Lighting',
    description: 'Capture products near windows for better AI recognition accuracy',
    category: 'capture',
    icon: <Camera className="h-4 w-4" />
  },
  {
    id: 'angles',
    title: 'Multiple Angles',
    description: 'Take 3-5 photos from different angles for complete product coverage',
    category: 'capture',
    icon: <Camera className="h-4 w-4" />
  },
  {
    id: 'batch',
    title: 'Batch Processing',
    description: 'Select multiple products for AI analysis to save time',
    category: 'ai',
    icon: <Sparkles className="h-4 w-4" />,
    actionLabel: 'Try Now',
    actionPath: '/products/draft'
  },
  {
    id: 'quantity',
    title: 'Set Quantity Early',
    description: 'Add quantity during capture to streamline your workflow',
    category: 'workflow',
    icon: <Zap className="h-4 w-4" />
  },
  {
    id: 'validate',
    title: 'Review AI Results',
    description: 'Always verify AI-generated product details before confirming',
    category: 'ai',
    icon: <Shield className="h-4 w-4" />
  },
  {
    id: 'storage',
    title: 'Optimize Storage',
    description: 'Clear confirmed products periodically to free up space',
    category: 'performance',
    icon: <Zap className="h-4 w-4" />
  }
]

export function TipsWidget({
  className,
  onNavigate,
  showDismiss = true
}: TipsWidgetProps): JSX.Element {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [dismissedTips, setDismissedTips] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  // Filter out dismissed tips
  const availableTips = allTips.filter(tip => !dismissedTips.includes(tip.id))
  const currentTip = availableTips[currentTipIndex % availableTips.length]

  const handleNextTip = (): void => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentTipIndex((prev) => (prev + 1) % availableTips.length)
      setIsAnimating(false)
    }, 200)
  }

  const handlePreviousTip = (): void => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentTipIndex((prev) => 
        prev === 0 ? availableTips.length - 1 : prev - 1
      )
      setIsAnimating(false)
    }, 200)
  }

  const handleDismiss = (): void => {
    if (currentTip) {
      setDismissedTips(prev => [...prev, currentTip.id])
      if (availableTips.length > 1) {
        handleNextTip()
      }
    }
  }

  // Auto-rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      handleNextTip()
    }, 10000) // Change tip every 10 seconds

    return () => clearInterval(interval)
  }, [currentTipIndex, availableTips.length])

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'capture':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'ai':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'workflow':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'performance':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (availableTips.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6 text-center">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No tips available. You&apos;re all caught up!
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setDismissedTips([])}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset Tips
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Quick Tips
          </CardTitle>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {currentTipIndex + 1} / {availableTips.length}
            </span>
            {showDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleDismiss}
                aria-label="Dismiss tip"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Tip */}
        <div className={cn(
          "space-y-3 transition-opacity duration-200",
          isAnimating && "opacity-0"
        )}>
          {/* Category Badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn("text-xs", getCategoryColor(currentTip?.category ?? 'workflow'))}
            >
              {currentTip?.icon}
              <span className="ml-1 capitalize">{currentTip?.category}</span>
            </Badge>
          </div>

          {/* Tip Content */}
          <div>
            <h4 className="font-medium text-sm mb-1">
              {currentTip?.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {currentTip?.description}
            </p>
          </div>

          {/* Action Button */}
          {currentTip?.actionLabel && currentTip?.actionPath && onNavigate && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => onNavigate(currentTip.actionPath!)}
            >
              {currentTip.actionLabel}
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousTip}
            disabled={availableTips.length <= 1}
          >
            Previous
          </Button>

          {/* Indicators */}
          <div className="flex gap-1">
            {availableTips.map((_, index) => (
              <div
                key={`indicator-${index}`}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all",
                  index === currentTipIndex 
                    ? "bg-primary w-4" 
                    : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextTip}
            disabled={availableTips.length <= 1}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}