import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.user.updateMany({
      where: {
        verified: true
      },
      data: {
        verified: false
      }
    });
    
    console.log('Successfully unverified all users:', result);
  } catch (error) {
    console.error('Error unverifying users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 