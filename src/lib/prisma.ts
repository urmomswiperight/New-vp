import { PrismaClient } from '@prisma/client'

/**
 * Clean & Direct Prisma Client
 * Optimized for Vercel + Supabase Direct Connection (Port 5432)
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
