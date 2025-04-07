import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { PAYFAST_CONFIG } from '@/lib/payfast';

interface PayFastMetadata {
  userId: string;
  credits: number;
  [key: string]: any;
}

// Verify PayFast signature
function verifySignature(data: Record<string, string>, signature: string): boolean {
  const stringData = Object.entries(data)
    .filter(([key]) => key !== 'signature')
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>);

  const signatureString = Object.entries(stringData)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  const calculatedSignature = createHash('md5')
    .update(signatureString + PAYFAST_CONFIG.passPhrase)
    .digest('hex')
    .toUpperCase();

  return calculatedSignature === signature.toUpperCase();
}

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const body = await request.text();
    const data = Object.fromEntries(new URLSearchParams(body));
    
    // Verify signature
    const signature = data.signature;
    if (!signature || !verifySignature(data, signature)) {
      console.error('Invalid signature');
      return new NextResponse('Invalid signature', { status: 400 });
    }

    // Extract payment details
    const {
      m_payment_id,
      pf_payment_id,
      payment_status,
      amount_gross,
      custom_str1,
    } = data;

    // Parse metadata
    let metadata: PayFastMetadata = {
      userId: '',
      credits: 0
    };
    try {
      const parsedMetadata = JSON.parse(custom_str1 || '{}');
      metadata = {
        ...metadata,
        ...parsedMetadata
      };
    } catch (error) {
      console.error('Failed to parse metadata:', error);
    }

    // Update or create payment transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // Create or update the payment transaction
      const payment = await tx.paymentTransaction.upsert({
        where: { reference: m_payment_id },
        create: {
          reference: m_payment_id,
          providerReference: pf_payment_id,
          amount: parseFloat(amount_gross),
          status: payment_status,
          provider: 'payfast',
          metadata,
        },
        update: {
          status: payment_status,
          providerReference: pf_payment_id,
          metadata,
        },
      });

      // If payment is COMPLETE, credit the user's account
      if (payment_status === 'COMPLETE' && metadata.userId && metadata.credits > 0) {
        await tx.user.update({
          where: { id: metadata.userId },
          data: {
            credits: {
              increment: metadata.credits,
            },
          },
        });
      }

      return payment;
    });

    return new NextResponse('OK');
  } catch (error) {
    console.error('PayFast notification error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 