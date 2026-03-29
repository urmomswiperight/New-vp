import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

const env = dotenv.parse(fs.readFileSync('.env.local'));
const client = new Client({ connectionString: env.DATABASE_URL.replace('localhost', '127.0.0.1') });

async function main() {
  try {
    await client.connect();
    console.log('--- LOCAL DATABASE TABLES ---');
    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    console.log(res.rows.map(r => r.table_name));
    
    // Check if Lead table exists and has data
    const leadExists = res.rows.some(r => r.table_name.toLowerCase() === 'lead');
    if (leadExists) {
        const leadCount = await client.query(`SELECT COUNT(*) FROM "Lead"`);
        console.log(`Table "Lead" exists and has ${leadCount.rows[0].count} leads.`);
    }

  } catch (e: any) {
    console.error('Database connection failed:', e.message);
  } finally {
    await client.end();
  }
}
main();
