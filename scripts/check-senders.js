const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function check() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const res = await pool.query('SELECT email, "smtpHost", "smtpPort" FROM "SenderAccount"');
  console.log(`Found ${res.rowCount} sender accounts.`);
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}

check();
