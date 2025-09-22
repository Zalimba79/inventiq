"use client"

import { 
  CheckCircle, 
  XCircle, 
  Edit2, 
  Clock,
  User,
  Package
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ValidationHistoryEntry {
  productId: string
  timestamp: string
  action: 'validate' | 'reject' | 'edit'
  previousStatus: string
  newStatus: string
  changes?: Record<string, unknown>
  reason?: string
  validatedBy?: string
}

interface ValidationHistoryProps {
  productId?: string
  limit?: number
  className?: string
}

export function ValidationHistory({ productId, limit = 10, className }: ValidationHistoryProps): JSX.Element {
  const [history, setHistory] = useState<ValidationHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (productId) params.append('productId', productId)
      params.append('limit', limit.toString())

      const response = await fetch(`/api/products/validate?${params}`)
      const data = await response.json() as { success: boolean; history?: ValidationHistoryEntry[] }
      
      if (data.success && data.history) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error('Failed to fetch validation history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [productId, limit])
  
  useEffect(() => {
    void fetchHistory()
  }, [fetchHistory])

  const getActionIcon = (action: string): JSX.Element => {
    switch (action) {
      case 'validate':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'reject':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'edit':
        return <Edit2 className="w-4 h-4 text-blue-600" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getActionLabel = (action: string): string => {
    switch (action) {
      case 'validate':
        return 'Validated'
      case 'reject':
        return 'Rejected'
      case 'edit':
        return 'Edited'
      default:
        return action
    }
  }

  const getStatusBadge = (status: string): JSX.Element => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'DRAFT': 'outline',
      'ANALYZED': 'secondary',
      'VALIDATED': 'default',
      'CONFIRMED': 'default'
    }
    
    return (
      // Status comes from controlled product data, safe to index
      // eslint-disable-next-line security/detect-object-injection
      <Badge variant={variants[status] ?? 'outline'} className="text-xs">
        {status}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Validation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading history...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Validation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No validation history yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Validation History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={`${entry.productId}-${entry.timestamp}`}
              className="flex items-start gap-3 pb-4 border-b last:border-0"
            >
              <div className="mt-1">
                {getActionIcon(entry.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {getActionLabel(entry.action)} Product
                    </p>
                    {!productId && (
                      <p className="text-xs text-muted-foreground">
                        ID: {entry.productId.slice(-8)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
                
                {/* Status change */}
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(entry.previousStatus)}
                  <span className="text-xs text-muted-foreground">→</span>
                  {getStatusBadge(entry.newStatus)}
                </div>
                
                {/* Reason if rejected */}
                {entry.reason && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Reason: {entry.reason}
                  </p>
                )}
                
                {/* Changes if edited */}
                {entry.changes && Object.keys(entry.changes).length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium mb-1">Changes:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(entry.changes).map((key) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Validated by */}
                {entry.validatedBy && (
                  <div className="flex items-center gap-1 mt-2">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      by {entry.validatedBy}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}