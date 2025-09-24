"use client"

import { 
  Upload, 
  FolderOpen,
  CheckCircle,
  Package
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { AdaptiveCaptureInterface } from '@/components/camera/AdaptiveCaptureInterface'
import { CameraErrorBoundary } from '@/components/camera/CameraErrorBoundary'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fastDeviceDetector } from '@/lib/fast-device-detection'
import { cn } from '@/lib/utils'

export type CaptureMethod = 'dropzone' | 'mobile' | 'webcam' | 'auto'

interface CapturedItem {
  id: string
  file?: File
  dataUrl: string
  timestamp: Date
  method: CaptureMethod
  size: number
  name: string
}

interface SmartCaptureRouterProps {
  onItemsCaptured: (items: CapturedItem[]) => void
  className?: string
}

/**
 * Smart Routing Capture System
 * - Detects drag & drop → Shows dropzone
 * - Detects device → Suggests best camera
 * - Handles 500+ items efficiently
 * - Saves user preferences
 */
export function SmartCaptureRouter({
  onItemsCaptured,
  className
}: SmartCaptureRouterProps): JSX.Element {
  // State
  const [captureMethod, setCaptureMethod] = useState<CaptureMethod>('auto')
  const [savedPreference, setSavedPreference] = useState<CaptureMethod | null>(null)
  const [capturedItems, setCapturedItems] = useState<CapturedItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop' | 'unknown'>('unknown')
  const [isDragging, setIsDragging] = useState(false)
  
  // Statistics
  const totalItems = capturedItems.length
  const totalSize = capturedItems.reduce((acc, item) => acc + item.size, 0)

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('preferred-capture-method') as CaptureMethod
    if (saved) {
      setSavedPreference(saved)
      setCaptureMethod(saved)
    }
  }, [])

  // Fast synchronous device detection - no async needed!
  useEffect(() => {
    const type = fastDeviceDetector.getDeviceType()
    setDeviceType(type === 'ios' || type === 'android' ? 'mobile' : 'desktop')
  }, [])

  // Auto-detect drag events (smart routing)
  useEffect(() => {
    const handleDragEnter = (e: DragEvent): void => {
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true)
        // Auto-switch to dropzone when dragging files
        if (captureMethod === 'auto') {
          setCaptureMethod('dropzone')
        }
      }
    }

    const handleDragLeave = (e: DragEvent): void => {
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragging(false)
      }
    }

    const handleDrop = (): void => {
      setIsDragging(false)
    }

    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('drop', handleDrop)
    }
  }, [captureMethod])

  // Save preference
  const savePreference = useCallback((method: CaptureMethod) => {
    localStorage.setItem('preferred-capture-method', method)
    setSavedPreference(method)
    setCaptureMethod(method)
  }, [])

  // Handle file drops
  const processFiles = useCallback(async (files: File[]) => {
    setIsProcessing(true)
    const newItems: CapturedItem[] = []
    
    // Process files in batches to avoid memory issues
    const batchSize = 50
    const batches = Math.ceil(files.length / batchSize)
    
    for (let i = 0; i < batches; i++) {
      const batch = files.slice(i * batchSize, (i + 1) * batchSize)
      setUploadProgress((i / batches) * 100)
      
      const batchPromises = batch.map(async (file) => {
        // Check file size (6MB limit)
        if (file.size > 6 * 1024 * 1024) {
          console.warn(`File ${file.name} exceeds 6MB limit`)
          return null
        }
        
        return new Promise<CapturedItem | null>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            resolve({
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
              file,
              dataUrl,
              timestamp: new Date(),
              method: 'dropzone',
              size: file.size,
              name: file.name
            })
          }
          reader.onerror = () => resolve(null)
          reader.readAsDataURL(file)
        })
      })
      
      const batchResults = await Promise.all(batchPromises)
      newItems.push(...batchResults.filter(Boolean) as CapturedItem[])
    }
    
    setCapturedItems(prev => [...prev, ...newItems])
    setUploadProgress(100)
    setIsProcessing(false)
    
    // Check if we hit the 1000 item limit
    if (capturedItems.length + newItems.length >= 1000) {
      alert('Maximum 1000 items reached')
    }
  }, [capturedItems.length])

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files: File[]) => void processFiles(files),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 6 * 1024 * 1024, // 6MB
    multiple: true,
    disabled: capturedItems.length >= 1000
  })

  // Handle camera capture
  const handleCameraCapture = useCallback((dataUrl: string) => {
    const newItem: CapturedItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      dataUrl,
      timestamp: new Date(),
      method: deviceType === 'mobile' ? 'mobile' : 'webcam',
      size: dataUrl.length * 0.75, // Approximate size from base64
      name: `capture-${Date.now()}.jpg`
    }
    setCapturedItems(prev => [...prev, newItem])
  }, [deviceType])

  // Smart method selection
  const getActiveMethod = (): CaptureMethod => {
    if (captureMethod !== 'auto') return captureMethod
    
    // Smart routing logic
    if (isDragging) return 'dropzone'
    if (deviceType === 'mobile') return 'mobile'
    return 'webcam'
  }

  const activeMethod = getActiveMethod()

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with method selector and stats */}
      <div className="border-b p-4 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Capture Products</h2>
            
            {/* Method Selector */}
            <Select value={captureMethod} onValueChange={(value: CaptureMethod) => savePreference(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="dropzone">Upload Files</SelectItem>
                <SelectItem value="mobile">Mobile Camera</SelectItem>
                <SelectItem value="webcam">Webcam</SelectItem>
              </SelectContent>
            </Select>
            
            {savedPreference && (
              <Badge variant="secondary">
                Preference saved
              </Badge>
            )}
          </div>
          
          {/* Statistics */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>{totalItems} items</span>
            </div>
            <div className="text-muted-foreground">
              {(totalSize / (1024 * 1024)).toFixed(1)} MB total
            </div>
            {totalItems >= 500 && (
              <Badge variant="outline" className="text-orange-600">
                High volume mode
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main capture area */}
      <div className="flex-1 overflow-hidden">
        {/* Dropzone Mode */}
        {(activeMethod === 'dropzone' || isDragging) && (
          <div 
            {...getRootProps()} 
            className={cn(
              "h-full flex items-center justify-center p-8",
              "border-2 border-dashed rounded-lg transition-all",
              isDragActive || isDragging ? "border-primary bg-primary/5" : "border-gray-300",
              capturedItems.length >= 1000 && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            
            <div className="text-center max-w-md">
              {isProcessing ? (
                <div>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-lg font-medium">Processing files...</p>
                  <Progress value={uploadProgress} className="mt-4" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {Math.round(uploadProgress)}% complete
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-medium mb-2">
                    {isDragActive ? "Drop files here" : "Drag & drop images"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse • Max 6MB per file • Up to 1000 items
                  </p>
                  <Button variant="outline" size="lg">
                    <FolderOpen className="h-5 w-5 mr-2" />
                    Browse Files
                  </Button>
                  
                  {capturedItems.length > 0 && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg text-green-900">
                      <CheckCircle className="h-5 w-5 inline mr-2" />
                      {capturedItems.length} items ready for processing
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Camera Modes with Error Boundary */}
        {(activeMethod === 'mobile' || activeMethod === 'webcam') && !isDragging && (
          <CameraErrorBoundary>
            <AdaptiveCaptureInterface 
              onCapture={handleCameraCapture}
              className="h-full"
              forceDevice={activeMethod === 'mobile' ? 'ios' : 'desktop'}
            />
          </CameraErrorBoundary>
        )}
      </div>

      {/* Bottom action bar */}
      {capturedItems.length > 0 && (
        <div className="border-t p-4 bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={() => setCapturedItems([])}
              >
                Clear All
              </Button>
              <span className="text-sm text-muted-foreground">
                Ready to process {capturedItems.length} items
              </span>
            </div>
            
            <Button 
              size="lg"
              onClick={() => onItemsCaptured(capturedItems)}
              className="gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Process {capturedItems.length} Items
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}