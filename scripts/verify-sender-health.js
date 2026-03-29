const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function verifyHealth() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const res = await pool.query('SELECT email, "smtpHost", "smtpPort", "smtpPassword" FROM "SenderAccount"');
    const accounts = res.rows;
    console.log(`Verifying health for ${accounts.length} accounts...`);

    for (const account of accounts) {
      console.log(`\nTesting: ${account.email}...`);
      
      const transporter = nodemailer.createTransport({
        host: account.smtpHost,
        port: account.smtpPort,
        secure: account.smtpPort === 465,
        auth: {
          user: account.email,
          pass: account.smtpPassword,
        },
        connectionTimeout: 10000,
      });

      try {
        await transporter.verify();
        console.log(`✅ ${account.email}: SMTP OK`);
      } catch (error) {
        console.error(`❌ ${account.email}: SMTP FAILED - ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyHealth().catch(console.error);
