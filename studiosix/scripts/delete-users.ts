import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllUsers() {
  try {
    // Delete all chat messages first
    await prisma.chatMessage.deleteMany();
    console.log('Deleted all chat messages');

    // Delete all projects
    await prisma.project.deleteMany();
    console.log('Deleted all projects');

    // Delete all subscriptions
    await prisma.subscription.deleteMany();
    console.log('Deleted all subscriptions');

    // Delete all payment transactions
    await prisma.paymentTransaction.deleteMany();
    console.log('Deleted all payment transactions');

    // Delete all users
    await prisma.user.deleteMany();
    console.log('Deleted all users');

    console.log('Successfully deleted all users and related data');
  } catch (error) {
    console.error('Error deleting users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsers(); 