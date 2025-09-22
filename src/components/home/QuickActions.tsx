"use client"

import { 
  Camera, 
  FileText, 
  Package, 
  Sparkles
} from 'lucide-react'
import React from 'react'

import { Card } from '@/components/ui/card'
import { useNavigation } from '@/hooks/dashboard/useNavigation'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  path: string
  color: string
}

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps): JSX.Element {
  const { navigate } = useNavigation()

  const actions: QuickAction[] = [
    {
      id: 'capture',
      title: 'Capture Photos',
      description: 'Take photos of products',
      icon: <Camera className="h-6 w-6" />,
      path: '/capture',
      color: 'bg-blue-500'
    },
    {
      id: 'draft',
      title: 'Draft Products',
      description: 'Review draft items',
      icon: <FileText className="h-6 w-6" />,
      path: '/products/draft',
      color: 'bg-orange-500'
    },
    {
      id: 'analyze',
      title: 'AI Analysis',
      description: 'Analyze products with AI',
      icon: <Sparkles className="h-6 w-6" />,
      path: '/products/validation',
      color: 'bg-purple-500'
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'View confirmed products',
      icon: <Package className="h-6 w-6" />,
      path: '/products/confirmed',
      color: 'bg-green-500'
    }
  ]

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {actions.map((action) => (
        <Card
          key={action.id}
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate(action.path)}
        >
          <div className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center text-white mb-3",
            action.color
          )}>
            {action.icon}
          </div>
          <h3 className="font-medium text-sm mb-1">{action.title}</h3>
          <p className="text-xs text-muted-foreground">{action.description}</p>
        </Card>
      ))}
    </div>
  )
}