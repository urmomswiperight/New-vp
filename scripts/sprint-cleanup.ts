import { Client } from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL not found')
    process.exit(1)
  }

  const client = new Client({ connectionString })
  await client.connect()

  console.log("🚀 Starting Sprint Cleanup...")

  // 1. Export Interested Leads to CSV
  const interestedRes = await client.query('SELECT "firstName", "lastName", email, company, status, variant FROM "Lead" WHERE status IN (\'Interested\', \'Meeting Booked\')')
  const interestedLeads = interestedRes.rows

  if (interestedLeads.length > 0) {
    const csvHeader = "FirstName,LastName,Email,Company,Status,Variant\n"
    const csvRows = interestedLeads.map(lead => 
      `"${lead.firstName}","${lead.lastName}","${lead.email}","${lead.company}","${lead.status}","${lead.variant}"`
    ).join("\n")
    
    const filePath = path.join(process.cwd(), "INTERESTED_LEADS_EXPORT.csv")
    fs.writeFileSync(filePath, csvHeader + csvRows)
    console.log(`✅ Exported ${interestedLeads.length} interested leads to ${filePath}`)
  } else {
    console.log("ℹ️ No interested leads found for export.")
  }

  // 2. Count Contacted Leads
  const contactedRes = await client.query('SELECT COUNT(*) FROM "Lead" WHERE status IN (\'Contacted\', \'Contacted (Email)\', \'Contacted (LinkedIn)\')')
  const contactedCount = contactedRes.rows[0].count
  
  console.log(`📊 Sprint Summary:`)
  console.log(`   - Total Leads Contacted: ${contactedCount}`)
  console.log(`   - High-Interest Leads: ${interestedLeads.length}`)
  
  console.log("🏁 Cleanup complete.")
  await client.end()
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
