"use client"

import { 
  Camera, 
  CheckCircle, 
  Clock, 
  Package,
  Sparkles
} from 'lucide-react'
import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Activity } from '@/services/dashboardService'

interface ActivityFeedProps {
  activities: Activity[]
  className?: string
}

export function ActivityFeed({ activities, className }: ActivityFeedProps): JSX.Element {
  const getActivityIcon = (type: Activity['type']): React.ReactNode => {
    switch (type) {
      case 'product_created':
        return <Package className="h-4 w-4" />
      case 'product_analyzed':
        return <Sparkles className="h-4 w-4" />
      case 'product_confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'photo_captured':
        return <Camera className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: Activity['type']): string => {
    switch (type) {
      case 'product_created':
        return 'bg-blue-100 text-blue-600'
      case 'product_analyzed':
        return 'bg-purple-100 text-purple-600'
      case 'product_confirmed':
        return 'bg-green-100 text-green-600'
      case 'photo_captured':
        return 'bg-orange-100 text-orange-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const formatTime = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  if (activities.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                getActivityColor(activity.type)
              )}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}