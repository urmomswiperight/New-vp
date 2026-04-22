import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const prismaClientSingleton = () => {
  // Manual load if not already loaded (useful for scripts)
  if (!process.env.DATABASE_URL) {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath })
    }
  }

  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('DATABASE_URL is not defined. Returning dummy Prisma client during build.')
      return {} as any
    }
    throw new Error('DATABASE_URL is not defined')
  }

  // Use the standard Prisma client. 
  // It handles connection pooling internally via the DATABASE_URL query parameters.
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Use direct connection parameters for better stability
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
