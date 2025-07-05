import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ChatGPTSessionManager from '@/lib/chatgpt-session';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionManager = ChatGPTSessionManager.getInstance();

    // Check if already connected
    if (sessionManager.isConnected()) {
      return NextResponse.json({ 
        success: true, 
        message: 'Already connected to ChatGPT' 
      });
    }

    console.log('[CHATGPT-PROXY] Starting connection...');

    // Create new session
    await sessionManager.createSession();

    console.log('[CHATGPT-PROXY] Successfully connected to ChatGPT');

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully connected to ChatGPT' 
    });

  } catch (error: any) {
    console.error('[CHATGPT-PROXY CONNECTION ERROR]', error);
    
    return NextResponse.json({ 
      error: error.message || 'Failed to connect to ChatGPT' 
    }, { status: 500 });
  }
} 