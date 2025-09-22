"use client"

import { 
  Package, 
  Camera, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import { ClearStorageButton } from '@/components/debug/ClearStorageButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProductStore } from '@/store/product-store'

export default function HomePage(): JSX.Element {
  const { products, getProductsByStatus } = useProductStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  const draftProducts = getProductsByStatus('DRAFT')
  const analyzedProducts = getProductsByStatus('ANALYZED')
  const validatedProducts = getProductsByStatus('VALIDATED')
  const confirmedProducts = getProductsByStatus('CONFIRMED')

  let totalValue = 0
  for (const p of confirmedProducts) {
    const avg = ((p.estimatedMin ?? 0) + (p.estimatedMax ?? 0)) / 2
    totalValue += avg
  }

  const stats = [
    {
      label: 'Draft Products',
      value: draftProducts.length,
      icon: Package,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      link: '/products/draft'
    },
    {
      label: 'Ready for Validation',
      value: analyzedProducts.length,
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/products/validation'
    },
    {
      label: 'Validated',
      value: validatedProducts.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/products/confirmed'
    },
    {
      label: 'Confirmed Inventory',
      value: confirmedProducts.length,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/products/confirmed'
    }
  ]

  const quickActions = [
    {
      title: 'Capture Products',
      description: 'Take photos of new products to add to inventory',
      icon: Camera,
      link: '/capture',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Review Drafts',
      description: `${draftProducts.length} products ready for AI analysis`,
      icon: Package,
      link: '/products/draft',
      color: 'bg-gray-500 hover:bg-gray-600',
      disabled: draftProducts.length === 0
    },
    {
      title: 'Validate Products',
      description: `${analyzedProducts.length} products need validation`,
      icon: Sparkles,
      link: '/products/validation',
      color: 'bg-purple-500 hover:bg-purple-600',
      disabled: analyzedProducts.length === 0
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Inventiq Dashboard</h1>
        <p className="text-muted-foreground">
          AI-powered inventory management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.link}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link 
                key={action.title} 
                href={action.disabled ? '#' : action.link}
                className={action.disabled ? 'pointer-events-none opacity-50' : ''}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col h-full">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 text-white ${action.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold mb-2">{action.title}</h3>
                      <p className="text-sm text-muted-foreground flex-grow">
                        {action.description}
                      </p>
                      {!action.disabled && (
                        <div className="mt-4 flex items-center text-sm font-medium">
                          Go to {action.title}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Inventory Value */}
      {confirmedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Confirmed Value</p>
                <p className="text-2xl font-bold">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Confidence</p>
                <p className="text-2xl font-bold">
                  {confirmedProducts.length > 0 
                    ? `${(confirmedProducts.reduce((sum, p) => sum + (p.confidence ?? 0), 0) / confirmedProducts.length * 100).toFixed(0)}%`
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Workflow Progress</h2>
          <ClearStorageButton />
        </div>
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            <span className="text-sm">Capture</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <span className="text-sm">Draft ({draftProducts.length})</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">Analyze ({analyzedProducts.length})</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Confirm ({confirmedProducts.length})</span>
          </div>
        </div>
      </div>
    </div>
  )
}