import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ChatGPTSessionManager from '@/lib/chatgpt-session';

// Import the global variables from the connect route
// Note: In a real production app, you'd want to use a proper session management system
// For now, we'll use a simple global state approach

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('[CHATGPT-PROXY] Sending message:', message);

    const sessionManager = ChatGPTSessionManager.getInstance();

    try {
      // Check if we have an active session
      if (!sessionManager.isConnected()) {
        // Try to create a new session
        await sessionManager.createSession();
      }

      // Send message using the session manager
      const response = await sessionManager.sendMessage(message);
      
      console.log('[CHATGPT-PROXY] Received response');
      
      return NextResponse.json({ 
        response: response,
        success: true 
      });

    } catch (error: any) {
      console.error('[CHATGPT-PROXY MESSAGE ERROR]', error);
      
      // Fallback to existing AI chat endpoint
      try {
        const fallbackResponse = await fetch(`${req.nextUrl.origin}/api/ai-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: message }),
        });

        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          return NextResponse.json({ 
            response: data.response,
            success: true,
            fallback: true
          });
        }
      } catch (fallbackError) {
        console.error('[CHATGPT-PROXY] Fallback also failed:', fallbackError);
      }
      
      // Final fallback response
      return NextResponse.json({ 
        response: "I'm sorry, I'm having trouble connecting to ChatGPT right now. Please try again in a moment.",
        success: false 
      });
    }

  } catch (error: any) {
    console.error('[CHATGPT-PROXY MESSAGE ERROR]', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send message' 
    }, { status: 500 });
  }
} 