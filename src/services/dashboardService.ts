interface DashboardData {
  overview: DashboardOverview
  recentActivity: Activity[]
  quickStats: QuickStat[]
}

interface DashboardOverview {
  totalProducts: number
  draftProducts: number
  analyzedProducts: number
  confirmedProducts: number
  totalPhotos: number
  storageUsed: number
  storageLimit: number
  lastSync: Date
}

interface Activity {
  id: string
  type: 'product_created' | 'product_analyzed' | 'product_confirmed' | 'photo_captured'
  title: string
  description?: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

interface QuickStat {
  label: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  iconType?: 'package' | 'camera' | 'clock' | 'check-circle'
}

class DashboardService {
  getDashboardData(): DashboardData {
    try {
      // Lade Produktdaten aus localStorage
      const storedProducts = localStorage.getItem('product-storage')
      interface StoredProductData {
        state: {
          products: Array<{
            id: string
            createdAt: string
            updatedAt: string
            status: string
            photos?: Array<{ id: string }>
            name?: string
          }>
        }
      }
      const data = storedProducts ? JSON.parse(storedProducts) as StoredProductData : null
      const products = data?.state?.products ?? []

      // Berechne Übersicht
      const overview: DashboardOverview = {
        totalProducts: products.length,
        draftProducts: products.filter(p => p.status === 'DRAFT').length,
        analyzedProducts: products.filter(p => p.status === 'ANALYZED' || p.status === 'VALIDATED').length,
        confirmedProducts: products.filter(p => p.status === 'CONFIRMED').length,
        totalPhotos: products.reduce((sum, p) => sum + (p.photos?.length ?? 0), 0),
        storageUsed: storedProducts ? new Blob([storedProducts]).size : 0,
        storageLimit: 100 * 1024 * 1024, // 100MB
        lastSync: new Date()
      }

      // Generiere Aktivitäten
      const recentActivity: Activity[] = this.generateRecentActivity(products)

      // Erstelle Quick Stats
      const quickStats: QuickStat[] = [
        {
          label: 'Products Added Today',
          value: this.getProductsAddedToday(products),
          trend: 'up',
          iconType: 'package'
        },
        {
          label: 'Photos This Week',
          value: this.getPhotosThisWeek(products),
          change: 12,
          trend: 'up',
          iconType: 'camera'
        },
        {
          label: 'Pending Analysis',
          value: overview.draftProducts,
          trend: overview.draftProducts > 0 ? 'up' : 'stable',
          iconType: 'clock'
        },
        {
          label: 'Success Rate',
          value: overview.confirmedProducts > 0 
            ? `${Math.round((overview.confirmedProducts / overview.totalProducts) * 100)}%`
            : '0%',
          trend: 'stable',
          iconType: 'check-circle'
        }
      ]

      return {
        overview,
        recentActivity,
        quickStats
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      throw error
    }
  }

  private generateRecentActivity(products: Array<{
    id: string
    createdAt: string
    name?: string
    photos?: Array<{ id: string }>
  }>): Activity[] {
    const activities: Activity[] = []
    
    // Sortiere Produkte nach Erstellungsdatum
    const sortedProducts = [...products].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Nehme die letzten 5 Aktivitäten
    sortedProducts.slice(0, 5).forEach(product => {
      activities.push({
        id: `activity-${product.id}`,
        type: 'product_created',
        title: product.name ?? 'New Product',
        description: `Added ${product.photos?.length ?? 0} photos`,
        timestamp: new Date(product.createdAt),
        metadata: { productId: product.id }
      })
    })

    return activities
  }

  private getProductsAddedToday(products: Array<{
    createdAt: string
  }>): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return products.filter(p => {
      const created = new Date(p.createdAt)
      return created >= today
    }).length
  }

  private getPhotosThisWeek(products: Array<{
    createdAt: string
    photos?: Array<{ id: string }>
  }>): number {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    return products.reduce((sum, p) => {
      const created = new Date(p.createdAt)
      if (created >= weekAgo) {
        return sum + (p.photos?.length ?? 0)
      }
      return sum
    }, 0)
  }

  refreshDashboard(): DashboardData {
    // In Zukunft: Sync mit Backend
    return this.getDashboardData()
  }
}

export const dashboardService = new DashboardService()
export type { DashboardData, DashboardOverview, Activity, QuickStat }