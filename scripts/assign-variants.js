const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function assign() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // 1. Assign 'A' to half of 'New' leads
  const resA = await pool.query(`
    UPDATE "Lead" 
    SET variant = 'A' 
    WHERE id IN (
      SELECT id FROM "Lead" 
      WHERE status = 'New' AND variant IS NULL
      LIMIT (SELECT COUNT(*) / 2 FROM "Lead" WHERE status = 'New' AND variant IS NULL)
    )
  `);
  console.log(`Assigned Variant A to ${resA.rowCount} leads.`);

  // 2. Assign 'B' to the other half
  const resB = await pool.query(`
    UPDATE "Lead" 
    SET variant = 'B' 
    WHERE status = 'New' AND variant IS NULL
  `);
  console.log(`Assigned Variant B to ${resB.rowCount} leads.`);

  await pool.end();
}

assign().catch(console.error);
