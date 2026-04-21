import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] ManyReach Webhook: Received event`);

  try {
    const body = await req.json();
    
    // ManyReach sends various events. We care about 'prospect.replied'
    // Note: You should verify the webhook signature if ManyReach provides one
    const { event, data } = body;

    if (event === 'prospect.replied' || event === 'prospect.interested') {
      const email = data.prospect?.email;
      
      if (email) {
        console.log(`[${requestId}] ManyReach Webhook: Lead ${email} engaged.`);

        // 1. Update Database (Always do this first for reliability)
        const lead = await prisma.lead.findFirst({
          where: { email: email }
        });

        if (lead) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { status: 'Replied' }
          });
          console.log(`[${requestId}] ManyReach Webhook: Updated lead ${email} to 'Replied'`);
        }

        // 2. Optional: Forward to n8n if URL is provided (Proxy Mode)
        const n8nUrl = process.env.N8N_MANYREACH_WEBHOOK_URL;
        if (n8nUrl) {
          console.log(`[${requestId}] ManyReach Webhook: Forwarding to n8n...`);
          fetch(n8nUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          }).catch(err => console.error('n8n Forwarding failed (VPS might be down):', err.message));
        }
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error(`[${requestId}] ManyReach Webhook Error:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
