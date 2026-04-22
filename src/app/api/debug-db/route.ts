import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const url = process.env.DATABASE_URL || '';
    const maskedUrl = url.replace(/:([^:@]+)@/, ':****@');
    
    console.log('--- DB DEBUG START ---');
    console.log('URL:', maskedUrl);
    
    try {
        // Test connection
        await prisma.$connect();
        
        const count = await prisma.lead.count();
        
        return NextResponse.json({
            success: true,
            message: "Connected successfully!",
            leadsInDatabase: count,
            config: {
                hasConnectionString: !!url,
                maskedUrl: maskedUrl
            }
        });
    } catch (error: any) {
        console.error('DB DEBUG ERROR:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            hint: "Check if DATABASE_URL is set in Vercel and if the password is correct.",
            maskedUrl: maskedUrl
        }, { status: 500 });
    }
}
