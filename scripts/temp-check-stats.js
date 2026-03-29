const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const fs = require('fs');

async function getStats() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        status, 
        variant,
        COUNT(*) as count 
      FROM "Lead" 
      GROUP BY status, variant
      ORDER BY status, variant
    `);
    
    let output = '--- LEAD STATS BY STATUS & VARIANT ---\n';
    output += JSON.stringify(res.rows, null, 2) + '\n';

    const totalRes = await client.query('SELECT COUNT(*) FROM "Lead"');
    output += `Total Leads: ${totalRes.rows[0].count}\n`;

    const repliedRes = await client.query(`
      SELECT COUNT(*) FROM "Lead" 
      WHERE status IN ('Replied', 'Interested', 'Meeting Booked')
    `);
    output += `Total Replies/Interest: ${repliedRes.rows[0].count}\n`;

    fs.writeFileSync('stats.txt', output);
    console.log('Stats written to stats.txt');

  } finally {
    client.release();
    await pool.end();
  }
}

getStats().catch(err => console.error(err));
