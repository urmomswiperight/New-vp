import prisma from './src/lib/prisma.ts';

async function main() {
  const stats = await prisma.lead.groupBy({
    by: ['status'],
    _count: true
  });
  console.log('STATUS_STATS:', JSON.stringify(stats, null, 2));
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
