"use client"

import { RefreshCw, TrendingUp } from 'lucide-react'
import React, { useEffect, useState, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/dashboard/useAuth'
import { useNavigation } from '@/hooks/dashboard/useNavigation'
import { useNotifications } from '@/hooks/dashboard/useNotifications'
import { useUserData } from '@/hooks/dashboard/useUserData'
import { cn } from '@/lib/utils'
import { analyticsService } from '@/services/analyticsService'
import { dashboardService, type DashboardData } from '@/services/dashboardService'
import { useProductStore } from '@/store/product-store'

import { ActivityFeed } from './ActivityFeed'
import { DashboardLayout } from './DashboardLayout'
import { QuickActions } from './QuickActions'
import { RecentCaptures } from './RecentCaptures'
import { StatsOverview } from './StatsOverview'
import { StorageWidget } from './StorageWidget'
import { TipsWidget } from './TipsWidget'

export function HomePage(): JSX.Element {
  const { isLoading: authLoading, user } = useAuth()
  const { stats: userStats, isLoading: userDataLoading } = useUserData()
  const { addNotification } = useNotifications()
  const { navigate } = useNavigation()
  const clearStorage = useProductStore((state) => state.clearAllData)
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Load Dashboard Data
  const loadDashboard = useCallback((): void => {
    try {
      setIsLoading(true)
      const data = dashboardService.getDashboardData()
      setDashboardData(data)
      setLastRefresh(new Date())
      
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
  }, [addNotification])

  // Refresh Dashboard Data
  const handleRefresh = useCallback((): void => {
    setIsRefreshing(true)
    loadDashboard()
    setTimeout(() => setIsRefreshing(false), 500)
  }, [loadDashboard])

  // Clear Storage Handler
  const handleClearStorage = useCallback((): void => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearStorage()
      addNotification({
        type: 'success',
        title: 'Storage Cleared',
        message: 'All data has been removed successfully'
      })
      handleRefresh()
    }
  }, [clearStorage, addNotification, handleRefresh])

  // Initial Load
  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

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

  // Loading State with Skeleton
  if (authLoading || userDataLoading || isLoading) {
    return (
      <DashboardLayout showHeader={false}>
        <div className="p-6 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={`skeleton-${i}`} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded-lg" />
                <div className="h-48 bg-muted rounded-lg" />
              </div>
              <div className="space-y-6">
                <div className="h-40 bg-muted rounded-lg" />
                <div className="h-40 bg-muted rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout showHeader={false}>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Welcome Section with Refresh */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  {`Welcome back, ${user?.name ?? 'User'}!`}
                </h1>
                <p className="opacity-90 text-sm sm:text-base">
                  {dashboardData?.overview.totalProducts ?? 0} products tracked • 
                  {' '}{dashboardData?.overview.totalPhotos ?? 0} photos captured
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleRefresh()}
                disabled={isRefreshing}
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                <RefreshCw className={cn(
                  "h-4 w-4",
                  isRefreshing && "animate-spin"
                )} />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </Button>
            </div>
            
            {/* Progress Indicator */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1 bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(
                      ((dashboardData?.overview.confirmedProducts ?? 0) / 
                       Math.max(dashboardData?.overview.totalProducts ?? 1, 1)) * 100, 
                      100
                    )}%` 
                  }}
                />
              </div>
              <span className="text-xs sm:text-sm opacity-90">
                {dashboardData?.overview.confirmedProducts ?? 0} confirmed
              </span>
            </div>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
        </div>

        {/* Stats Overview */}
        {dashboardData?.quickStats && (
          <StatsOverview 
            stats={dashboardData.quickStats} 
            showDetails={false}
          />
        )}

        {/* Quick Actions */}
        <QuickActions showStats={true} />

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-6">
            {/* Recent Captures */}
            <RecentCaptures limit={12} />
            
            {/* Activity Feed */}
            {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 && (
              <ActivityFeed activities={dashboardData.recentActivity} />
            )}
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            {/* Storage Widget */}
            {userStats && (
              <StorageWidget
                used={userStats.storageUsed}
                limit={userStats.storageLimit}
                onClearStorage={handleClearStorage}
                showDetails={true}
              />
            )}

            {/* Tips Widget */}
            <TipsWidget
              onNavigate={navigate}
              showDismiss={true}
            />

            {/* Performance Card */}
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Today&apos;s Progress
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Products Added</span>
                  <span className="font-semibold">
                    {dashboardData?.quickStats?.[0]?.value ?? 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Photos Captured</span>
                  <span className="font-semibold">
                    {dashboardData?.quickStats?.[1]?.value ?? 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-semibold">
                    {dashboardData?.quickStats?.[3]?.value ?? '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Last Refresh Indicator */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      </div>
    </DashboardLayout>
  )
}