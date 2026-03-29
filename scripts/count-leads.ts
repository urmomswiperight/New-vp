import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

const env = dotenv.parse(fs.readFileSync('.env.local'));
const client = new Client({ connectionString: env.DATABASE_URL.replace('localhost', '127.0.0.1') });

async function main() {
  try {
    await client.connect();
    const res = await client.query('SELECT region, COUNT(*) FROM "Lead" GROUP BY region');
    console.log('Lead counts by region:', res.rows);
    
    const statusRes = await client.query('SELECT status, COUNT(*) FROM "Lead" GROUP BY status');
    console.log('Lead counts by status:', statusRes.rows);

    const liRes = await client.query('SELECT COUNT(*) FROM "Lead" WHERE "linkedinUrl" IS NOT NULL AND "linkedinUrl" != \'\'');
    console.log('Total leads with LinkedIn URL:', liRes.rows[0].count);

    const readyLiRes = await client.query('SELECT COUNT(*) FROM "Lead" WHERE "status" = \'New\' AND "linkedinUrl" IS NOT NULL AND "linkedinUrl" != \'\'');
    console.log('New leads with LinkedIn URL (Ready):', readyLiRes.rows[0].count);

    const totalRes = await client.query('SELECT COUNT(*) FROM "Lead"');
    console.log('Total leads:', totalRes.rows[0].count);
  } catch (e: any) {
    console.error('fail:', e.message);
  } finally {
    await client.end();
  }
}
main();
