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
  const users = await prisma.user.findMany({
    include: {
      leads: true,
      campaigns: true,
    }
  });

  console.log(`Found ${users.length} users.`);

  for (const user of users) {
    console.log(`\nUser: ${user.email} (${user.id})`);
    
    // Campaign Stats
    console.log(`  Campaigns: ${user.campaigns.length}`);
    user.campaigns.forEach(c => {
      console.log(`    - ${c.name} (${c.type}): ${c.status}`);
    });

    // Lead Stats
    const totalLeads = user.leads.length;
    const contactedLeads = user.leads.filter(l => l.status !== 'New').length;
    
    console.log(`  Leads:`);
    console.log(`    Total: ${totalLeads}`);
    console.log(`    Contacted: ${contactedLeads}`);

    const leadsByStatus = user.leads.reduce((acc: any, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('    Status Breakdown:', JSON.stringify(leadsByStatus, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
