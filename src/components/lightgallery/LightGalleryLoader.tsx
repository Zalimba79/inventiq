"use client"

import React from 'react'

export function LightGalleryLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-[10004]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-white/20 rounded-full animate-pulse" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}