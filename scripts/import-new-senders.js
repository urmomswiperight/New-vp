const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Papa = require('papaparse');
const crypto = require('crypto');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function main() {
  const connectionString = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
  if (!connectionString) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  const csvFileName = 'new_senders.csv';
  const csvFilePath = path.join(process.cwd(), csvFileName);
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('CSV file not found at:', csvFilePath);
    process.exit(1);
  }

  try {
    const userRes = await client.query('SELECT id FROM "User" LIMIT 1');
    const userId = userRes.rows[0].id;

    const csvFile = fs.readFileSync(csvFilePath, 'utf8');
    const results = Papa.parse(csvFile, { header: true, skipEmptyLines: true });
    const accounts = results.data;

    for (const acc of accounts) {
      const email = (acc.email || '').trim().toLowerCase();
      const smtpPassword = (acc['smtp password'] || '').trim();
      const imapPassword = (acc['imap password'] || '').trim() || smtpPassword;

      if (!email || !smtpPassword) continue;

      let settings = {
          smtpHost: 'smtp.office365.com',
          smtpPort: 587,
          imapHost: 'outlook.office365.com',
          imapPort: 993
      };

      if (email.endsWith('@yahoo.com')) {
          settings = { smtpHost: 'smtp.mail.yahoo.com', smtpPort: 465, imapHost: 'imap.mail.yahoo.com', imapPort: 993 };
      } else if (email.endsWith('@aol.com')) {
          settings = { smtpHost: 'smtp.aol.com', smtpPort: 465, imapHost: 'imap.aol.com', imapPort: 993 };
      } else if (email.endsWith('@gmx.com') || email.endsWith('@gmx.us')) {
          settings = { smtpHost: 'mail.gmx.com', smtpPort: 587, imapHost: 'imap.gmx.com', imapPort: 993 };
      }

      await client.query(
        `INSERT INTO "SenderAccount" (id, "userId", email, "smtpHost", "smtpPort", "smtpPassword", "imapHost", "imapPort", "imapPassword", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (email) DO UPDATE SET 
            "smtpHost" = EXCLUDED."smtpHost",
            "smtpPort" = EXCLUDED."smtpPort",
            "smtpPassword" = EXCLUDED."smtpPassword",
            "imapHost" = EXCLUDED."imapHost",
            "imapPort" = EXCLUDED."imapPort",
            "imapPassword" = EXCLUDED."imapPassword",
            "updatedAt" = NOW()`,
        [crypto.randomUUID(), userId, email, settings.smtpHost, settings.smtpPort, smtpPassword, settings.imapHost, settings.imapPort, imapPassword]
      );
      console.log(`✅ Processed: ${email}`);
    }

    console.log('Import completed.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

main();
