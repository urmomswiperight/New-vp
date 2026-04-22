import prisma from '../src/lib/prisma';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testConnection() {
    console.log('🔍 Testing Database Connection...');
    console.log(`URL: ${process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@')}`); // Mask password

    try {
        await prisma.$connect();
        console.log('✅ SUCCESS: Connected to the database!');
        const count = await prisma.lead.count();
        console.log(`📊 Lead Count: ${count}`);
    } catch (error: any) {
        console.error('❌ CONNECTION FAILED:');
        console.error(`Code: ${error.code}`);
        console.error(`Message: ${error.message}`);
        
        if (error.message.includes('Authentication failed')) {
            console.log('\n💡 TIP: Your password likely contains special characters like "%" that are being misinterpreted.');
            console.log('Try encoding your password or using a password without special characters in the Supabase Dashboard.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
