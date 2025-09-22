interface AnalyticsData {
  usage: UsageStats
  performance: PerformanceMetrics
  trends: TrendData[]
}

interface UsageStats {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  averageSessionDuration: number
  totalSessions: number
  bounceRate: number
}

interface PerformanceMetrics {
  averageLoadTime: number
  apiResponseTime: number
  errorRate: number
  successRate: number
  cacheHitRate: number
}

interface TrendData {
  date: Date
  products: number
  photos: number
  analyses: number
  storage: number
}

class AnalyticsService {
  private analyticsKey = 'analytics-data'
  
  getAnalytics(): AnalyticsData {
    try {
      // Lade gespeicherte Analytics-Daten
      const stored = localStorage.getItem(this.analyticsKey)
      if (stored) {
        return JSON.parse(stored) as AnalyticsData
      }

      // Generiere Mock-Daten für Demo
      return this.generateMockAnalytics()
    } catch (error) {
      console.error('Failed to load analytics:', error)
      return this.generateMockAnalytics()
    }
  }

  trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    try {
      const events = this.getStoredEvents()
      events.push({
        name: eventName,
        properties,
        timestamp: new Date().toISOString()
      })
      
      // Behalte nur die letzten 100 Events
      if (events.length > 100) {
        events.splice(0, events.length - 100)
      }
      
      localStorage.setItem('analytics-events', JSON.stringify(events))
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  getUsageStats(): UsageStats {
    const events = this.getStoredEvents()
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const dailyEvents = events.filter(e => new Date(e.timestamp as string) >= dayAgo)
    const weeklyEvents = events.filter(e => new Date(e.timestamp as string) >= weekAgo)
    const monthlyEvents = events.filter(e => new Date(e.timestamp as string) >= monthAgo)

    return {
      dailyActiveUsers: dailyEvents.length > 0 ? 1 : 0,
      weeklyActiveUsers: weeklyEvents.length > 0 ? 1 : 0,
      monthlyActiveUsers: monthlyEvents.length > 0 ? 1 : 0,
      averageSessionDuration: 420, // 7 Minuten in Sekunden
      totalSessions: events.filter(e => e.name === 'session_start').length,
      bounceRate: 0.15
    }
  }

  getTrends(days = 7): TrendData[] {
    const trends: TrendData[] = []
    const now = new Date()
    
    // Lade Produktdaten für Trend-Analyse
    const storedProducts = localStorage.getItem('product-storage')
    interface StoredProductData {
      state: {
        products: Array<{
          createdAt: string
          status: string
          photos?: Array<{ id: string }>
        }>
      }
    }
    const data = storedProducts ? JSON.parse(storedProducts) as StoredProductData : null
    const products = data?.state?.products ?? []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)

      const dayProducts = products.filter(p => {
        const created = new Date(p.createdAt)
        return created >= date && created < endDate
      })

      trends.push({
        date,
        products: dayProducts.length,
        photos: dayProducts.reduce((sum, p) => sum + (p.photos?.length ?? 0), 0),
        analyses: dayProducts.filter(p => p.status !== 'DRAFT').length,
        storage: storedProducts ? new Blob([JSON.stringify(dayProducts)]).size : 0
      })
    }

    return trends
  }

  private getStoredEvents(): Array<{
    name?: string
    properties?: Record<string, unknown>
    timestamp?: string
  }> {
    try {
      const stored = localStorage.getItem('analytics-events')
      return stored ? JSON.parse(stored) as Array<{
        name?: string
        properties?: Record<string, unknown>
        timestamp?: string
      }> : []
    } catch {
      return []
    }
  }

  private generateMockAnalytics(): AnalyticsData {
    return {
      usage: {
        dailyActiveUsers: 1,
        weeklyActiveUsers: 1,
        monthlyActiveUsers: 1,
        averageSessionDuration: 420,
        totalSessions: 12,
        bounceRate: 0.15
      },
      performance: {
        averageLoadTime: 1.2,
        apiResponseTime: 0.3,
        errorRate: 0.02,
        successRate: 0.98,
        cacheHitRate: 0.75
      },
      trends: []
    }
  }
}

export const analyticsService = new AnalyticsService()
export type { AnalyticsData, UsageStats, PerformanceMetrics, TrendData }