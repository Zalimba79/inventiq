const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixNullRotations() {
  try {
    console.log('Fixing null rotations...')
    
    // Update all null angles to '0'
    const result = await prisma.productPhoto.updateMany({
      where: {
        angle: null
      },
      data: {
        angle: '0'
      }
    })
    
    console.log(`Fixed ${result.count} null rotations to '0'`)
    
    // Verify all photos now have angle = '0'
    const photosWithRotation = await prisma.productPhoto.findMany({
      where: {
        angle: {
          not: '0'
        }
      }
    })
    
    if (photosWithRotation.length === 0) {
      console.log('✅ All photo rotations are now reset to 0')
    } else {
      console.log(`⚠️ ${photosWithRotation.length} photos still have non-zero rotation`)
    }
    
  } catch (error) {
    console.error('Error fixing null rotations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixNullRotations()