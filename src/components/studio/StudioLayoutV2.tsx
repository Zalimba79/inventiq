"use client"

import React, { useState, useRef } from 'react'

import { useMinioUpload } from '@/hooks/useMinioUpload'
import { cn } from '@/lib/utils'

import { BottomBar } from './BottomBar'
import { AdaptiveCameraPreview, type AdaptiveCameraRef } from './AdaptiveCameraPreview'
import { LeftSidebar } from './LeftSidebar'
import { RightSidebar } from './RightSidebar'
import { TopToolbar } from './TopToolbar'


interface CapturedImage {
  id: string
  dataUrl?: string      // Optional for local preview
  url?: string          // MinIO URL after upload
  thumbnailUrl?: string // MinIO thumbnail URL after upload
  timestamp: Date
  resolution: { width: number; height: number }
  uploadStatus?: 'pending' | 'uploading' | 'uploaded' | 'error'
}

interface StudioLayoutV2Props {
  onSave: (images: CapturedImage[], quantity: number) => void
  className?: string
}

/**
 * Main studio layout component V2
 * Complete Orbitvu Station inspired interface
 */
export function StudioLayoutV2({ 
  onSave,
  className 
}: StudioLayoutV2Props): JSX.Element {
  const [activeTab, setActiveTab] = useState<'capture' | 'edit' | 'publish'>('capture')
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [selectedResolution, setSelectedResolution] = useState({ width: 1920, height: 1080 })
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string>('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [showCross, setShowCross] = useState(false)
  const [showGoldenRatio, setShowGoldenRatio] = useState(false)
  const [show360Markers, setShow360Markers] = useState(false)
  const [currentProductId] = useState(`product-${Date.now()}`)
  const [productQuantity, setProductQuantity] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(100)
  
  const cameraPreviewRef = useRef<AdaptiveCameraRef>(null)
  
  const { uploadBase64, deleteImage } = useMinioUpload({
    onSuccess: (result) => {
      console.log('Upload successful:', result.url)
    },
    onError: (error) => {
      console.error('Upload failed:', error)
    }
  })
  
  const handleCapture = async () => {
    if (!cameraPreviewRef.current) return
    
    setIsCapturing(true)
    
    // Small delay for visual feedback
    setTimeout(async () => {
      const imageSrc = cameraPreviewRef.current?.capture()
      
      if (imageSrc) {
        const imageId = crypto.randomUUID()
        const newImage: CapturedImage = {
          id: imageId,
          dataUrl: imageSrc,
          timestamp: new Date(),
          resolution: selectedResolution,
          uploadStatus: 'pending'
        }
        
        setCapturedImages(prev => [...prev, newImage])
        setSelectedImageId(imageId)
        
        // Upload to MinIO in the background
        setCapturedImages(prev => prev.map(img => 
          img.id === imageId ? { ...img, uploadStatus: 'uploading' } : img
        ))
        
        try {
          const result = await uploadBase64(
            currentProductId,
            imageSrc,
            `capture-${Date.now()}.jpg`
          )
          
          console.log('🌐 Upload result:', {
            success: result.success,
            hasUrl: !!result.url,
            hasThumbnailUrl: !!result.thumbnailUrl,
            url: result.url,
            thumbnailUrl: result.thumbnailUrl
          })
          
          if (result.success && result.url) {
            setCapturedImages(prev => prev.map(img => 
              img.id === imageId 
                ? { 
                    ...img, 
                    url: result.url, 
                    thumbnailUrl: result.thumbnailUrl,
                    uploadStatus: 'uploaded' 
                  }
                : img
            ))
            console.log('✅ Image state updated with MinIO URLs')
          } else {
            console.error('❌ Upload failed:', result)
            setCapturedImages(prev => prev.map(img => 
              img.id === imageId ? { ...img, uploadStatus: 'error' } : img
            ))
          }
        } catch (error) {
          console.error('Upload error:', error)
          setCapturedImages(prev => prev.map(img => 
            img.id === imageId ? { ...img, uploadStatus: 'error' } : img
          ))
        }
      }
      
      setIsCapturing(false)
    }, 100)
  }
  
  const handleClear = async () => {
    // Delete all images from MinIO
    const deletePromises = capturedImages
      .filter(img => img.url)
      .map(async img => deleteImage(img.url!))
    
    await Promise.all(deletePromises)
    
    setCapturedImages([])
    setSelectedImageId('')
  }
  
  const handleSave = () => {
    // Save all images with quantity (uploaded ones will have url, others will have dataUrl)
    onSave(capturedImages, productQuantity)
    setCapturedImages([])
    setProductQuantity(1) // Reset quantity after saving
  }
  
  const handleDeleteImage = async (id: string) => {
    const imageToDelete = capturedImages.find(img => img.id === id)
    
    // Delete from MinIO if the image was uploaded
    if (imageToDelete?.url) {
      await deleteImage(imageToDelete.url)
    }
    
    setCapturedImages(prev => prev.filter(img => img.id !== id))
    if (selectedImageId === id) {
      setSelectedImageId('')
    }
  }
  
  return (
    <div className={cn("h-full flex flex-col bg-background overflow-hidden", className)}>
      {/* Top Toolbar */}
      <TopToolbar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="flex-shrink-0"
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          onCameraChange={setSelectedCamera}
          onResolutionChange={(w, h) => setSelectedResolution({ width: w, height: h })}
          selectedCamera={selectedCamera}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onToggleCross={() => setShowCross(!showCross)}
          onToggleGoldenRatio={() => setShowGoldenRatio(!showGoldenRatio)}
          onToggle360={() => setShow360Markers(!show360Markers)}
          showGrid={showGrid}
          showCross={showCross}
          showGoldenRatio={showGoldenRatio}
          show360={show360Markers}
          className="w-56 flex-shrink-0"
        />
        
        {/* Center - Camera Preview */}
        <div className="flex-1 relative bg-muted/20 flex items-center justify-center">
          {/* Camera container - holds video and overlays */}
          <div className="relative" style={{ maxWidth: '100%', maxHeight: '100%' }}>
            {/* Camera Feed */}
            <AdaptiveCameraPreview
              ref={cameraPreviewRef}
              deviceId={selectedCamera}
              resolution={selectedResolution}
              zoomLevel={zoomLevel}
              className="h-full"
            />
            
            {/* Overlays positioned over the video element */}
            {(showGrid || showCross || showGoldenRatio || show360Markers) && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                <svg className="w-full h-full">
                  {showGrid && (
                    <>
                      {/* 3x3 Grid with thinner lines */}
                      <line x1="33.333%" y1="0" x2="33.333%" y2="100%" stroke="rgba(156,163,175,0.3)" strokeWidth="0.5" />
                      <line x1="66.666%" y1="0" x2="66.666%" y2="100%" stroke="rgba(156,163,175,0.3)" strokeWidth="0.5" />
                      <line x1="0" y1="33.333%" x2="100%" y2="33.333%" stroke="rgba(156,163,175,0.3)" strokeWidth="0.5" />
                      <line x1="0" y1="66.666%" x2="100%" y2="66.666%" stroke="rgba(156,163,175,0.3)" strokeWidth="0.5" />
                    </>
                  )}
                  {showCross && (
                    <>
                      {/* Center cross with thinner lines */}
                      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(239,68,68,0.4)" strokeWidth="0.5" />
                      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(239,68,68,0.4)" strokeWidth="0.5" />
                      {/* Center circles */}
                      <circle cx="50%" cy="50%" r="5%" fill="none" stroke="rgba(239,68,68,0.2)" strokeWidth="0.5" strokeDasharray="3,3" />
                      <circle cx="50%" cy="50%" r="2%" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="0.5" />
                      {/* Center dot */}
                      <circle cx="50%" cy="50%" r="0.3%" fill="rgba(239,68,68,0.5)" />
                      <circle cx="50%" cy="50%" r="0.2%" fill="rgba(255,255,255,0.8)" />
                      {/* Corner marks */}
                      <g stroke="rgba(239,68,68,0.3)" strokeWidth="0.5" fill="none">
                        {/* Top-left */}
                        <line x1="5%" y1="5%" x2="5%" y2="8%" />
                        <line x1="5%" y1="5%" x2="8%" y2="5%" />
                        {/* Top-right */}
                        <line x1="95%" y1="5%" x2="95%" y2="8%" />
                        <line x1="95%" y1="5%" x2="92%" y2="5%" />
                        {/* Bottom-left */}
                        <line x1="5%" y1="95%" x2="5%" y2="92%" />
                        <line x1="5%" y1="95%" x2="8%" y2="95%" />
                        {/* Bottom-right */}
                        <line x1="95%" y1="95%" x2="95%" y2="92%" />
                        <line x1="95%" y1="95%" x2="92%" y2="95%" />
                      </g>
                    </>
                  )}
                  {showGoldenRatio && (
                    <>
                      {/* Golden ratio lines with thinner strokes */}
                      <line x1="38.2%" y1="0" x2="38.2%" y2="100%" stroke="rgba(250,204,21,0.25)" strokeWidth="0.5" strokeDasharray="8,4" />
                      <line x1="61.8%" y1="0" x2="61.8%" y2="100%" stroke="rgba(250,204,21,0.25)" strokeWidth="0.5" strokeDasharray="8,4" />
                      <line x1="0" y1="38.2%" x2="100%" y2="38.2%" stroke="rgba(250,204,21,0.25)" strokeWidth="0.5" strokeDasharray="8,4" />
                      <line x1="0" y1="61.8%" x2="100%" y2="61.8%" stroke="rgba(250,204,21,0.25)" strokeWidth="0.5" strokeDasharray="8,4" />
                      {/* Golden spiral hint points */}
                      <circle cx="38.2%" cy="38.2%" r="0.3%" fill="rgba(250,204,21,0.4)" />
                      <circle cx="61.8%" cy="38.2%" r="0.3%" fill="rgba(250,204,21,0.4)" />
                      <circle cx="38.2%" cy="61.8%" r="0.3%" fill="rgba(250,204,21,0.4)" />
                      <circle cx="61.8%" cy="61.8%" r="0.3%" fill="rgba(250,204,21,0.4)" />
                    </>
                  )}
                  {show360Markers && (
                    <>
                      {/* 360 degree markers with thinner lines */}
                      {/* Outer circle */}
                      <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
                      {/* Inner circle */}
                      <circle cx="50%" cy="50%" r="40%" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="0.5" />
                      
                      {/* Degree markers every 15 degrees */}
                      {Array.from({ length: 24 }, (_, i) => {
                        const angle = i * 15
                        const radian = (angle * Math.PI) / 180
                        const strokeWidth = angle % 90 === 0 ? 0.75 : 0.5
                        const opacity = angle % 90 === 0 ? 0.4 : 0.2
                        
                        // Calculate line positions as percentages
                        // Inner radius: 40%, outer radius: 45%
                        const innerRadius = 40
                        const outerRadius = 45
                        const x1 = 50 + Math.sin(radian) * innerRadius
                        const y1 = 50 - Math.cos(radian) * innerRadius
                        const x2 = 50 + Math.sin(radian) * outerRadius
                        const y2 = 50 - Math.cos(radian) * outerRadius
                        
                        return (
                          <line
                            key={angle}
                            x1={`${x1}%`}
                            y1={`${y1}%`}
                            x2={`${x2}%`}
                            y2={`${y2}%`}
                            stroke={`rgba(59,130,246,${opacity})`}
                            strokeWidth={strokeWidth}
                          />
                        )
                      })}
                      
                      {/* Degree labels at cardinal points */}
                      <text x="50%" y="3%" fill="rgba(59,130,246,0.5)" fontSize="10" textAnchor="middle">0°</text>
                      <text x="97%" y="50%" fill="rgba(59,130,246,0.5)" fontSize="10" textAnchor="middle" dominantBaseline="middle">90°</text>
                      <text x="50%" y="97%" fill="rgba(59,130,246,0.5)" fontSize="10" textAnchor="middle">180°</text>
                      <text x="3%" y="50%" fill="rgba(59,130,246,0.5)" fontSize="10" textAnchor="middle" dominantBaseline="middle">270°</text>
                      
                      {/* Center point */}
                      <circle cx="50%" cy="50%" r="0.4%" fill="rgba(59,130,246,0.6)" />
                      <circle cx="50%" cy="50%" r="0.2%" fill="rgba(255,255,255,0.8)" />
                      
                      {/* Current position indicator */}
                      <line x1="50%" y1="50%" x2="50%" y2="10%" stroke="rgba(59,130,246,0.5)" strokeWidth="0.75" />
                    </>
                  )}
                </svg>
              </div>
            )}
          </div>
          
          {/* Tab-specific content */}
          {activeTab === 'edit' && (
            <div className="absolute inset-0 bg-background/95 flex items-center justify-center">
              <p className="text-muted-foreground">Edit mode - Coming soon</p>
            </div>
          )}
          
          {activeTab === 'publish' && (
            <div className="absolute inset-0 bg-background/95 flex items-center justify-center">
              <p className="text-muted-foreground">Publish mode - Coming soon</p>
            </div>
          )}
        </div>
        
        {/* Right Sidebar */}
        <RightSidebar 
          className="w-56 flex-shrink-0"
          quantity={productQuantity}
          onQuantityChange={setProductQuantity}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
        />
      </div>
      
      {/* Bottom Bar */}
      <BottomBar
        images={capturedImages}
        selectedImageId={selectedImageId}
        onImageSelect={setSelectedImageId}
        onImageDelete={handleDeleteImage}
        onCapture={handleCapture}
        onClear={handleClear}
        onSave={handleSave}
        isCapturing={isCapturing}
        className="flex-shrink-0"
      />
    </div>
  )
}