import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.update({
      where: {
        email: 'info@studiosix.ai'
      },
      data: {
        verified: true
      }
    });
    
    console.log('Successfully verified user:', user);
  } catch (error) {
    console.error('Error verifying user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 