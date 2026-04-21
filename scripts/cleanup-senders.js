const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const failedEmails = [
    'robel.consultant@gmx.com',
    'robel@netcourrier.com',
    'robel.s@netcourrier.com',
    'robel.seife@netcourrier.com',
    'r.seife@netcourrier.com'
  ];
  
  try {
    const res = await pool.query('DELETE FROM "SenderAccount" WHERE email = ANY($1)', [failedEmails]);
    console.log(`Cleaned ${res.rowCount} failed accounts from SenderAccount table.`);
  } catch (err) {
    console.error('Error cleaning table:', err.message);
  } finally {
    await pool.end();
  }
}

main();
