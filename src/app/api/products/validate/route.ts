import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation request schema
const ValidateRequestSchema = z.object({
  productId: z.string(),
  action: z.enum(['validate', 'reject', 'edit']),
  updates: z.object({
    name: z.string().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    description: z.string().optional(),
    condition: z.string().optional(),
    estimatedMin: z.number().optional(),
    estimatedMax: z.number().optional(),
    tags: z.array(z.string()).optional()
  }).optional(),
  reason: z.string().optional(), // Reason for rejection
  validatedBy: z.string().optional() // User ID for multi-user support
})

const BulkValidateRequestSchema = z.object({
  productIds: z.array(z.string()),
  action: z.enum(['validate', 'reject']),
  reason: z.string().optional(),
  validatedBy: z.string().optional()
})

// Validation history tracking
interface ValidationHistory {
  productId: string
  timestamp: Date
  action: 'validate' | 'reject' | 'edit'
  previousStatus: string
  newStatus: string
  changes?: Record<string, unknown>
  reason?: string
  validatedBy?: string
}

// In-memory storage for validation history (replace with database in production)
const validationHistory: ValidationHistory[] = []

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as { productIds?: string[]; [key: string]: unknown }
    
    // Check if it's a bulk validation request
    if (Array.isArray(body.productIds)) {
      const validatedData = BulkValidateRequestSchema.parse(body)
      return handleBulkValidation(validatedData)
    } else {
      const validatedData = ValidateRequestSchema.parse(body)
      return handleSingleValidation(validatedData)
    }
  } catch (error) {
    console.error('Validation API error:', error)
    
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

function handleSingleValidation(data: z.infer<typeof ValidateRequestSchema>): NextResponse {
  const { productId, action, updates, reason, validatedBy } = data
  
  // Record validation history
  const historyEntry: ValidationHistory = {
    productId,
    timestamp: new Date(),
    action,
    previousStatus: 'ANALYZED', // Would come from database
    newStatus: action === 'validate' ? 'VALIDATED' : action === 'reject' ? 'DRAFT' : 'ANALYZED',
    changes: updates,
    reason,
    validatedBy: validatedBy ?? 'default-user'
  }
  
  validationHistory.push(historyEntry)
  
  // In production, this would update the database
  // For now, we'll just return success
  
  return NextResponse.json({
    success: true,
    productId,
    action,
    newStatus: historyEntry.newStatus,
    timestamp: historyEntry.timestamp,
    message: getSuccessMessage(action, 1)
  })
}

function handleBulkValidation(data: z.infer<typeof BulkValidateRequestSchema>): NextResponse {
  const { productIds, action, reason, validatedBy } = data
  
  const results = []
  const timestamp = new Date()
  
  for (const productId of productIds) {
    const historyEntry: ValidationHistory = {
      productId,
      timestamp,
      action,
      previousStatus: 'ANALYZED',
      newStatus: action === 'validate' ? 'VALIDATED' : 'DRAFT',
      reason,
      validatedBy: validatedBy ?? 'default-user'
    }
    
    validationHistory.push(historyEntry)
    
    results.push({
      productId,
      success: true,
      newStatus: historyEntry.newStatus
    })
  }
  
  return NextResponse.json({
    success: true,
    action,
    processedCount: productIds.length,
    results,
    timestamp,
    message: getSuccessMessage(action, productIds.length)
  })
}

function getSuccessMessage(action: string, count: number): string {
  switch (action) {
    case 'validate':
      return `Successfully validated ${count} product${count !== 1 ? 's' : ''}`
    case 'reject':
      return `Returned ${count} product${count !== 1 ? 's' : ''} to draft status`
    case 'edit':
      return 'Product information updated successfully'
    default:
      return 'Operation completed successfully'
  }
}

// GET endpoint to retrieve validation history
export function GET(request: NextRequest): NextResponse {
  const searchParams = request.nextUrl.searchParams
  const productId = searchParams.get('productId')
  const limit = parseInt(searchParams.get('limit') ?? '10')
  
  let history = validationHistory
  
  if (productId) {
    history = history.filter(h => h.productId === productId)
  }
  
  // Sort by timestamp (newest first) and limit
  history = history
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
  
  return NextResponse.json({
    success: true,
    history,
    total: history.length
  })
}