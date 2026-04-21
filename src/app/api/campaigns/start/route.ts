import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { checkUsageLimit, incrementUsage } from '@/lib/usage';

export async function POST(req: Request) {
  try {
    const { campaignId } = await req.json();

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
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

    // Verify campaign exists, belongs to user, and is Active
    const campaign = await prisma.campaign.findUnique({
      where: { 
        id: campaignId,
        userId: user.id
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'Active') {
      return NextResponse.json({ error: 'Campaign is not Active' }, { status: 400 });
    }

    // Determine n8n Webhook URL based on campaign type
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const n8nApiKey = process.env.N8N_WEBHOOK_API_KEY;

    if (!n8nWebhookUrl || !n8nApiKey) {
      console.error('N8N configuration missing');
      return NextResponse.json({ error: 'Automation service not configured' }, { status: 500 });
    }

    // Trigger n8n Webhook
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': n8nApiKey,
      },
      body: JSON.stringify({
        campaignId: campaign.id,
        userId: user.id,
        campaignType: campaign.type,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('n8n error:', errorData);
      return NextResponse.json({ error: 'Failed to trigger campaign' }, { status: 500 });
    }

    // 2. Increment Usage on Success
    await incrementUsage(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Campaign start error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
