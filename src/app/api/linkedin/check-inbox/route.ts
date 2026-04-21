import { NextResponse } from 'next/server';
import { checkLinkedInInbox } from '@/lib/linkedin/inbox';

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] LinkedIn Inbox API: Received request`);

  try {
    // 1. Authentication
    const secretHeader = req.headers.get('X-Outreach-Secret');
    if (!secretHeader || secretHeader !== process.env.OUTREACH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Execution
    const result = await checkLinkedInInbox();

    // 3. Response
    return NextResponse.json(result, { status: result.success ? 200 : 500 });

  } catch (error: any) {
    console.error(`[${requestId}] LinkedIn Inbox API: Fatal Error:`, error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
