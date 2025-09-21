import OpenAI from 'openai'
import { ProductAnalysis, ProductAnalysisSchema, AIAnalysisResult } from '@/types/ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert product identification AI. Analyze product images and provide detailed, accurate information.
Your response must be a valid JSON object matching the specified schema.
Be precise about product names, brands, and models. If uncertain, indicate lower confidence.`

const ANALYSIS_PROMPT = `Analyze this product image and provide:
1. Product name and brand (be specific)
2. Model/SKU if visible
3. Category and subcategory
4. Key features and specifications (list all visible)
5. Condition assessment (new/like-new/good/fair/poor)
6. Estimated retail price range in USD
7. Confidence score (0-1) for your analysis
8. Any visible text, labels, or identifiers
9. Colors and materials

Format your response as a JSON object with these fields:
{
  "name": "Product name",
  "brand": "Brand name (omit if unknown)",
  "model": "Model number (omit if not visible)",
  "category": "Main category",
  "subcategory": "Subcategory (omit if not applicable)",
  "description": "Detailed description",
  "features": ["feature1", "feature2"],
  "specifications": {"key": "value"} (omit if none),
  "condition": "new|like-new|good|fair|poor (omit if cannot determine)",
  "estimatedValue": {"min": number, "max": number, "currency": "USD"} (omit if unsure),
  "confidence": 0.0-1.0,
  "tags": ["tag1", "tag2"] (omit if none),
  "colors": ["color1", "color2"] (omit if not visible),
  "materials": ["material1", "material2"] (omit if unknown)
}`

export async function analyzeProductWithGPT4Vision(
  imageDataUrl: string,
  options: {
    temperature?: number
    maxTokens?: number
  } = {}
): Promise<AIAnalysisResult> {
  const startTime = Date.now()

  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    // Extract base64 data if it's a data URL
    let imageContent = imageDataUrl
    if (imageDataUrl.startsWith('data:image')) {
      imageContent = imageDataUrl.split(',')[1]
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini for cost efficiency, upgrade to gpt-4o for better accuracy
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: ANALYSIS_PROMPT
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl.startsWith('data:') 
                  ? imageDataUrl 
                  : `data:image/jpeg;base64,${imageContent}`,
                detail: "high" // Use high detail for better accuracy
              }
            }
          ]
        }
      ],
      temperature: options.temperature ?? 0.3, // Lower temperature for more consistent results
      max_tokens: options.maxTokens ?? 1500,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse and validate the response
    const rawAnalysis = JSON.parse(content)
    const analysis = ProductAnalysisSchema.parse(rawAnalysis)

    return {
      success: true,
      analysis,
      processingTime: Date.now() - startTime,
      service: 'openai',
      rawResponse: rawAnalysis
    }
  } catch (error) {
    console.error('GPT-4 Vision analysis error:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during analysis',
      processingTime: Date.now() - startTime,
      service: 'openai'
    }
  }
}

export async function analyzeMultipleImages(
  imageDataUrls: string[],
  combineResults: boolean = true
): Promise<AIAnalysisResult> {
  const startTime = Date.now()

  try {
    if (imageDataUrls.length === 0) {
      throw new Error('No images provided for analysis')
    }

    if (imageDataUrls.length === 1) {
      return analyzeProductWithGPT4Vision(imageDataUrls[0])
    }

    // For multiple images, analyze each and combine results
    const analyses = await Promise.all(
      imageDataUrls.map(url => analyzeProductWithGPT4Vision(url))
    )

    const successfulAnalyses = analyses
      .filter(a => a.success && a.analysis)
      .map(a => a.analysis!)

    if (successfulAnalyses.length === 0) {
      throw new Error('All image analyses failed')
    }

    if (!combineResults) {
      // Return the most confident analysis
      const bestAnalysis = successfulAnalyses.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      )
      
      return {
        success: true,
        analysis: bestAnalysis,
        processingTime: Date.now() - startTime,
        service: 'openai'
      }
    }

    // Combine results from multiple angles
    const combinedAnalysis = combineAnalysisResults(successfulAnalyses)

    return {
      success: true,
      analysis: combinedAnalysis,
      processingTime: Date.now() - startTime,
      service: 'openai'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime,
      service: 'openai'
    }
  }
}

function combineAnalysisResults(analyses: ProductAnalysis[]): ProductAnalysis {
  // Use the most common or highest confidence values
  const names = analyses.map(a => ({ value: a.name, confidence: a.confidence }))
  const brands = analyses.map(a => ({ value: a.brand, confidence: a.confidence })).filter(b => b.value)
  const categories = analyses.map(a => ({ value: a.category, confidence: a.confidence }))
  
  // Get the highest confidence name
  const bestName = names.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  )

  // Combine all features and remove duplicates
  const allFeatures = [...new Set(analyses.flatMap(a => a.features))]
  
  // Combine all tags
  const allTags = [...new Set(analyses.flatMap(a => a.tags || []))]
  
  // Combine colors
  const allColors = [...new Set(analyses.flatMap(a => a.colors || []))]
  
  // Average confidence
  const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length

  // Get the most detailed description
  const bestDescription = analyses
    .sort((a, b) => b.description.length - a.description.length)[0].description

  return {
    name: bestName.value,
    brand: brands[0]?.value,
    model: analyses.find(a => a.model)?.model,
    category: categories[0].value,
    subcategory: analyses.find(a => a.subcategory)?.subcategory,
    description: bestDescription,
    features: allFeatures,
    specifications: analyses.find(a => a.specifications)?.specifications,
    condition: analyses.find(a => a.condition)?.condition,
    estimatedValue: analyses.find(a => a.estimatedValue)?.estimatedValue,
    confidence: avgConfidence,
    tags: allTags.length > 0 ? allTags : undefined,
    colors: allColors.length > 0 ? allColors : undefined,
    materials: analyses.find(a => a.materials)?.materials
  }
}