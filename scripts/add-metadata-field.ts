import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

const env = dotenv.parse(fs.readFileSync('.env.local'));
const client = new Client({ connectionString: env.DATABASE_URL.replace('localhost', '127.0.0.1') });

async function main() {
  try {
    await client.connect();
    console.log('Adding metadata column to Lead table...');
    await client.query('ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "metadata" JSONB');
    console.log('Successfully added metadata column!');
  } catch (e) {
    console.error('fail:', e.message);
  } finally {
    await client.end();
  }
}
main();