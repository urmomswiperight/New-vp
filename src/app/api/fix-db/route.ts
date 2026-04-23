import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        return NextResponse.json({ error: 'DATABASE_URL not found' }, { status: 500 });
    }

    const pool = new Pool({ connectionString });

    try {
        console.log('Running manual DB migration...');
        
        // Add missing columns to Lead table
        await pool.query(`
            ALTER TABLE "Lead" 
            ADD COLUMN IF NOT EXISTS "sentiment" TEXT,
            ADD COLUMN IF NOT EXISTS "lastMessage" TEXT,
            ADD COLUMN IF NOT EXISTS "followUpStep" INTEGER DEFAULT 0;
        `);

        await pool.end();
        
        return NextResponse.json({
            success: true,
            message: "Database schema updated successfully! Added missing columns to Lead table."
        });
    } catch (error: any) {
        console.error('Migration Error:', error);
        await pool.end();
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
