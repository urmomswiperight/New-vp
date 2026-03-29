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

const userId = 'default-user-id';

async function main() {
  // Check if it already exists
  const existing = await prisma.campaign.findFirst({
    where: {
      userId,
      name: 'LinkedIn Initial Outreach'
    }
  });

  if (existing) {
    console.log('LinkedIn campaign already exists. Updating status to Active...');
    await prisma.campaign.update({
      where: { id: existing.id },
      data: { status: 'Active' }
    });
    return;
  }

  const campaign = await prisma.campaign.create({
    data: {
      userId,
      name: 'LinkedIn Initial Outreach',
      type: 'LinkedIn',
      status: 'Active',
      settings: {
        dailyLimit: 25
      }
    }
  });
  console.log('LinkedIn Campaign created:', JSON.stringify(campaign, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });