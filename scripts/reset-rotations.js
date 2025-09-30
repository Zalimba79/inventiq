const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetAllRotations() {
  try {
    console.log('Starting rotation reset...')
    
    // Reset all photo angles to '0'
    const result = await prisma.productPhoto.updateMany({
      where: {
        angle: {
          not: '0'
        }
      },
      data: {
        angle: '0'
      }
    })
    
    console.log(`Reset ${result.count} photo rotations to 0`)
    
    // Also get some stats
    const totalPhotos = await prisma.productPhoto.count()
    console.log(`Total photos in database: ${totalPhotos}`)
    
    // Show a sample of photos to verify
    const samplePhotos = await prisma.productPhoto.findMany({
      take: 5,
      select: {
        id: true,
        angle: true,
        url: true
      }
    })
    
    console.log('\nSample photos after reset:')
    samplePhotos.forEach(photo => {
      console.log(`- Photo ${photo.id}: angle = ${photo.angle}`)
    })
    
  } catch (error) {
    console.error('Error resetting rotations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAllRotations()