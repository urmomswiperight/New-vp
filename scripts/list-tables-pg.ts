import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

const env = dotenv.parse(fs.readFileSync('.env.local'));
const client = new Client({ connectionString: env.DATABASE_URL.replace('localhost', '127.0.0.1') });

async function main() {
  try {
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables found:', res.rows.map(r => r.table_name));
  } catch (e) {
    console.error('fail:', e.message);
  } finally {
    await client.end();
  }
}
main();