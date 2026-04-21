import prisma from '../src/lib/prisma'

async function main() {
  const user = await prisma.user.upsert({
    where: { id: 'default-user-id' },
    update: {},
    create: {
      id: 'default-user-id',
      email: 'robel@example.com',
    },
  })
  console.log('Default user ensured:', user.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
