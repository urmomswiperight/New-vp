import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
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
    // If we're building, we don't necessarily need the DB
    if (process.env.NODE_ENV === 'production') {
      console.warn('DATABASE_URL is not defined. Returning dummy Prisma client during build.')
      return {} as any
    }
    throw new Error('DATABASE_URL is not defined')
  }

  // DEBUG LOG: Print host to Vercel logs (safe)
  try {
    const url = new URL(connectionString.replace('postgres://', 'http://').replace('postgresql://', 'http://'));
    console.log(`[Prisma] Connecting to host: ${url.hostname}`);
  } catch (e) {
    console.log('[Prisma] Could not parse connection string for logging');
  }

  const pool = new Pool({ 
    connectionString,
    max: 1, // Limit to 1 connection per lambda to stay under Supabase limits
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
