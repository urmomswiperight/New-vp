const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: '.env.local' });

async function sync() {
    console.log('🔄 Starting RAW SQL Session Sync...');

    const sessionValue = process.env.LI_SESSION;
    const dbUrl = process.env.DATABASE_URL;

    if (!sessionValue) {
        console.error('❌ LI_SESSION not found in .env.local');
        return;
    }

    if (!dbUrl) {
        console.error('❌ DATABASE_URL not found in .env.local');
        return;
    }

    const client = new Client({
        connectionString: dbUrl,
    });

    try {
        await client.connect();
        console.log('🔌 Connected to database.');

        const query = `
            INSERT INTO "Config" (key, value, "updatedAt") 
            VALUES ('LI_SESSION', $1, NOW()) 
            ON CONFLICT (key) 
            DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()
        `;

        await client.query(query, [sessionValue]);
        console.log('✅ SQL Sync Successful! Database is now updated with your fresh session.');

    } catch (e) {
        console.error('❌ SQL Sync Failed:', e.message);
    } finally {
        await client.end();
    }
}

sync();
