import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { calculateConfidenceScore } from '@/lib/ai/confidence-scorer'
import { analyzeProductWithGPT4Vision, analyzeMultipleImages } from '@/lib/ai/openai-service'
import type { AnalyzeApiResponse, AnalyzeRequestBody, ServiceStatusResponse, ErrorApiResponse } from '@/types/api'

// Request validation schema
const AnalyzeRequestSchema = z.object({
  images: z.array(z.string()).min(1).max(10),
  sessionId: z.string().optional(),
  options: z.object({
    useOpenAI: z.boolean().optional(),
    useGoogleVision: z.boolean().optional(),
    includeOCR: z.boolean().optional(),
    language: z.string().optional(),
    maxRetries: z.number().optional(),
    confidenceThreshold: z.number().optional()
  }).optional()
})

// Simple in-memory cache (replace with Redis in production)
interface CacheEntry {
  data: AnalyzeApiResponse
  timestamp: number
}
const analysisCache = new Map<string, CacheEntry>()
const CACHE_TTL = parseInt(process.env.AI_CACHE_TTL ?? '3600') * 1000

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeApiResponse | ErrorApiResponse>> {
  try {
    const body = await request.json() as AnalyzeRequestBody
    
    // Validate request
    const validatedData = AnalyzeRequestSchema.parse(body)
    const { images, sessionId } = validatedData

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key not configured. Please add your API key to .env.local' 
        },
        { status: 503 }
      )
    }

    // Generate cache key from images
    const cacheKey = generateCacheKey(images)
    
    // Check cache
    const cachedResult = checkCache(cacheKey)
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true
      })
    }

    // Analyze images
    let result
    if (images.length === 1) {
      result = await analyzeProductWithGPT4Vision(images[0], {
        temperature: 0.3,
        maxTokens: 1500
      })
    } else {
      result = await analyzeMultipleImages(images, true)
    }

    if (!result.success || !result.analysis) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error ?? 'Analysis failed' 
        },
        { status: 400 }
      )
    }

    // Calculate detailed confidence scores
    const confidenceScores = calculateConfidenceScore(result.analysis)
    
    // Prepare response
    const response: AnalyzeApiResponse = {
      success: true,
      analysis: result.analysis,
      confidenceScores,
      processingTime: result.processingTime,
      sessionId: sessionId ?? generateSessionId(),
      timestamp: new Date().toISOString()
    }

    // Cache the result
    cacheResult(cacheKey, response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('AI Analysis API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint for testing
export function GET(): NextResponse<ServiceStatusResponse> {
  return NextResponse.json({
    success: true,
    status: 'ready',
    service: 'AI Product Analysis',
    version: '1.0.0',
    capabilities: {
      openai: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here',
      googleVision: !!process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_PROJECT_ID !== 'your_google_cloud_project_id',
      caching: true,
      maxImages: 10
    }
  })
}

// Helper functions
function generateCacheKey(images: string[]): string {
  // Create a simple hash from the first 100 chars of each image
  return images
    .map(img => img.substring(0, 100))
    .join('|')
    .substring(0, 200)
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function checkCache(key: string): AnalyzeApiResponse | null {
  const cached = analysisCache.get(key)
  if (!cached) return null
  
  const { data, timestamp } = cached
  const age = Date.now() - timestamp
  
  if (age > CACHE_TTL) {
    analysisCache.delete(key)
    return null
  }
  
  return data
}

function cacheResult(key: string, data: AnalyzeApiResponse): void {
  analysisCache.set(key, {
    data,
    timestamp: Date.now()
  })
  
  // Clean old cache entries (simple implementation)
  if (analysisCache.size > 100) {
    const firstKey = analysisCache.keys().next().value
    if (firstKey !== undefined) {
      analysisCache.delete(firstKey)
    }
  }
}