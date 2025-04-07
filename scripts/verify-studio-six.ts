import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // First find the user by name
    const user = await prisma.user.findFirst({
      where: {
        name: 'Studio Six'
      }
    });

    if (!user) {
      console.error('Studio Six user not found');
      return;
    }

    // Then update the user
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        verified: true
      }
    });

    console.log('Successfully verified Studio Six user:', updatedUser);
  } catch (error) {
    console.error('Error verifying Studio Six user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 