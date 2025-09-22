"use client"

import { RotateCcw } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'

interface CameraQuickActionsProps {
  visible: boolean
  onRetakeLast: () => void
}

export function CameraQuickActions({ visible, onRetakeLast }: CameraQuickActionsProps): JSX.Element | null {
  if (!visible) return null

  return (
    <div className="absolute top-4 right-4 flex gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={onRetakeLast}
        className="bg-black/70 backdrop-blur-sm text-white hover:bg-black/80"
        aria-label="Retake last photo"
      >
        <RotateCcw className="w-4 h-4 mr-1" />
        Retake Last
      </Button>
    </div>
  )
}