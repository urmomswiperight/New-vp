import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSent, todaySent, pending, replied, interested] = await Promise.all([
      prisma.lead.count({ 
        where: { 
          userId: user.id,
          status: { in: ['Contacted', 'Contacted (Email)', 'Contacted (LinkedIn)', 'Contacted (ManyReach)'] }
        } 
      }),
      prisma.lead.count({ 
        where: { 
          userId: user.id,
          status: { in: ['Contacted', 'Contacted (Email)', 'Contacted (LinkedIn)', 'Contacted (ManyReach)'] },
          updatedAt: { gte: today }
        } 
      }),
      prisma.lead.count({ 
        where: { 
          userId: user.id,
          status: 'New'
        } 
      }),
      prisma.lead.count({ 
        where: { 
          userId: user.id,
          status: 'Replied'
        } 
      }),
      prisma.lead.count({ 
        where: { 
          userId: user.id,
          status: { in: ['Interested', 'Meeting Booked'] }
        } 
      })
    ]);

    return NextResponse.json({
      totalSent,
      todaySent,
      pending,
      replied,
      interested,
      goal: 5000
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
