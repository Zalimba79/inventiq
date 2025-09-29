"use client"

import { Camera, Clock, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRecentMedia } from '@/hooks/dashboard/useRecentMedia'
import { cn } from '@/lib/utils'

interface RecentCapturesProps {
  className?: string
  limit?: number
}

export function RecentCaptures({ className, limit = 6 }: RecentCapturesProps): JSX.Element {
  const { photos, isLoading } = useRecentMedia(limit)

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Captures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={`loading-${i}`} className="aspect-square bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (photos.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Captures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl animate-pulse" />
              <Package className="h-12 w-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500" />
            </div>
            <p className="text-sm font-medium mb-1">No captures yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Start by capturing some product photos
            </p>
            <Link href="/capture">
              <Button size="sm" className="gap-2">
                <Camera className="h-4 w-4" />
                Start Capturing
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Captures
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {photos.map((photo) => (
            <div 
              key={photo.id}
              className="relative aspect-square group cursor-pointer"
            >
              <Image
                src={photo.thumbnail ?? photo.url}
                alt={photo.productName ?? 'Product photo'}
                fill
                className="object-cover rounded hover:opacity-90 transition-opacity"
                sizes="(max-width: 768px) 33vw, 16vw"
               unoptimized/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded">
                <div className="absolute bottom-1 left-1 right-1">
                  <p className="text-white text-xs truncate">
                    {photo.productName ?? 'Unnamed'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}