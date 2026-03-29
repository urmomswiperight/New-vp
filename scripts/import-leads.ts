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

  const csvFileName = 'dataset_lead-scraper-apollo-zoominfo-lusha_2025-11-16_20-52-35-416 - dataset_lead-scraper-apollo-zoominfo-lusha_2025-11-16_20-52-35-416.csv'
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

    console.log(`Importing leads for user: ${userId}`)

    const csvFile = fs.readFileSync(csvFilePath, 'utf8')
    const results = Papa.parse(csvFile, { header: true, skipEmptyLines: true })
    const leads = results.data as any[]

    console.log(`Found ${leads.length} leads in CSV.`)

    const batchSize = 100
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize)
      
      for (const lead of batch) {
        if (!lead.email) continue

        const names = (lead.fullName || '').split(' ')
        const firstName = names[0] || null
        const lastName = names.slice(1).join(' ') || null

        await client.query(
          `INSERT INTO "Lead" (id, "userId", email, "firstName", "lastName", company, "linkedinUrl", region, status, "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'New', NOW())
           ON CONFLICT DO NOTHING`,
          [
            crypto.randomUUID(),
            userId,
            lead.email.trim(),
            firstName,
            lastName,
            lead.orgName || null,
            lead.linkedinUrl || null,
            lead.country || null
          ]
        )
      }
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(leads.length / batchSize)}`)
    }

    console.log('Lead import completed successfully!')
  } catch (error) {
    console.error('Error during lead import:', error)
  } finally {
    await client.end()
  }
}

main()
