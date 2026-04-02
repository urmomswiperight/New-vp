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

    if (event === 'prospect.replied') {
      const email = data.prospect?.email;
      
      if (email) {
        console.log(`[${requestId}] ManyReach Webhook: Lead ${email} replied.`);

        // Find and update the lead status
        const lead = await prisma.lead.findFirst({
          where: { 
            email: email,
            status: { not: 'Replied' }
          }
        });

        if (lead) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { status: 'Replied' }
          });
          console.log(`[${requestId}] ManyReach Webhook: Updated lead ${email} to 'Replied'`);
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
