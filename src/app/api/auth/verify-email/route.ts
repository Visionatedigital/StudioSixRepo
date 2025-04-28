import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Generate a random verification token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create or update verification token
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email,
          token: token
        }
      },
      update: { token, expires },
      create: { identifier: email, token, expires },
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    
    await resend.emails.send({
      from: 'StudioSix <noreply@studiosix.ai>',
      to: email,
      subject: 'Verify your StudioSix account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #844BDC;">Welcome to StudioSix!</h1>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #844BDC, #AC4FF1); color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create a StudioSix account, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
} 