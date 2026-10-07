import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { streamCareerHubAssistant } from '@/services/assistant-ai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to use CareerHub AI Assistant.' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const { messages = [], currentContext = {} } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Valid messages array is required.' }, { status: 400 });
    }

    // Set up ReadableStream for real-time response streaming
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Run streaming in the background while returning Response with readable stream
    streamCareerHubAssistant({
      messages,
      currentContext,
      userId,
      onToken: async (chunk) => {
        try {
          await writer.write(encoder.encode(chunk));
        } catch {
          // Stream might be closed by client
        }
      },
      onComplete: async () => {
        try {
          await writer.close();
        } catch {
          // ignore
        }
      },
      onError: async (err) => {
        try {
          console.error('CareerHub Assistant Stream Error:', err);
          await writer.write(
            encoder.encode('CareerHub AI is temporarily unavailable. Please try again.')
          );
          await writer.close();
        } catch {
          // ignore
        }
      },
    });

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Assistant API Route Handler Error:', error);
    return NextResponse.json(
      { error: 'CareerHub AI is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
