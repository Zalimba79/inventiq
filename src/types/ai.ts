import { z } from 'zod'

// Zod schemas for validation
export const ProductAnalysisSchema = z.object({
  name: z.string(),
  brand: z.string().optional(),
  model: z.string().optional(),
  category: z.string(),
  subcategory: z.string().optional(),
  description: z.string(),
  features: z.array(z.string()),
  specifications: z.record(z.string()).optional(),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']).optional(),
  estimatedValue: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('USD')
  }).optional(),
  confidence: z.number().min(0).max(1),
  tags: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional()
})

export type ProductAnalysis = z.infer<typeof ProductAnalysisSchema>

export interface AIAnalysisResult {
  success: boolean
  analysis?: ProductAnalysis
  error?: string
  processingTime: number
  service: 'openai' | 'google-vision' | 'combined'
  rawResponse?: unknown
  cached?: boolean
}

export interface AnalysisOptions {
  useOpenAI?: boolean
  useGoogleVision?: boolean
  includeOCR?: boolean
  language?: string
  maxRetries?: number
  confidenceThreshold?: number
}

export interface ImageMetadata {
  width: number
  height: number
  format: string
  size: number
  hash?: string
}

export interface ProductIdentificationRequest {
  images: string[] // Base64 or URLs
  sessionId?: string
  options?: AnalysisOptions
  metadata?: ImageMetadata[]
}

export interface ConfidenceScore {
  overall: number
  name: number
  category: number
  brand: number
  features: number
  value: number
}

export interface AIServiceConfig {
  openai: {
    apiKey: string
    model: string
    maxTokens: number
    temperature: number
  }
  googleVision: {
    projectId: string
    credentials: string
  }
  cache: {
    enabled: boolean
    ttl: number
  }
}