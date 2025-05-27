import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email;
    await prisma.user.delete({ where: { email: userEmail } });

    // Send confirmation email
    await resend.emails.send({
      from: 'StudioSix <no-reply@studiosix.com>',
      to: userEmail,
      subject: 'Your StudioSix Account Has Been Deleted',
      html: `<p>Your account has been deleted. We're sorry to see you go! If this was a mistake, you can always sign up again at <a href=\"https://studiosix.com\">studiosix.com</a>.</p>`
    });

    return NextResponse.json({ success: true, redirect: '/goodbye' });
  } catch (error: any) {
    console.error('Failed to delete user:', error, error?.message, error?.stack);
    return NextResponse.json({ error: error?.message || 'Failed to delete user', stack: error?.stack, details: String(error) }, { status: 500 });
  }
} 