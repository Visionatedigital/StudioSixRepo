import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ChatGPTSessionManager from '@/lib/chatgpt-session-playwright';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const sessionManager = ChatGPTSessionManager.getInstance();
    const chatSession = await sessionManager.getSession() || await sessionManager.createSession();

    if (!chatSession) {
      throw new Error('Failed to create or get ChatGPT session');
    }

    console.log('[AI-CHAT] Sending message:', prompt);
    const response = await sessionManager.sendMessage(prompt);

    console.log('[AI-CHAT] Got response.');
    return NextResponse.json({ response });

  } catch (error: any) {
    console.error('[AI-CHAT API ERROR]', error);
    return NextResponse.json({ error: error.message || 'Failed to get response from ChatGPT' }, { status: 500 });
  }
} 