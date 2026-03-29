import prisma from './src/lib/prisma';

async function main() {
  const res = await prisma.lead.updateMany({
    where: {
      status: 'Contacted (ManyReach)'
    },
    data: {
      status: 'New'
    }
  });
  console.log('RESET_LEADS:', res.count);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
