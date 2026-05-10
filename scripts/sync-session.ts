import prisma from '../src/lib/prisma';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function sync() {
    console.log('🔄 Starting LinkedIn Session Force-Sync...');

    const sessionValue = process.env.LI_SESSION;

    if (!sessionValue) {
        console.error('❌ LI_SESSION not found in .env.local');
        process.exit(1);
    }

    try {
        console.log('💾 Upserting session to Config table...');
        // Directly use the imported prisma instance
        await prisma.config.upsert({
            where: { key: 'LI_SESSION' },
            update: { value: sessionValue, updatedAt: new Date() },
            create: { key: 'LI_SESSION', value: sessionValue }
        });
        console.log('✅ Database synchronized successfully!');
    } catch (e: any) {
        console.error('❌ Sync failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

sync();
