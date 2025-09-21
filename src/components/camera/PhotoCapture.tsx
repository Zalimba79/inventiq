"use client"

import React, { useState } from 'react'
import { useCaptureStore } from '@/store/capture-store'
import { CameraView } from './CameraView'
import { PhotoPreview } from './PhotoPreview'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAIAnalysis } from '@/hooks/use-ai-analysis'
import { ProductAnalysisCard } from '@/components/ai/ProductAnalysisCard'
import { Check, ChevronLeft, Package, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoCaptureProps {
  onComplete?: () => void
  className?: string
}

export function PhotoCapture({ onComplete, className }: PhotoCaptureProps) {
  const [showCamera, setShowCamera] = useState(true)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const { currentSession, startSession, addPhoto, endSession } = useCaptureStore()
  const { toast } = useToast()
  const { isAnalyzing, analysis, confidenceScores, analyzeImages, clearAnalysis } = useAIAnalysis()

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

    toast({
      title: "Photo captured!",
      description: `${currentSession?.photos.length || 0} photos in this session`,
    })

    // Briefly show the preview
    setShowCamera(false)
    setTimeout(() => setShowCamera(true), 500)
  }

  const handleComplete = async () => {
    if (currentSession && currentSession.photos.length > 0) {
      // Show AI analysis option
      setShowAnalysis(true)
      
      // Analyze photos with AI
      const imageUrls = currentSession.photos.map(p => p.dataUrl)
      await analyzeImages(imageUrls)
    } else {
      toast({
        title: "No photos captured",
        description: "Please capture at least one photo before completing",
        variant: "destructive"
      })
    }
  }

  const handleValidateProduct = () => {
    endSession()
    toast({
      title: "Product validated",
      description: analysis ? `${analysis.name} has been added to inventory` : "Product saved",
    })
    onComplete?.()
  }

  const handleRejectAnalysis = () => {
    clearAnalysis()
    setShowAnalysis(false)
    toast({
      title: "Analysis rejected",
      description: "Please capture more photos or edit manually",
    })
  }

  const photoCount = currentSession?.photos.length || 0

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Product Photo Capture</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
          </span>
          <Button
            onClick={handleComplete}
            disabled={photoCount === 0}
            size="sm"
          >
            <Check className="w-4 h-4 mr-2" />
            Complete
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">
        {showAnalysis && analysis && confidenceScores ? (
          <div className="h-full overflow-y-auto p-4">
            <ProductAnalysisCard
              analysis={analysis}
              confidenceScores={confidenceScores}
              onValidate={handleValidateProduct}
              onReject={handleRejectAnalysis}
            />
          </div>
        ) : isAnalyzing ? (
          <div className="h-full flex items-center justify-center bg-background">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Analyzing Product...</h3>
              <p className="text-muted-foreground">Using AI to identify your product</p>
            </div>
          </div>
        ) : showCamera ? (
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
        <div className="border-t bg-background">
          <PhotoPreview
            photos={currentSession?.photos || []}
            maxVisible={5}
            size="sm"
            className="p-2"
          />
        </div>
      )}
    </div>
  )
}