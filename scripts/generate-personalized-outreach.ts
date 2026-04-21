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

async function generateOutreach() {
  const leads = await prisma.lead.findMany({
    where: { region: 'Ethiopia', status: 'Contacted (LinkedIn)' }, // Using the leads we marked earlier
    take: 5
  })

  console.log(`Generating personalized outreach for ${leads.length} leads using Ollama (Llama 3.1)...`)

  for (const lead of leads) {
    const metadata = lead.metadata as any || {}
    const prompt = `
      As a Senior Sales Automation Specialist, write a short LinkedIn connection request (max 250 characters).
      Lead Name: ${lead.firstName} ${lead.lastName}
      Company: ${lead.company}
      Role: ${metadata.position || 'Professional'}
      Context: We help founders in Ethiopia scale their outreach using AI agents.
      Tone: Professional, direct, and non-spammy. Mention their company ${lead.company}.
    `

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1:8b',
          prompt: prompt,
          stream: false
        })
      })

      const data = await response.json() as any
      const message = data.response.trim()

      console.log(`\n---------------------------------------------------------`)
      console.log(`Lead: ${lead.firstName} ${lead.lastName} (${lead.company})`)
      console.log(`LinkedIn: ${lead.linkedinUrl || 'N/A'}`)
      console.log(`Message: ${message}`)
      console.log(`---------------------------------------------------------`)

    } catch (e: any) {
      console.error(`  Error generating message for ${lead.email}: ${e.message}`)
    }
  }
}

generateOutreach()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
