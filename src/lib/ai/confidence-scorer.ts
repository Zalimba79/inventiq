import { type ProductAnalysis, type ConfidenceScore } from '@/types/ai'

// Helper functions to reduce complexity
function calculateNameScore(name: string | undefined): number {
  if (!name) return 0
  const nameWords = name.split(' ').length
  return Math.min(1, (nameWords >= 2 ? 0.7 : 0.4) + (name.length > 10 ? 0.3 : 0))
}

function calculateCategoryScore(category: string | undefined, subcategory: string | undefined): number {
  if (!category) return 0
  return subcategory ? 0.9 : 0.7
}

function calculateBrandScore(brand: string | undefined): number {
  if (!brand) return 0
  return isKnownBrand(brand) ? 0.95 : 0.6
}

function calculateFeaturesScore(features: string[] | undefined): number {
  const featureCount = features?.length ?? 0
  return Math.min(1, featureCount * 0.15)
}

function calculateValueScore(estimatedValue: { min?: number; max?: number } | undefined): number {
  if (!estimatedValue?.min || !estimatedValue?.max) return 0
  const range = estimatedValue.max - estimatedValue.min
  const percentage = range / estimatedValue.max
  return percentage < 0.3 ? 0.8 : percentage < 0.5 ? 0.6 : 0.4
}

/**
 * Calculate detailed confidence scores for different aspects of the product analysis
 */
export function calculateConfidenceScore(analysis: ProductAnalysis): ConfidenceScore {
  const scores: ConfidenceScore = {
    overall: analysis.confidence,
    name: calculateNameScore(analysis.name),
    category: calculateCategoryScore(analysis.category, analysis.subcategory),
    brand: calculateBrandScore(analysis.brand),
    features: calculateFeaturesScore(analysis.features),
    value: calculateValueScore(analysis.estimatedValue)
  }

  // Recalculate overall as weighted average
  const weights = {
    name: 0.3,
    category: 0.2,
    brand: 0.2,
    features: 0.2,
    value: 0.1
  }

  scores.overall = Object.entries(weights).reduce((sum, [key, weight]) => sum + (scores[key as keyof typeof weights] * weight), 0)

  return scores
}

/**
 * Check if a brand is in our known brands list
 * In production, this would query a database
 */
function isKnownBrand(brand: string): boolean {
  const knownBrands = [
    'Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Microsoft',
    'Google', 'Amazon', 'Dell', 'HP', 'Lenovo', 'Asus',
    'Canon', 'Nikon', 'LG', 'Panasonic', 'Bose', 'JBL',
    'Nintendo', 'PlayStation', 'Xbox', 'Fitbit', 'Garmin',
    'GoPro', 'DJI', 'Roku', 'Nest', 'Ring', 'Sonos'
  ]

  return knownBrands.some(known => 
    brand.toLowerCase().includes(known.toLowerCase())
  )
}

/**
 * Determine if confidence meets threshold for auto-validation
 */
export function meetsConfidenceThreshold(
  scores: ConfidenceScore,
  threshold: number = 0.7
): boolean {
  return scores.overall >= threshold &&
         scores.name >= 0.6 &&
         scores.category >= 0.6
}

/**
 * Get confidence level as a human-readable string
 */
export function getConfidenceLevel(score: number): {
  level: 'high' | 'medium' | 'low'
  label: string
  color: string
} {
  if (score >= 0.8) {
    return {
      level: 'high',
      label: 'High Confidence',
      color: 'text-green-600'
    }
  } else if (score >= 0.6) {
    return {
      level: 'medium',
      label: 'Medium Confidence',
      color: 'text-yellow-600'
    }
  } else {
    return {
      level: 'low',
      label: 'Low Confidence',
      color: 'text-red-600'
    }
  }
}

/**
 * Generate suggestions for improving confidence
 */
export function getImprovementSuggestions(
  scores: ConfidenceScore
): string[] {
  const suggestions: string[] = []

  if (scores.name < 0.7) {
    suggestions.push('Take a clearer photo of the product label or brand mark')
  }

  if (scores.category < 0.7) {
    suggestions.push('Capture the entire product to better identify its category')
  }

  if (scores.brand < 0.5) {
    suggestions.push('Include any visible logos or brand identifiers')
  }

  if (scores.features < 0.5) {
    suggestions.push('Take multiple angles to capture all product features')
  }

  if (scores.value < 0.5) {
    suggestions.push('Include any price tags or model numbers for better value estimation')
  }

  return suggestions
}