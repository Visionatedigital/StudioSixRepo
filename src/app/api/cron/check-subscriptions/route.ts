import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dynamicConfig } from '../../config';

export const dynamic = dynamicConfig.dynamic;
export const revalidate = dynamicConfig.revalidate;

export async function GET(request: Request) {
  try {
    // Verify the request is from a cron job (you should add proper authentication)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    
    // Find all active subscriptions that have expired
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: now
        }
      },
      include: {
        user: true
      }
    });

    // Update expired subscriptions
    for (const subscription of expiredSubscriptions) {
      // Update subscription status
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' }
      });

      // Update user's subscription status
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { subscriptionStatus: 'EXPIRED' }
      });

      // If auto-renew is enabled, create a new subscription
      if (subscription.autoRenew) {
        const newStartDate = new Date();
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + 30); // 30-day subscription

        await prisma.subscription.create({
          data: {
            userId: subscription.userId,
            planId: subscription.planId,
            status: 'ACTIVE',
            startDate: newStartDate,
            endDate: newEndDate,
            autoRenew: true
          }
        });

        // Update user's subscription status back to active
        await prisma.user.update({
          where: { id: subscription.userId },
          data: { subscriptionStatus: 'ACTIVE' }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${expiredSubscriptions.length} expired subscriptions`
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 