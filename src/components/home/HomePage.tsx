"use client"

import React, { useEffect, useState } from 'react'

import { useAuth } from '@/hooks/dashboard/useAuth'
import { useNotifications } from '@/hooks/dashboard/useNotifications'
import { useUserData } from '@/hooks/dashboard/useUserData'
import { cn } from '@/lib/utils'
import { analyticsService } from '@/services/analyticsService'
import { dashboardService, type DashboardData } from '@/services/dashboardService'

import { ActivityFeed } from './ActivityFeed'
import { Header } from './Header'
import { QuickActions } from './QuickActions'
import { RecentCaptures } from './RecentCaptures'
import { StatsCard } from './StatsCard'

export function HomePage(): JSX.Element {
  const { isLoading: authLoading, user } = useAuth()
  const { stats: userStats, isLoading: userDataLoading } = useUserData()
  const { addNotification } = useNotifications()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Lade Dashboard-Daten
  useEffect(() => {
    const loadDashboard = (): void => {
      try {
        setIsLoading(true)
        const data = dashboardService.getDashboardData()
        setDashboardData(data)
        
        // Track page view
        analyticsService.trackEvent('page_view', { page: 'dashboard' })
      } catch (error) {
        console.error('Failed to load dashboard:', error)
        addNotification({
          type: 'error',
          title: 'Failed to load dashboard',
          message: 'Please try refreshing the page'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [addNotification])

  // Check storage warning
  useEffect(() => {
    if (userStats && userStats.storageUsed > userStats.storageLimit * 0.8) {
      addNotification({
        type: 'warning',
        title: 'Storage Warning',
        message: `You're using ${Math.round((userStats.storageUsed / userStats.storageLimit) * 100)}% of your storage`
      })
    }
  }, [userStats, addNotification])

  if (authLoading || userDataLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-muted rounded" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            {`Welcome back, ${user?.name ?? 'User'}!`}
          </h2>
          <p className="opacity-90">
            {dashboardData?.overview.totalProducts ?? 0} products tracked • 
            {' '}{dashboardData?.overview.totalPhotos ?? 0} photos captured
          </p>
        </div>

        {/* Quick Stats */}
        {dashboardData?.quickStats && (
          <StatsCard stats={dashboardData.quickStats} />
        )}

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Captures */}
            <RecentCaptures limit={12} />
            
            {/* Activity Feed */}
            {dashboardData?.recentActivity && (
              <ActivityFeed activities={dashboardData.recentActivity} />
            )}
          </div>

          <div className="space-y-6">
            {/* Storage Info */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-medium mb-4">Storage Usage</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Used</span>
                  <span className="font-medium">
                    {formatBytes(userStats.storageUsed)} 
                    <span className="text-muted-foreground ml-1">
                      ({Math.round((userStats.storageUsed / userStats.storageLimit) * 100)}%)
                    </span>
                  </span>
                </div>
                <div className="relative">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all rounded-full",
                        userStats.storageUsed / userStats.storageLimit > 0.8 
                          ? "bg-orange-500" 
                          : userStats.storageUsed / userStats.storageLimit > 0.6 
                          ? "bg-yellow-500" 
                          : "bg-gradient-to-r from-purple-500 to-blue-500"
                      )}
                      style={{ 
                        width: `${Math.min((userStats.storageUsed / userStats.storageLimit) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 MB</span>
                  <span>{formatBytes(userStats.storageLimit)}</span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-medium mb-4">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use good lighting for better AI recognition</li>
                <li>• Capture multiple angles for accuracy</li>
                <li>• Set quantity during capture to save time</li>
                <li>• Review AI results before confirming</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`
}