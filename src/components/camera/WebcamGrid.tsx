"use client"

import React from 'react'

interface WebcamGridProps {
  show: boolean
}

/**
 * Desktop camera grid overlay (rule of thirds)
 */
export function WebcamGrid({ show }: WebcamGridProps): JSX.Element | null {
  if (!show) return null
  
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <svg className="w-full h-full">
        <defs>
          <pattern 
            id="webcam-grid" 
            width="33.33%" 
            height="33.33%" 
            patternUnits="objectBoundingBox"
          >
            <path 
              d="M 0.333 0 V 1 M 0.667 0 V 1 M 0 0.333 H 1 M 0 0.667 H 1" 
              stroke="rgba(255,255,255,0.4)" 
              strokeWidth="1" 
              fill="none"
            />
          </pattern>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="url(#webcam-grid)" 
        />
      </svg>
    </div>
  )
}