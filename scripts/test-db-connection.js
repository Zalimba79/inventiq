const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL || 'Not set')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Successfully connected to database')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Query successful:', result)
    
    // Count products
    const productCount = await prisma.product.count()
    console.log(`✅ Found ${productCount} products in database`)
    
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error('Error:', error.message)
    console.error('Error code:', error.code)
    
    if (error.message.includes('P1001')) {
      console.error('\n📝 Possible solutions:')
      console.error('1. Make sure PostgreSQL is running in Docker')
      console.error('2. Check if the container is on port 5432')
      console.error('3. Verify credentials: inventiq/inventiq2025')
      console.error('4. Try: docker-compose -f docker-compose.dev.yml up -d')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()