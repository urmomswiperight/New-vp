const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function check() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const res = await pool.query(`
    SELECT 
      status, 
      COUNT(*) as total,
      COUNT(CASE WHEN "linkedinUrl" IS NOT NULL THEN 1 END) as with_linkedin,
      COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email
    FROM "Lead"
    GROUP BY status
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}

check();
