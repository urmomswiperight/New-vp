import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] ManyReach API: Received request`);

  try {
    // 1. Authentication: Verify X-Outreach-Secret header
    const secretHeader = req.headers.get('X-Outreach-Secret');
    if (!secretHeader || secretHeader !== process.env.OUTREACH_SECRET) {
      console.warn(`[${requestId}] ManyReach API: Unauthorized access attempt`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Request Body Parsing
    const body = await req.json().catch(() => ({}));
    const { campaignId, email, firstName, lastName, company } = body;

    if (!campaignId || !email) {
      return NextResponse.json({ error: 'campaignId and email are required' }, { status: 400 });
    }

    // 3. ManyReach API Configuration
    const apiKey = process.env.MANYREACH_API_KEY;
    if (!apiKey) {
      console.error(`[${requestId}] ManyReach API: MANYREACH_API_KEY is not defined`);
      return NextResponse.json({ error: 'ManyReach service not configured' }, { status: 500 });
    }

    console.log(`[${requestId}] ManyReach API: Pushing prospect ${email} to campaign ${campaignId}`);

    // 4. Push Prospect to ManyReach
    const response = await fetch('https://api.manyreach.com/api/v2/prospects', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        campaignId: Number(campaignId),
        email,
        firstName,
        lastName,
        company
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] ManyReach API Error:`, response.status, errorText);
      return NextResponse.json({ 
        success: false, 
        error: `ManyReach API error: ${response.status}`,
        details: errorText 
      }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    console.error(`[${requestId}] ManyReach API Fatal Error:`, error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
