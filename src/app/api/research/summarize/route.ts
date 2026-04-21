import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkUsageLimit, incrementUsage } from '@/lib/usage';

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Check Usage Limit
    const usageStatus = await checkUsageLimit(user.id);
    if (!usageStatus.allowed) {
      return NextResponse.json({ 
        error: usageStatus.message,
        status: usageStatus.status,
        daysLeft: usageStatus.daysLeft
      }, { status: 403 });
    }

    // Determine n8n Webhook URL for summarization
    const baseUrl = process.env.N8N_WEBHOOK_URL?.replace('outreach-trigger', 'research-summarize');
    const n8nApiKey = process.env.N8N_WEBHOOK_API_KEY;

    if (!baseUrl || !n8nApiKey) {
      console.error('N8N configuration missing');
      return NextResponse.json({ error: 'Automation service not configured' }, { status: 500 });
    }

    // Trigger n8n Webhook
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': n8nApiKey,
      },
      body: JSON.stringify({
        transcript,
        userId: user.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('n8n error:', errorData);
      return NextResponse.json({ error: 'Failed to process transcript' }, { status: 500 });
    }

    // 2. Increment Usage on Success
    await incrementUsage(user.id);

    const summary = await response.json();
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
