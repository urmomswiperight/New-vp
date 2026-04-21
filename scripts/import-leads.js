const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')
const Papa = require('papaparse')

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log('Loaded env from .env.local')
} else {
  dotenv.config()
  console.log('Loaded env from .env')
}

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables')
  process.exit(1)
}

async function main() {
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
  })

  const csvFileName = 'dataset_lead-scraper-apollo-zoominfo-lusha_2025-11-16_20-52-35-416 - dataset_lead-scraper-apollo-zoominfo-lusha_2025-11-16_20-52-35-416.csv'
  const csvFilePath = path.join(process.cwd(), csvFileName)
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('CSV file not found at:', csvFilePath)
    process.exit(1)
  }

  try {
    // Find the first user to associate leads with
    let user = await prisma.user.findFirst()
    
    if (!user) {
      console.log('No user found in database. Creating a default user...')
      user = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          usage_count: 0
        }
      })
    }

    console.log(`Importing leads for user: ${user.email} (${user.id})`)

    const csvFile = fs.readFileSync(csvFilePath, 'utf8')
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const leads = results.data
        console.log(`Found ${leads.length} lines in CSV.`)

        const formattedLeads = leads
          .filter((lead) => lead.email && lead.email.trim() !== '') // Must have email
          .map((lead) => {
            const names = (lead.fullName || '').split(' ')
            const firstName = names[0] || null
            const lastName = names.slice(1).join(' ') || null

            return {
              userId: user.id,
              email: lead.email.trim(),
              firstName,
              lastName,
              company: lead.orgName || null,
              linkedinUrl: lead.linkedinUrl || null,
              region: lead.country || null,
              status: 'New'
            }
          })

        console.log(`Formatted ${formattedLeads.length} valid leads. Starting bulk insert...`)

        // Insert in batches of 100 to be safer
        const batchSize = 100
        let totalInserted = 0
        for (let i = 0; i < formattedLeads.length; i += batchSize) {
          const batch = formattedLeads.slice(i, i + batchSize)
          const result = await prisma.lead.createMany({
            data: batch,
            skipDuplicates: true
          })
          totalInserted += result.count
          console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(formattedLeads.length / batchSize)} (${totalInserted} total)`)
        }

        console.log(`Import completed successfully! Total leads added: ${totalInserted}`)
        await prisma.$disconnect()
      },
      error: (error) => {
        console.error('Error parsing CSV:', error)
        prisma.$disconnect()
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
