"use client"

import { useState, useCallback } from 'react'
import { ProductAnalysis, ConfidenceScore } from '@/types/ai'
import { useToast } from '@/hooks/use-toast'

interface UseAIAnalysisReturn {
  isAnalyzing: boolean
  analysis: ProductAnalysis | null
  confidenceScores: ConfidenceScore | null
  error: string | null
  analyzeImages: (images: string[]) => Promise<void>
  clearAnalysis: () => void
}

export function useAIAnalysis(): UseAIAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null)
  const [confidenceScores, setConfidenceScores] = useState<ConfidenceScore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const analyzeImages = useCallback(async (images: string[]) => {
    if (images.length === 0) {
      setError('No images provided')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images,
          options: {
            useOpenAI: true,
            confidenceThreshold: 0.7
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      if (data.success && data.analysis) {
        setAnalysis(data.analysis)
        setConfidenceScores(data.confidenceScores)
        
        toast({
          title: "Product Identified!",
          description: `${data.analysis.name} - ${Math.round(data.analysis.confidence * 100)}% confidence`,
        })
      } else {
        throw new Error(data.error || 'No analysis results')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze images'
      setError(errorMessage)
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [toast])

  const clearAnalysis = useCallback(() => {
    setAnalysis(null)
    setConfidenceScores(null)
    setError(null)
  }, [])

  return {
    isAnalyzing,
    analysis,
    confidenceScores,
    error,
    analyzeImages,
    clearAnalysis
  }
}