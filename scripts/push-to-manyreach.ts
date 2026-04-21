import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import fetch from 'node-fetch'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

async function main() {
  const connectionString = process.env.DATABASE_URL
  const apiKey = process.env.MANYREACH_API_KEY?.replace(/"/g, '') // Remove quotes if present
  const campaignId = '83033'

  if (!connectionString || !apiKey) {
    console.error('DATABASE_URL or MANYREACH_API_KEY not found')
    process.exit(1)
  }

  const client = new Client({ connectionString })
  await client.connect()

  try {
    // 1. Fetch "New" leads
    const res = await client.query(
      'SELECT id, email, "firstName", "lastName", company, "linkedinUrl" FROM "Lead" WHERE status = \'New\' LIMIT 500' // Limit for first batch
    )
    const leads = res.rows
    console.log(`Found ${leads.length} leads to push.`)

    if (leads.length === 0) {
      console.log('No leads to push.')
      return
    }

    // 2. Batch push to ManyReach
    const baseListId = 86894
    const delay = (ms: number) => new Promise(res => setTimeout(ms, res))

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i]
      const payload = {
        campaignId: parseInt(campaignId),
        baseListId: baseListId,
        email: lead.email,
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        company: lead.company || '',
        icebreaker: '',
        companySize: 'your business',
        companySocial: lead.linkedinUrl || ''
      }

      console.log(`[${i + 1}/${leads.length}] Pushing prospect ${lead.email}...`)

      const response = await fetch(`https://api.manyreach.com/api/v2/prospects`, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok || response.status === 409) {
        if (response.status === 409) {
          console.log(`Prospect ${lead.email} already exists.`)
        } else {
          console.log(`Successfully pushed ${lead.email}.`)
        }

        // Update status in DB
        await client.query(
          'UPDATE "Lead" SET status = \'Contacted (ManyReach)\', "updatedAt" = NOW() WHERE id = $1',
          [lead.id]
        )
      } else if (response.status === 429) {
        console.warn(`Rate limit hit. Waiting 60 seconds...`)
        await delay(60000)
        i-- // Retry this lead
      } else {
        const errorText = await response.text()
        console.error(`Failed to push prospect ${lead.email}:`, response.status, errorText)
      }

      // Add a small delay to stay under rate limit (60 per minute = 1 per second)
      await delay(1100) 
    }

    console.log('Finished pushing leads to ManyReach.')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.end()
  }
}

main()
