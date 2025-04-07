const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSubscription() {
  try {
    // Update user subscription status
    const user = await prisma.user.update({
      where: { email: 'ivanssempijja00@gmail.com' },
      data: { subscriptionStatus: 'ACTIVE' }
    });

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: user.id }
    });

    if (existingSubscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: 'pro',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          autoRenew: true
        }
      });
    }

    console.log('Successfully updated subscription');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSubscription(); 