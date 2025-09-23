"use client"

import { 
  Camera, 
  FileText, 
  Package, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Plus,
  Search,
  CheckCircle
} from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigation } from '@/hooks/dashboard/useNavigation'
import { cn } from '@/lib/utils'
import { useProductStore } from '@/store/product-store'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  path: string
  color: string
  gradient: string
  hoverGradient: string
  badge?: string
  badgeColor?: string
  stats?: {
    label: string
    value: number
  }
}

interface QuickActionsProps {
  className?: string
  showStats?: boolean
}

export function QuickActions({ className, showStats = true }: QuickActionsProps): JSX.Element {
  const { navigate } = useNavigation()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const products = useProductStore((state) => state.products)
  
  // Calculate stats for badges
  const draftCount = products.filter(p => p.status === 'DRAFT').length
  const pendingAnalysis = products.filter(p => p.status === 'ANALYZED' || p.status === 'VALIDATED').length
  const confirmedCount = products.filter(p => p.status === 'CONFIRMED').length
  
  const actions: QuickAction[] = [
    {
      id: 'capture',
      title: 'Capture Photos',
      description: 'Start capturing new products',
      icon: <Camera className="h-6 w-6" />,
      path: '/capture',
      color: 'text-blue-600',
      gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
      hoverGradient: 'from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900',
      badge: 'Quick Start',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      stats: {
        label: 'Today',
        value: products.filter(p => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return new Date(p.createdAt) >= today
        }).length
      }
    },
    {
      id: 'draft',
      title: 'Draft Products',
      description: 'Review and edit drafts',
      icon: <FileText className="h-6 w-6" />,
      path: '/products/draft',
      color: 'text-orange-600',
      gradient: 'from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950',
      hoverGradient: 'from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900',
      badge: draftCount > 0 ? `${draftCount} pending` : undefined,
      badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      stats: {
        label: 'Drafts',
        value: draftCount
      }
    },
    {
      id: 'analyze',
      title: 'AI Analysis',
      description: 'Process with AI magic',
      icon: <Sparkles className="h-6 w-6" />,
      path: '/products/validation',
      color: 'text-purple-600',
      gradient: 'from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
      hoverGradient: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
      badge: pendingAnalysis > 0 ? `${pendingAnalysis} ready` : 'AI Ready',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      stats: {
        label: 'To Validate',
        value: pendingAnalysis
      }
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'View confirmed items',
      icon: <Package className="h-6 w-6" />,
      path: '/products/confirmed',
      color: 'text-green-600',
      gradient: 'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
      hoverGradient: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
      badge: confirmedCount > 0 ? `${confirmedCount} items` : undefined,
      badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      stats: {
        label: 'Confirmed',
        value: confirmedCount
      }
    }
  ]

  // Additional quick actions
  const secondaryActions = [
    {
      id: 'search',
      title: 'Search',
      icon: <Search className="h-4 w-4" />,
      path: '/search'
    },
    {
      id: 'add',
      title: 'Quick Add',
      icon: <Plus className="h-4 w-4" />,
      path: '/capture'
    },
    {
      id: 'recent',
      title: 'Recent',
      icon: <CheckCircle className="h-4 w-4" />,
      path: '/products/draft'
    }
  ]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Primary Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Card
            key={action.id}
            className={cn(
              "relative overflow-hidden cursor-pointer transition-all duration-300",
              "hover:shadow-xl hover:-translate-y-1",
              "bg-gradient-to-br",
              hoveredCard === action.id ? action.hoverGradient : action.gradient,
              "border-0"
            )}
            onClick={() => navigate(action.path)}
            onMouseEnter={() => setHoveredCard(action.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <CardContent className="p-4 sm:p-6">
              {/* Badge */}
              {action.badge && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "absolute top-2 right-2 text-[10px]",
                    action.badgeColor
                  )}
                >
                  {action.badge}
                </Badge>
              )}

              {/* Icon */}
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center mb-4",
                "bg-white/80 dark:bg-black/20 backdrop-blur-sm",
                "transition-transform duration-300",
                hoveredCard === action.id && "scale-110 rotate-3"
              )}>
                <div className={action.color}>
                  {action.icon}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1">
                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                  {action.title}
                  {hoveredCard === action.id && (
                    <ArrowRight className="h-4 w-4 animate-pulse" />
                  )}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>

              {/* Stats */}
              {showStats && action.stats && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {action.stats.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold">
                        {action.stats.value}
                      </span>
                      {action.stats.value > 0 && (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Hover Effect Overlay */}
              <div 
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                  "from-white/20 to-transparent",
                  hoveredCard === action.id && "opacity-100"
                )}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Actions Bar */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {secondaryActions.map((action) => (
          <button
            key={action.id}
            onClick={() => navigate(action.path)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg",
              "text-xs text-muted-foreground",
              "hover:bg-muted hover:text-foreground",
              "transition-colors duration-200"
            )}
          >
            {action.icon}
            <span className="hidden sm:inline">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}