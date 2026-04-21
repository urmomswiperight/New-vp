const Imap = require('imap');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function verifyImap() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const res = await pool.query('SELECT email, "imapHost", "imapPort", "imapPassword" FROM "SenderAccount"');
    const accounts = res.rows;
    console.log(`Verifying IMAP health for ${accounts.length} accounts...`);

    for (const account of accounts) {
      console.log(`\nTesting IMAP: ${account.email}...`);
      
      const imap = new Imap({
        user: account.email,
        password: account.imapPassword,
        host: account.imapHost,
        port: account.imapPort,
        tls: true,
        authTimeout: 10000
      });

      await new Promise((resolve) => {
          imap.once('ready', () => {
              console.log(`✅ ${account.email}: IMAP OK`);
              imap.end();
              resolve();
          });

          imap.once('error', (err) => {
              console.error(`❌ ${account.email}: IMAP FAILED - ${err.message}`);
              resolve();
          });

          imap.connect();
      });
    }
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyImap().catch(console.error);
