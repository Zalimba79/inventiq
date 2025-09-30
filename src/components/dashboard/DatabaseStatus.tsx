'use client'

import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DatabaseStats {
  status: 'healthy' | 'unhealthy' | 'checking'
  products: number
  photos: number
  users: number
  lastCheck: string
  connectionString?: string
}

export function DatabaseStatus() {
  const [stats, setStats] = useState<DatabaseStats>({
    status: 'checking',
    products: 0,
    photos: 0,
    users: 0,
    lastCheck: new Date().toISOString()
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchDatabaseStatus = async () => {
    setIsRefreshing(true)
    try {
      // Fetch health status
      const healthResponse = await fetch('/api/health')
      const healthData = await healthResponse.json()
      
      // Fetch database stats
      const statsResponse = await fetch('/api/database/stats')
      const statsData = await statsResponse.json()
      
      setStats({
        status: healthData.checks?.database ? 'healthy' : 'unhealthy',
        products: statsData.products || 0,
        photos: statsData.photos || 0,
        users: statsData.users || 0,
        lastCheck: new Date().toISOString(),
        connectionString: statsData.connectionString
      })
    } catch (error) {
      console.error('Failed to fetch database status:', error)
      setStats(prev => ({
        ...prev,
        status: 'unhealthy',
        lastCheck: new Date().toISOString()
      }))
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDatabaseStatus()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDatabaseStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    switch (stats.status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'checking':
        return <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />
    }
  }

  const getStatusText = () => {
    switch (stats.status) {
      case 'healthy':
        return 'Connected'
      case 'unhealthy':
        return 'Disconnected'
      case 'checking':
        return 'Checking...'
    }
  }

  const getStatusColor = () => {
    switch (stats.status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950'
      case 'unhealthy':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950'
      case 'checking':
        return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Status
          </div>
        </CardTitle>
        <button
          onClick={fetchDatabaseStatus}
          disabled={isRefreshing}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh status"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Connection</span>
            <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
          </div>

          {/* Database Stats */}
          {stats.status === 'healthy' && (
            <>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.products}</div>
                  <div className="text-xs text-muted-foreground">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.photos}</div>
                  <div className="text-xs text-muted-foreground">Photos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.users}</div>
                  <div className="text-xs text-muted-foreground">Users</div>
                </div>
              </div>

              {/* Connection Info */}
              {stats.connectionString && (
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    PostgreSQL @ localhost:5432
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Database: inventiq
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error State */}
          {stats.status === 'unhealthy' && (
            <div className="pt-2 space-y-2">
              <div className="text-sm text-red-600 dark:text-red-400">
                Cannot connect to database
              </div>
              <div className="text-xs text-muted-foreground">
                Make sure PostgreSQL is running:
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                npm run db:start
              </code>
            </div>
          )}

          {/* Last Check */}
          <div className="text-xs text-muted-foreground pt-1">
            Last checked: {new Date(stats.lastCheck).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}