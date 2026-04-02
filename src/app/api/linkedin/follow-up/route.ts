import { NextResponse } from 'next/server';
import { runLinkedInFollowUp } from '@/lib/linkedin/follow-up';

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] LinkedIn Follow-Up API: Received request`);

  try {
    // 1. Authentication
    const secretHeader = req.headers.get('X-Outreach-Secret');
    if (!secretHeader || secretHeader !== process.env.OUTREACH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Request Body
    const body = await req.json().catch(() => ({}));
    const { message, daysDelay = 3 } = body;

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // 3. Execution
    const result = await runLinkedInFollowUp(message, Number(daysDelay));

    // 4. Response
    return NextResponse.json(result, { status: result.success ? 200 : 500 });

  } catch (error: any) {
    console.error(`[${requestId}] LinkedIn Follow-Up API: Fatal Error:`, error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
