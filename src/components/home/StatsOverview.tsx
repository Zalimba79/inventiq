"use client"

import { 
  TrendingUp, 
  TrendingDown,
  Package,
  Camera,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { QuickStat } from '@/services/dashboardService'

interface StatsOverviewProps {
  stats: QuickStat[]
  className?: string
  showDetails?: boolean
}

interface StatCardProps {
  stat: QuickStat
  index: number
  showDetails: boolean
}

// Calculate progress percentage for visualization
const getProgressValue = (stat: QuickStat): number => {
  if (typeof stat.value === 'string' && stat.value.includes('%')) {
    return parseInt(stat.value.replace('%', ''))
  }
  if (typeof stat.value === 'number') {
    // Normalize to percentage (assuming max of 100 for demo)
    return Math.min((stat.value / 100) * 100, 100)
  }
  return 0
}

// Get progress class name based on value
const getProgressClass = (value: number): string => {
  // Round to nearest supported percentage
  if (value === 0) return 'progress-0'
  if (value <= 10) return 'progress-10'
  if (value <= 20) return 'progress-20'
  if (value <= 25) return 'progress-25'
  if (value <= 30) return 'progress-30'
  if (value <= 40) return 'progress-40'
  if (value <= 50) return 'progress-50'
  if (value <= 60) return 'progress-60'
  if (value <= 70) return 'progress-70'
  if (value <= 75) return 'progress-75'
  if (value <= 80) return 'progress-80'
  if (value <= 90) return 'progress-90'
  return 'progress-100'
}

function StatCard({ stat, index, showDetails }: StatCardProps): JSX.Element {
  
  const getIcon = (iconType?: string): React.ReactNode => {
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
        return <Activity className="h-5 w-5" />
    }
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable', change?: number): React.ReactNode => {
    if (!trend || trend === 'stable' || !change) {
      return null
    }
    
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const formatValue = (value: number | string): string => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
      }
      return value.toString()
    }
    return value
  }

  const getCardGradient = (index: number): string => {
    const gradients = [
      'from-blue-500/10 to-purple-500/10',
      'from-green-500/10 to-emerald-500/10',
      'from-orange-500/10 to-red-500/10',
      'from-purple-500/10 to-pink-500/10'
    ]
    return gradients[index % gradients.length]
  }

  const getProgressColor = (trend?: 'up' | 'down' | 'stable'): string => {
    if (trend === 'up') return 'bg-green-500'
    if (trend === 'down') return 'bg-red-500'
    return 'bg-blue-500'
  }


  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        "bg-gradient-to-br",
        getCardGradient(index)
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-2 rounded-lg",
            "bg-background/50 backdrop-blur-sm"
          )}>
            {getIcon(stat.iconType)}
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon(stat.trend, stat.change)}
            {stat.change && (
              <span className={cn(
                "text-xs font-medium",
                stat.trend === 'up' ? "text-green-600" : 
                stat.trend === 'down' ? "text-red-600" : 
                "text-gray-600"
              )}>
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">
              {formatValue(stat.value)}
            </p>
            {stat.label === 'Success Rate' && stat.value === '0%' && (
              <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>

        {showDetails && (
          <div className="mt-4 space-y-2">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  getProgressColor(stat.trend),
                  getProgressClass(getProgressValue(stat))
                )}
                data-progress={getProgressValue(stat)}
              />
            </div>
            {stat.change && (
              <p className="text-xs text-muted-foreground">
                {stat.trend === 'up' ? 'Increased' : 'Decreased'} by {Math.abs(stat.change)}% from last period
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function StatsOverview({ 
  stats, 
  className,
  showDetails = false
}: StatsOverviewProps): JSX.Element {
  // Group stats by priority for better layout
  const primaryStats = stats.slice(0, 4)
  const secondaryStats = stats.slice(4)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryStats.map((stat, index) => (
          <StatCard 
            key={`stat-${stat.label}-${index}`}
            stat={stat}
            index={index}
            showDetails={showDetails}
          />
        ))}
      </div>

      {/* Secondary Stats (if any) */}
      {secondaryStats.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Additional Metrics</CardTitle>
            <Link href="/analytics">
              <Button variant="ghost" size="sm" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {secondaryStats.map((stat, index) => (
                <div key={`secondary-stat-${index}`} className="space-y-1">
                  <p className="text-2xl font-semibold">
                    {formatValue(stat.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Card */}
      {showDetails && (
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats
                .filter(stat => stat.trend && stat.change)
                .map((stat, index) => (
                  <div key={`insight-${index}`} className="flex items-center gap-3">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      stat.trend === 'up' ? "bg-green-500" : 
                      stat.trend === 'down' ? "bg-red-500" : 
                      "bg-gray-500"
                    )} />
                    <p className="text-sm">
                      <span className="font-medium">{stat.label}</span> is{' '}
                      {stat.trend === 'up' ? 'trending up' : 'trending down'} by{' '}
                      <span className="font-semibold">{Math.abs(stat.change ?? 0)}%</span>
                    </p>
                  </div>
                ))}
              {stats.every(stat => !stat.trend || !stat.change) && (
                <p className="text-sm text-muted-foreground">
                  No significant trends detected. Keep monitoring your metrics.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}