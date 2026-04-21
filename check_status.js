const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const stats = await prisma.lead.groupBy({
    by: ['status'],
    _count: true
  });
  console.log('STATUS_STATS:', JSON.stringify(stats));
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
