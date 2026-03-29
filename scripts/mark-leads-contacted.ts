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

async function main() {
  const leads = await prisma.lead.findMany({
    where: { region: 'Ethiopia', status: 'New' },
    take: 5
  })

  for (const lead of leads) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: 'Contacted (LinkedIn)' }
    })
    console.log(`Marked ${lead.email} as Contacted (LinkedIn).`)
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
