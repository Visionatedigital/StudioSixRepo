import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { IncomingMessage } from 'http';

// Helper to get raw body
async function getRawBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', err => {
      reject(err);
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('--- CALLBACK RECEIVED ---', req.method, req.url);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let rawBody = '';
  try {
    rawBody = await getRawBody(req);
    console.log('Raw body:', rawBody);
  } catch (err) {
    console.error('❌ Error getting raw body:', err);
    return res.status(400).json({ error: 'Invalid body' });
  }

  const signature = req.headers['x-content-signature'] as string;
  if (!signature) {
    console.error('❌ Missing X-Content-Signature header');
    return res.status(400).json({ error: 'Missing signature header' });
  }

  const secret = process.env.MOBILE_MONEY_CALLBACK_SECRET;
  if (!secret) {
    console.error('❌ Missing MOBILE_MONEY_CALLBACK_SECRET in environment');
    return res.status(500).json({ error: 'Server misconfiguration: missing callback secret' });
  }

  const crypto = require('crypto');
  const computedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  console.log('Signature header:', signature);
  console.log('Computed signature:', computedSignature);

  if (signature !== computedSignature) {
    console.error('❌ Invalid payment callback signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const payload = JSON.parse(rawBody);
    const { 
      status, 
      payment_id, 
      reference_id, 
      message, 
      amount, 
      currency 
    } = payload;

    console.log('📦 Callback payload:', { 
      status, 
      payment_id, 
      reference_id, 
      message,
      amount,
      currency
    });

    // Find the payment in the database using raw SQL query
    const payments = await prisma.$queryRaw`
      SELECT p.*, u."id" as "userId", u."email" as "userEmail" 
      FROM "Payment" p
      JOIN "User" u ON p."userId" = u."id"
      WHERE p."providerPaymentId" = ${payment_id}
      AND p."providerReferenceId" = ${reference_id}
      LIMIT 1
    `;

    if (!payments || (payments as any[]).length === 0) {
      console.error('❌ Payment not found for callback:', { payment_id, reference_id });
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = (payments as any[])[0];
    console.log('✅ Found payment record:', {
      id: payment.id,
      userId: payment.userId,
      currentStatus: payment.status
    });

    // Map the provider status to our status
    let newStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    
    switch (status) {
      case 'successful':
        newStatus = 'SUCCESS';
        break;
      case 'failed':
        newStatus = 'FAILED';
        break;
      case 'pending':
        newStatus = 'PENDING';
        break;
      default:
        newStatus = 'FAILED';
    }

    console.log('🔄 Updating payment status:', {
      from: payment.status,
      to: newStatus,
      providerStatus: status
    });

    const callbackMetadata = JSON.stringify({
      ...payment.metadata,
      callback: payload
    });

    // Update the payment record using Prisma Client
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        providerStatus: status,
        metadata: callbackMetadata,
        updatedAt: new Date(),
      }
    });

    // If payment was successful, credit the user's account
    if (newStatus === 'SUCCESS') {
      console.log('💰 Processing successful payment:', {
        userId: payment.userId,
        credits: payment.credits
      });

      // Update the user's credit balance
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          credits: { increment: payment.credits }
        }
      });

      // Create a transaction record
      await prisma.creditTransaction.create({
        data: {
          userId: payment.userId,
          amount: payment.credits,
          type: 'PURCHASE',
          description: `Mobile Money purchase of ${payment.credits} credits`
        }
      });

      console.log('✅ Credits added successfully');
    }

    // Respond with 200 OK to acknowledge receipt of the callback
    console.log('✅ Callback processed successfully');
    return res.status(200).json({ 
      success: true, 
      status: newStatus 
    });
  } catch (error) {
    console.error('❌ Error processing payment callback:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to process callback' 
    });
  }
} 