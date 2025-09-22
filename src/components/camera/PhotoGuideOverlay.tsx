"use client"

import { HelpCircle, X } from 'lucide-react'
import React from 'react'

interface PhotoGuideOverlayProps {
  visible: boolean
  onClose: () => void
}

export function PhotoGuideOverlay({ visible, onClose }: PhotoGuideOverlayProps) {
  if (!visible) return null

  return (
    <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-black/70 backdrop-blur-sm text-white p-3 rounded-lg z-30">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-sm">Photo Tips</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/60 hover:text-white p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Close photo guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <ul className="text-xs space-y-1 text-white/90">
        <li className="flex items-center gap-1">
          <span className="text-green-400">✓</span> Center product in frame
        </li>
        <li className="flex items-center gap-1">
          <span className="text-green-400">✓</span> Use good lighting
        </li>
        <li className="flex items-center gap-1">
          <span className="text-green-400">✓</span> Clear, uncluttered background
        </li>
        <li className="flex items-center gap-1">
          <span className="text-green-400">✓</span> Capture multiple angles
        </li>
      </ul>
      <div className="mt-2 pt-2 border-t border-white/20 text-xs text-white/70">
        Press <kbd className="px-1 py-0.5 bg-white/20 rounded">Space</kbd> to capture
      </div>
    </div>
  )
}