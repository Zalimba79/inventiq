"use client"

import React from 'react'
import { useLightGallery } from './LightGalleryContext'
import { X, Image, FileText, RotateCw, Star } from 'lucide-react'

export function LightGalleryInfo() {
  const { product, currentIndex, rotation, showInfo, toggleInfo } = useLightGallery()
  
  const currentPhoto = product?.photos?.[currentIndex]
  const currentRotation = currentPhoto ? (rotation[currentPhoto.id] || 0) : 0
  
  if (!showInfo || !currentPhoto) return null
  
  const formatSize = (bytes: number | undefined) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  
  return (
    <div className="absolute bottom-24 left-4 z-[10003] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Image className="w-4 h-4" />
            Photo Details
          </h3>
          <button
            onClick={toggleInfo}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Basic Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Photo</span>
              <span className="text-white font-mono">
                {currentIndex + 1} of {product?.photos.length}
              </span>
            </div>
            
            {currentPhoto.isPrimary && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Status</span>
                <span className="text-yellow-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Primary
                </span>
              </div>
            )}
          </div>
          
          {/* Dimensions */}
          {(currentPhoto.width || currentPhoto.height) && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <h4 className="text-white/80 text-xs uppercase tracking-wide">Dimensions</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Resolution</span>
                <span className="text-white font-mono">
                  {currentPhoto.width || 'N/A'} × {currentPhoto.height || 'N/A'}
                </span>
              </div>
            </div>
          )}
          
          {/* File Info */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <h4 className="text-white/80 text-xs uppercase tracking-wide">File Info</h4>
            
            {currentPhoto.size && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Size</span>
                <span className="text-white font-mono">
                  {formatSize(currentPhoto.size)}
                </span>
              </div>
            )}
            
            {currentPhoto.mimeType && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Format</span>
                <span className="text-white font-mono">
                  {currentPhoto.mimeType.split('/')[1]?.toUpperCase() || 'N/A'}
                </span>
              </div>
            )}
          </div>
          
          {/* Adjustments */}
          {currentRotation !== 0 && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <h4 className="text-white/80 text-xs uppercase tracking-wide">Adjustments</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60 flex items-center gap-1">
                  <RotateCw className="w-3 h-3" />
                  Rotation
                </span>
                <span className="text-white font-mono">{currentRotation}°</span>
              </div>
            </div>
          )}
          
          {/* Metadata */}
          {currentPhoto.timestamp && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <h4 className="text-white/80 text-xs uppercase tracking-wide">Metadata</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Captured</span>
                <span className="text-white text-xs">
                  {new Date(currentPhoto.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}