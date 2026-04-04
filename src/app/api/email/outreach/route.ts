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
    const { campaignId, baseListId, email, firstName, lastName, company, icebreaker } = body;

    if (!campaignId || !email) {
      return NextResponse.json({ error: 'campaignId and email are required' }, { status: 400 });
    }

    // 3. ManyReach API Configuration
    const apiKey = process.env.MANYREACH_API_KEY;
    if (!apiKey) {
      console.error(`[${requestId}] ManyReach API: MANYREACH_API_KEY is not defined`);
      return NextResponse.json({ error: 'ManyReach service not configured' }, { status: 500 });
    }

    // Fallback to the discovered baseListId if not provided in the request
    const finalBaseListId = baseListId || process.env.MANYREACH_BASE_LIST_ID || 86894;

    console.log(`[${requestId}] ManyReach API: Pushing prospect ${email} to campaign ${campaignId} (List: ${finalBaseListId})`);

    // 4. Push Prospect to ManyReach
    const response = await fetch('https://api.manyreach.com/api/v2/prospects', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        campaignId: Number(campaignId),
        baseListId: Number(finalBaseListId),
        email,
        firstName,
        lastName,
        company,
        icebreaker
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle 409 Conflict (Lead already exists in ManyReach)
      if (response.status === 409) {
        console.log(`[${requestId}] ManyReach API: Lead ${email} already exists. Continuing...`);
        return NextResponse.json({ 
          success: true, 
          status: 'Already Exists',
          details: 'Prospect already exists in ManyReach' 
        });
      }

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
