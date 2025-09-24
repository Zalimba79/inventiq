"use client"

import React from 'react'

interface IOSCameraGridProps {
  show: boolean
}

/**
 * iOS camera grid overlay (rule of thirds)
 */
export function IOSCameraGrid({ show }: IOSCameraGridProps): JSX.Element | null {
  if (!show) return null
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full">
        <defs>
          <pattern 
            id="ios-grid" 
            width="33.33%" 
            height="33.33%" 
            patternUnits="objectBoundingBox"
          >
            <path 
              d="M 0.333 0 V 1 M 0.667 0 V 1 M 0 0.333 H 1 M 0 0.667 H 1" 
              stroke="white" 
              strokeWidth="0.5" 
              opacity="0.5"
            />
          </pattern>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="url(#ios-grid)" 
        />
      </svg>
    </div>
  )
}