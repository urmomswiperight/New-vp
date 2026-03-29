import { NextResponse } from 'next/server';
import { runLinkedInOutreach } from '@/lib/linkedin/outreach';

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] LinkedIn Outreach API: Received request`);

  try {
    // 1. Authentication: Verify X-Outreach-Secret header
    const secretHeader = req.headers.get('X-Outreach-Secret');
    if (!secretHeader || secretHeader !== process.env.OUTREACH_SECRET) {
      console.warn(`[${requestId}] LinkedIn Outreach API: Unauthorized access attempt`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Request Body Parsing & Validation
    const body = await req.json().catch(() => ({}));
    const { profileUrl, message, dailyLimit = 25 } = body;

    if (!profileUrl || !message) {
      console.warn(`[${requestId}] LinkedIn Outreach API: Missing required parameters`);
      return NextResponse.json({ error: 'Missing parameters: profileUrl and message are required' }, { status: 400 });
    }

    const maskedUrl = profileUrl.length > 30 ? profileUrl.substring(0, 30) + '...' : profileUrl;
    console.log(`[${requestId}] LinkedIn Outreach API: Starting outreach for ${maskedUrl}`);

    // 3. Execution: Call the shared outreach logic
    const result = await runLinkedInOutreach(profileUrl, message, Number(dailyLimit));

    // 4. Logging Outcome
    if (result.success) {
      console.log(`[${requestId}] LinkedIn Outreach API: Success - Status: ${result.status}, Count today: ${result.countToday}`);
    } else {
      console.error(`[${requestId}] LinkedIn Outreach API: Failure - Error: ${result.error}`);
    }

    // 5. Response: Return result with appropriate status code
    return NextResponse.json(result, { status: result.success ? 200 : 500 });

  } catch (error: any) {
    console.error(`[${requestId}] LinkedIn Outreach API: Fatal Error:`, error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred during outreach' 
    }, { status: 500 });
  }
}

// Force Node.js runtime to support Playwright
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
