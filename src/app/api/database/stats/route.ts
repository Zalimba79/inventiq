import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Get counts from database
    const productCount = await prisma.product.count()
    const photoCount = await prisma.productPhoto.count()
    // Users table might not exist yet, so we'll default to 1
    const userCount = 1
    
    // Get connection string (masked for security)
    const connectionString = process.env.DATABASE_URL?.includes('inventiq')
      ? 'postgresql://inventiq:****@localhost:5432/inventiq'
      : 'postgresql://****:****@localhost:5432/****'
    
    return NextResponse.json({
      success: true,
      products: productCount,
      photos: photoCount,
      users: userCount,
      connectionString,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database stats error:', error)
    return NextResponse.json({
      success: false,
      products: 0,
      photos: 0,
      users: 0,
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}