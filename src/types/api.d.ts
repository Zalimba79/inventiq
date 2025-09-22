/**
 * API Response Types for Inventiq
 */

/** Base API response structure */
interface BaseApiResponse {
  success: boolean
  error?: string
  timestamp?: string
}

/** Product analysis result from AI */
interface ProductAnalysis {
  name?: string
  brand?: string
  model?: string
  category?: string
  subcategory?: string
  description?: string
  features?: string[]
  condition?: string
  confidence?: number
  estimatedMin?: number
  estimatedMax?: number
  currency?: string
}

/** Confidence scores for analysis result */
interface ConfidenceScores {
  overall: number
  name: number
  category: number
  brand: number
  features: number
  value: number
}

/** AI Analysis API Response */
interface AnalyzeApiResponse extends BaseApiResponse {
  analysis?: ProductAnalysis
  confidenceScores?: ConfidenceScores
  processingTime?: number
  sessionId?: string
  cached?: boolean
}

/** AI Analysis Request Body */
interface AnalyzeRequestBody {
  images: string[]
  sessionId?: string
  options?: {
    useOpenAI?: boolean
    useGoogleVision?: boolean
    includeOCR?: boolean
    language?: string
    maxRetries?: number
    confidenceThreshold?: number
  }
}

/** AI Service Status Response */
interface ServiceStatusResponse extends BaseApiResponse {
  status: string
  service: string
  version: string
  capabilities: {
    openai: boolean
    googleVision: boolean
    caching: boolean
    maxImages: number
  }
}

/** Error details for validation errors */
interface ValidationError {
  code: string
  expected: string
  received: string
  path: (string | number)[]
  message: string
}

/** Error API Response */
interface ErrorApiResponse extends BaseApiResponse {
  success: false
  error: string
  details?: ValidationError[]
}

export type {
  BaseApiResponse,
  ProductAnalysis,
  ConfidenceScores,
  AnalyzeApiResponse,
  AnalyzeRequestBody,
  ServiceStatusResponse,
  ErrorApiResponse,
  ValidationError
}