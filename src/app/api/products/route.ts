import { NextRequest, NextResponse } from 'next/server'
import { ProductStatus } from '@prisma/client'

import prisma from '@/lib/prisma'

// GET /api/products - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as ProductStatus | null
    const userId = searchParams.get('userId') || 'default-user'

    const products = await prisma.product.findMany({
      where: {
        ...(status && { status }),
        userId,
      },
      include: {
        photos: true,
        tags: true,
        _count: {
          select: { analyses: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { photos, tags, ...productData } = body

    const product = await prisma.product.create({
      data: {
        ...productData,
        photos: {
          create: photos || []
        },
        tags: {
          connectOrCreate: tags?.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
          })) || []
        }
      },
      include: {
        photos: true,
        tags: true
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}