import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    const url = process.env.DATABASE_URL || '';
    const maskedUrl = url.replace(/:([^:@]+)@/, ':****@');
    
    console.log('--- DB DEBUG START ---');
    console.log('URL:', maskedUrl);
    
    const prisma = new PrismaClient();
    
    try {
        await prisma.$connect();
        const count = await prisma.lead.count();
        return NextResponse.json({
            success: true,
            message: "Connected successfully!",
            leadsInDatabase: count,
            configUsed: {
                host: url.split('@')[1]?.split(':')[0],
                port: url.split(':')[3]?.split('/')[0],
                user: url.split('://')[1]?.split(':')[0]
            }
        });
    } catch (error: any) {
        console.error('DB DEBUG ERROR:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            hint: "If this says 'Authentication Failed', your Vercel Environment Variable is likely not updated yet or has a hidden space.",
            maskedUrl: maskedUrl
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
