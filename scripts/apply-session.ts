import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function apply() {
    console.log('🚀 Applying Fresh Session to Supabase...');

    const filePath = path.resolve(process.cwd(), 'LI_SESSION_FRESH.json');
    if (!fs.existsSync(filePath)) {
        console.error('❌ LI_SESSION_FRESH.json not found! Run npx tsx scripts/extract-session.ts first.');
        return;
    }

    const sessionValue = fs.readFileSync(filePath, 'utf8');
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.error('❌ DATABASE_URL not found in .env.local');
        return;
    }

    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        console.log('🔌 Connected to Supabase.');

        const query = `
            INSERT INTO "Config" (key, value, "updatedAt") 
            VALUES ('LI_SESSION', $1, NOW()) 
            ON CONFLICT (key) 
            DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()
        `;

        await client.query(query, [sessionValue]);
        console.log('✅ SUCCESS: Database updated with fresh session.');
        console.log('💡 Now update your GitHub Secret "LI_SESSION" with the contents of LI_SESSION_FRESH.json');

    } catch (e: any) {
        console.error('❌ SQL Update Failed:', e.message);
    } finally {
        await client.end();
    }
}

apply();
