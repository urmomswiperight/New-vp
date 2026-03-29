import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

const env = dotenv.parse(fs.readFileSync('.env.local'));
const client = new Client({ connectionString: env.DATABASE_URL.replace('localhost', '127.0.0.1') });

async function main() {
  try {
    await client.connect();
    console.log('Adding unique constraint to Lead table (email, userId)...');
    
    // First remove duplicates if any
    await client.query(`
      DELETE FROM "Lead" a USING "Lead" b 
      WHERE a.id < b.id 
      AND a.email = b.email 
      AND a."userId" = b."userId"
    `);
    
    await client.query('ALTER TABLE "Lead" ADD CONSTRAINT "Lead_email_userId_key" UNIQUE (email, "userId")');
    console.log('Successfully added unique constraint!');
  } catch (e) {
    console.error('fail:', e.message);
  } finally {
    await client.end();
  }
}
main();