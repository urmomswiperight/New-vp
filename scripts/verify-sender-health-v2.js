const nodemailer = require('nodemailer');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function verifyHealth() {
  const connectionString = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
  const pool = new Client({ connectionString });
  await pool.connect();

  try {
    const res = await pool.query('SELECT email, "smtpHost", "smtpPort", "smtpPassword", "imapHost", "imapPort", "imapPassword" FROM "SenderAccount"');
    const accounts = res.rows;
    console.log(`Verifying health for ${accounts.length} accounts...`);

    for (const account of accounts) {
      console.log(`\n--- Testing: ${account.email} ---`);
      
      // Test SMTP
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
        console.log(`✅ SMTP: OK`);
      } catch (error) {
        console.error(`❌ SMTP: FAILED - ${error.message}`);
      }

      // Test IMAP (using a simple socket connection since 'imap' module is missing)
      const net = require('net');
      const testConnection = (host, port) => {
        return new Promise((resolve) => {
          const socket = new net.Socket();
          const timeout = 5000;
          socket.setTimeout(timeout);
          socket.once('connect', () => {
            socket.destroy();
            resolve(true);
          });
          socket.once('timeout', () => {
            socket.destroy();
            resolve(false);
          });
          socket.once('error', () => {
            socket.destroy();
            resolve(false);
          });
          socket.connect(port, host);
        });
      };

      const imapConnected = await testConnection(account.imapHost, account.imapPort);
      if (imapConnected) {
          console.log(`✅ IMAP Port (${account.imapPort}): REACHABLE`);
      } else {
          console.error(`❌ IMAP Port (${account.imapPort}): UNREACHABLE`);
      }
    }
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyHealth().catch(console.error);
