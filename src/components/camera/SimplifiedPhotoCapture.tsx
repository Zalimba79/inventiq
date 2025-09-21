"use client"

import React, { useState } from 'react'
import { useCaptureStore } from '@/store/capture-store'
import { CameraView } from './CameraView'
import { PhotoPreview } from './PhotoPreview'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimplifiedPhotoCaptureProps {
  onComplete?: () => void
  className?: string
}

export function SimplifiedPhotoCapture({ onComplete, className }: SimplifiedPhotoCaptureProps) {
  const [showCamera, setShowCamera] = useState(true)
  const { currentSession, startSession, addPhoto, endSession } = useCaptureStore()
  const { toast } = useToast()

  React.useEffect(() => {
    if (!currentSession) {
      startSession()
    }
  }, [currentSession, startSession])

  const handleCapture = (imageSrc: string) => {
    const base64Data = imageSrc.split(',')[1]
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    const size = byteArray.length

    addPhoto({
      dataUrl: imageSrc,
      timestamp: new Date(),
      fileName: `photo-${Date.now()}.jpg`,
      size: size,
      mimeType: 'image/jpeg'
    })

    const newPhotoCount = (currentSession?.photos.length || 0) + 1
    toast({
      title: "Photo captured!",
      description: `${newPhotoCount} ${newPhotoCount === 1 ? 'photo' : 'photos'} in this session`,
    })

    // Briefly show the preview
    setShowCamera(false)
    setTimeout(() => setShowCamera(true), 500)
  }

  const handleComplete = () => {
    if (currentSession && currentSession.photos.length > 0) {
      // Don't end the session here - let the PhotoToProductAssigner handle it
      onComplete?.()
    } else {
      toast({
        title: "No photos captured",
        description: "Please capture at least one photo before completing",
        variant: "destructive"
      })
    }
  }

  const photoCount = currentSession?.photos.length || 0

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {photoCount} {photoCount === 1 ? 'photo' : 'photos'} captured
          </span>
        </div>
        <Button
          onClick={handleComplete}
          disabled={photoCount === 0}
          size="sm"
        >
          <Check className="w-4 h-4 mr-1" />
          Complete
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {showCamera ? (
          <CameraView
            onCapture={handleCapture}
            className="h-full"
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-background">
            <div className="text-center">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">Photo saved!</p>
            </div>
          </div>
        )}
      </div>

      {/* Photo preview strip */}
      {photoCount > 0 && (
        <div className="border-t bg-background flex-shrink-0">
          <PhotoPreview
            photos={currentSession?.photos || []}
            maxVisible={6}
            size="sm"
            className="p-1"
          />
        </div>
      )}
    </div>
  )
}