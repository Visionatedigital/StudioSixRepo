import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    
    console.log('Registration attempt:', { email, name, passwordLength: password?.length });

    // Validate input
    if (!email || !password || !name) {
      console.log('Missing fields:', { 
        hasEmail: !!email, 
        hasPassword: !!password, 
        hasName: !!name 
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);
    console.log('Password hashed successfully');

    // Generate verification token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user and verification token
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        emailVerified: null,
      },
    });
    console.log('User created successfully:', { userId: user.id });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });
    console.log('Verification token created');

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    console.log('Verification URL:', verificationUrl);
    
    try {
      const emailResult = await resend.emails.send({
        from: 'Studio Six <noreply@studiosix.ai>',
        to: email,
        subject: 'Verify your email address',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1B1464; margin-bottom: 24px;">Welcome to Studio Six!</h1>
            <p style="color: #666; margin-bottom: 24px;">Please click the button below to verify your email address:</p>
            <a href="${verificationUrl}" style="display: inline-block; background: #844BDC; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500;">Verify Email</a>
            <p style="color: #666; margin-top: 24px;">If you didn't create an account with Studio Six, you can safely ignore this email.</p>
          </div>
        `,
      });
      console.log('Verification email sent:', emailResult);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't throw the error, just log it
    }

    return NextResponse.json({ 
      success: true,
      email,
      message: 'Verification email sent'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
} 