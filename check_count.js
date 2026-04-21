const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function checkCount() {
  const connectionString = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const res = await client.query("SELECT COUNT(*) FROM \"Lead\" WHERE status = 'Contacted (ManyReach)'");
    console.log('CONTACTED_MANYREACH:', res.rows[0].count);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkCount();
