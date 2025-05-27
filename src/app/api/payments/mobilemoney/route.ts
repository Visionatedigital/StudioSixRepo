import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requestPayment, getCreditPackage } from '@/lib/mobilemoney';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the request body
    const { packageId, phoneNumber } = await req.json();

    // Fetch latest USD/UGX exchange rate
    let exchangeRate = 4000; // fallback default
    try {
      const fxRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const fxData = await fxRes.json();
      if (fxData && fxData.rates && fxData.rates.UGX) {
        exchangeRate = fxData.rates.UGX;
      }
    } catch (e) {
      console.error('Failed to fetch exchange rate, using fallback:', e);
    }

    // Validate the package ID and convert to UGX
    const packageDetails = getCreditPackage(packageId, exchangeRate);
    if (!packageDetails) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      );
    }

    // Validate the phone number (should be in local format starting with 0, e.g., 0772123456)
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Please use format: 0XXXXXXXXX' },
        { status: 400 }
      );
    }

    // Generate a unique payment ID
    const paymentId = uuidv4();
    
    // Create initial metadata
    const metadata = JSON.stringify({
      packageId,
      phoneNumber,
      exchangeRateUsed: exchangeRate
    });

    // Create a payment record in the database using raw SQL
    await prisma.$executeRaw`
      INSERT INTO "Payment" (
        "id", 
        "userId", 
        "amount", 
        "credits", 
        "status", 
        "method", 
        "description", 
        "metadata", 
        "createdAt", 
        "updatedAt"
      ) VALUES (
        ${paymentId}, 
        ${session.user.id}, 
        ${packageDetails.amount}, 
        ${packageDetails.credits}, 
        'PENDING', 
        'MOBILE_MONEY', 
        ${`Purchase of ${packageDetails.credits} credits (${packageDetails.name} package)`}, 
        ${metadata}::jsonb, 
        NOW(), 
        NOW()
      )
    `;

    // Initiate the payment
    const paymentResponse = await requestPayment(
      phoneNumber,
      packageDetails.amount,
      `Purchase of ${packageDetails.credits} credits for Studio Six`
    );

    // Create updated metadata with provider information
    const updatedMetadata = JSON.stringify({
      packageId,
      phoneNumber,
      provider: paymentResponse
    });

    // Update the payment record with the payment provider details
    await prisma.$executeRaw`
      UPDATE "Payment" 
      SET 
        "providerPaymentId" = ${paymentResponse.payment_id},
        "providerReferenceId" = ${paymentResponse.reference_id},
        "providerStatus" = ${paymentResponse.status},
        "metadata" = ${updatedMetadata}::jsonb,
        "updatedAt" = NOW()
      WHERE "id" = ${paymentId}
    `;

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentId,
        amount: packageDetails.amount,
        credits: packageDetails.credits,
        status: 'pending',
        payment_id: paymentResponse.payment_id
      }
    });
  } catch (error) {
    console.error('Error initiating Mobile Money payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initiate payment' },
      { status: 500 }
    );
  }
} 