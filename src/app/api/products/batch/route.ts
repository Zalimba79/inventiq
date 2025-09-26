import { NextRequest, NextResponse } from 'next/server'
import { ProductStatus } from '@prisma/client'

import prisma from '@/lib/prisma'

// POST /api/products/batch - Batch operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { operation, productIds, data } = body

    switch (operation) {
      case 'updateStatus': {
        const result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { 
            status: data.status as ProductStatus,
            updatedAt: new Date()
          }
        })
        return NextResponse.json(result)
      }

      case 'delete': {
        const result = await prisma.product.deleteMany({
          where: { id: { in: productIds } }
        })
        return NextResponse.json(result)
      }

      case 'analyze': {
        // Queue products for analysis
        const queue = await prisma.analysisQueue.create({
          data: {
            productIds: productIds,
            status: 'pending'
          }
        })
        
        // Update products status to QUEUED
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { 
            status: 'QUEUED',
            updatedAt: new Date()
          }
        })

        return NextResponse.json(queue)
      }

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in batch operation:', error)
    return NextResponse.json(
      { error: 'Batch operation failed' },
      { status: 500 }
    )
  }
}