"use client"

import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Package,
  Camera,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react'
import React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Stat {
  label: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  iconType?: 'package' | 'camera' | 'clock' | 'check-circle'
}

interface StatsCardProps {
  stats: Stat[]
  className?: string
}

export function StatsCard({ stats, className }: StatsCardProps): JSX.Element {
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable', value?: number | string): React.ReactNode => {
    // Don't show trend for 0% success rate
    if (value === '0%' || value === 0) return null
    
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getIcon = (iconType?: 'package' | 'camera' | 'clock' | 'check-circle'): React.ReactNode => {
    switch (iconType) {
      case 'package':
        return <Package className="h-5 w-5" />
      case 'camera':
        return <Camera className="h-5 w-5" />
      case 'clock':
        return <Clock className="h-5 w-5" />
      case 'check-circle':
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const formatValue = (stat: Stat): string => {
    // Special handling for 0% success rate
    if (stat.label === 'Success Rate' && stat.value === '0%') {
      return 'Ready'
    }
    return String(stat.value)
  }

  const formatChange = (change?: number, value?: number | string): string | null => {
    // Don't show change for very small numbers
    if (typeof value === 'number' && value < 10 && change) {
      return null
    }
    if (value === '0%' || value === 0) {
      return null
    }
    if (change === undefined) return null
    
    return `${change > 0 ? '+' : ''}${change}% from last period`
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="text-muted-foreground">
                {getIcon(stat.iconType)}
              </div>
              {getTrendIcon(stat.trend, stat.value)}
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">
                {formatValue(stat)}
                {stat.label === 'Success Rate' && stat.value === '0%' && (
                  <Sparkles className="inline-block h-5 w-5 ml-1 text-muted-foreground" />
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              {formatChange(stat.change, stat.value) && (
                <p className={cn(
                  "text-xs mt-1",
                  stat.change && stat.change > 0 ? "text-green-500" : stat.change && stat.change < 0 ? "text-red-500" : "text-gray-500"
                )}>
                  {formatChange(stat.change, stat.value)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}