import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const prismaClientSingleton = () => {
  // Manual load if not already loaded
  if (!process.env.DATABASE_URL) {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath })
    }
  }

  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    // During build time on Vercel, DATABASE_URL might be empty
    return new PrismaClient()
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
