import { ProductAnalysis, ConfidenceScore } from '@/types/ai'

/**
 * Calculate detailed confidence scores for different aspects of the product analysis
 */
export function calculateConfidenceScore(analysis: ProductAnalysis): ConfidenceScore {
  const scores: ConfidenceScore = {
    overall: analysis.confidence,
    name: 0,
    category: 0,
    brand: 0,
    features: 0,
    value: 0
  }

  // Name confidence based on specificity and length
  if (analysis.name) {
    const nameWords = analysis.name.split(' ').length
    scores.name = Math.min(1, (nameWords >= 2 ? 0.7 : 0.4) + (analysis.name.length > 10 ? 0.3 : 0))
  }

  // Category confidence based on presence of subcategory
  if (analysis.category) {
    scores.category = analysis.subcategory ? 0.9 : 0.7
  }

  // Brand confidence
  if (analysis.brand) {
    scores.brand = isKnownBrand(analysis.brand) ? 0.95 : 0.6
  }

  // Features confidence based on count and detail
  const featureCount = analysis.features?.length || 0
  scores.features = Math.min(1, featureCount * 0.15)

  // Value confidence based on range
  if (analysis.estimatedValue?.min && analysis.estimatedValue?.max) {
    const range = analysis.estimatedValue.max - analysis.estimatedValue.min
    const percentage = range / analysis.estimatedValue.max
    scores.value = percentage < 0.3 ? 0.8 : percentage < 0.5 ? 0.6 : 0.4
  }

  // Recalculate overall as weighted average
  const weights = {
    name: 0.3,
    category: 0.2,
    brand: 0.2,
    features: 0.2,
    value: 0.1
  }

  scores.overall = Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + (scores[key as keyof typeof weights] * weight)
  }, 0)

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