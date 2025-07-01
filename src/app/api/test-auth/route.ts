import { NextResponse } from 'next/server';

export async function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  return NextResponse.json({
    googleClientId: googleClientId ? 'Set' : 'Not set',
    googleClientSecret: googleClientSecret ? 'Set' : 'Not set',
    nextAuthUrl,
    nextAuthSecret: nextAuthSecret ? 'Set' : 'Not set',
    environment: process.env.NODE_ENV,
  });
} 