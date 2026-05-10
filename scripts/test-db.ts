import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.local explicitly
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    console.log('📖 Loading .env.local...');
    dotenv.config({ path: envPath });
} else {
    console.warn('⚠️ .env.local not found!');
}

async function test() {
    console.log('🧪 Testing Database Connection...');
    
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is not set in environment.');
        return;
    }

    console.log(`🔗 URL: ${dbUrl.replace(/:([^:@]+)@/, ':****@')}`); // Mask password

    // Use our application singleton instead of raw PrismaClient
    const { default: prisma } = await import('../src/lib/prisma');

    try {
        console.log('⏳ Attempting to connect and query User table...');
        const userCount = await prisma.user.count();
        console.log(`✅ SUCCESS! Connected to database. Found ${userCount} users.`);
        
        // Debug: List available models
        const models = Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$'));
        console.log('📦 Available models in Prisma client:', models.join(', '));

        if (!(prisma as any).config) {
            console.error('❌ ERROR: "config" model is missing from the Prisma client.');
            console.error('💡 Hint: Run "npx prisma generate" to update your client.');
            return;
        }

        console.log('⏳ Checking Config table...');
        const configKeys = await (prisma as any).config.findMany({ select: { key: true } });
        console.log(`✅ Found Config keys: ${configKeys.map((c: any) => c.key).join(', ') || 'None'}`);

    } catch (e: any) {
        console.error('❌ CONNECTION FAILED:');
        console.error('Message:', e.message);
        
        if (e.message.includes('P1001')) {
            console.error('💡 Hint: Database server is unreachable. Check if you are using the pooled URL (Port 6543) for IPv4 support.');
        } else if (e.message.includes('P1003')) {
            console.error('💡 Hint: Database or table does not exist. Run npx prisma db push.');
        } else if (e.message.includes('authentication failed')) {
            console.error('💡 Hint: Password or username is incorrect.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

test();
