import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

const env = dotenv.parse(fs.readFileSync('.env.local'));
const client = new Client({ connectionString: env.DATABASE_URL.replace('localhost', '127.0.0.1') });

async function main() {
  try {
    await client.connect();
    const statusRes = await client.query('SELECT status, COUNT(*) FROM "Lead" GROUP BY status');
    console.log('Lead counts by status:', statusRes.rows);

    const variantRes = await client.query('SELECT variant, COUNT(*) FROM "Lead" GROUP BY variant');
    console.log('Lead counts by variant:', variantRes.rows);

    const recentRes = await client.query('SELECT * FROM "Lead" ORDER BY "updatedAt" DESC LIMIT 5');
    console.log('Most recently updated leads:', recentRes.rows);
  } catch (e: any) {
    console.error('fail:', e.message);
  } finally {
    await client.end();
  }
}
main();
