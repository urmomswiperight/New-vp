import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import Papa from 'papaparse'
import crypto from 'crypto'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log('Loaded env from .env.local')
}

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL not found')
    process.exit(1)
  }

  const client = new Client({ connectionString })
  await client.connect()

  const csvFileName = 'lead with email - Sheet3 (4).csv'
  const csvFilePath = path.join(process.cwd(), csvFileName)
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('CSV file not found at:', csvFilePath)
    process.exit(1)
  }

  try {
    // Get the first user
    const userRes = await client.query('SELECT id FROM "User" LIMIT 1')
    if (userRes.rows.length === 0) {
      console.error('No user found in database.')
      process.exit(1)
    }
    const userId = userRes.rows[0].id
    console.log(`Importing accounts for user: ${userId}`)

    const csvFile = fs.readFileSync(csvFilePath, 'utf8')
    const results = Papa.parse(csvFile, { header: true, skipEmptyLines: true })
    const accounts = results.data as any[]

    console.log(`Found ${accounts.length} accounts in CSV.`)

    for (const acc of accounts) {
      if (!acc.email) continue;

      const email = acc.email.trim()
      const smtpHost = acc['stmp server']?.trim() || 'mail.gmx.com'
      const smtpPort = parseInt(acc['smtp port']) || 587
      const smtpPassword = acc['smtp password']?.trim()
      const imapHost = acc['imap serve']?.trim() || 'imap.gmx.com'
      const imapPort = parseInt(acc['imap port']) || 993
      const imapPassword = acc['imap password']?.trim()

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
        [crypto.randomUUID(), userId, email, smtpHost, smtpPort, smtpPassword, imapHost, imapPort, imapPassword]
      )
      console.log(`Processed: ${email}`)
    }

    console.log('Import completed successfully!')
  } catch (error) {
    console.error('Error during import:', error)
  } finally {
    await client.end()
  }
}

main()
