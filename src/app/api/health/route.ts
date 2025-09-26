import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Health check endpoint for Docker
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      app: true,
      database: false,
      minio: false
    }
  }

  // Check database connection
  try {
    const prisma = new PrismaClient()
    await prisma.$queryRaw`SELECT 1`
    await prisma.$disconnect()
    health.checks.database = true
  } catch (error) {
    health.status = 'degraded'
    health.checks.database = false
  }

  // Check MinIO connection
  try {
    const minioUrl = process.env.S3_ENDPOINT || 'http://localhost:9000'
    const response = await fetch(`${minioUrl}/minio/health/live`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    })
    health.checks.minio = response.ok
  } catch (error) {
    health.checks.minio = false
  }

  // Determine overall health
  if (!health.checks.database) {
    health.status = 'unhealthy'
  }

  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 503 : 500

  return NextResponse.json(health, { status: statusCode })
}