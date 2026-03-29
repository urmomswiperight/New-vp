import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN

async function syncToHubSpot() {
  if (!HUBSPOT_TOKEN) {
    console.error('HUBSPOT_ACCESS_TOKEN not found in .env.local')
    return
  }

  // Get leads that are NOT "New" (i.e. we have started outreach)
  const leadsToSync = await prisma.lead.findMany({
    where: {
      status: { not: 'New' }
    }
  })

  console.log(`Found ${leadsToSync.length} leads to sync to HubSpot.`)

  for (const lead of leadsToSync) {
    console.log(`Syncing ${lead.email} to HubSpot...`)
    
    const hubspotPayload = {
      properties: {
        email: lead.email,
        firstname: lead.firstName || '',
        lastname: lead.lastName || '',
        company: lead.company || '',
        website: lead.linkedinUrl || '', // Using LinkedIn as website for now
        lifecyclestage: 'lead'
      }
    }

    try {
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`
        },
        body: JSON.stringify(hubspotPayload)
      })

      if (response.status === 409) {
        console.log(`  Lead ${lead.email} already exists in HubSpot. Skipping.`)
      } else if (response.ok) {
        console.log(`  Successfully synced ${lead.email} to HubSpot.`)
      } else {
        const error = await response.json()
        console.error(`  Error syncing ${lead.email}:`, JSON.stringify(error))
      }
    } catch (e: any) {
      console.error(`  Failed to call HubSpot API: ${e.message}`)
    }
  }
}

syncToHubSpot()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
