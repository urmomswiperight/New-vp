import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

import { checkUsageLimit, incrementUsage } from '../src/lib/usage'

async function main() {
  const userId = 'default-user-id'
  console.log(`Checking usage for user: ${userId}`)
  
  let usage = await checkUsageLimit(userId)
  console.log('Initial usage:', JSON.stringify(usage, null, 2))

  console.log('Incrementing usage...')
  await incrementUsage(userId)

  usage = await checkUsageLimit(userId)
  console.log('Usage after 1st increment:', JSON.stringify(usage, null, 2))

  for (let i = 0; i < 4; i++) {
    await incrementUsage(userId)
  }

  usage = await checkUsageLimit(userId)
  console.log('Usage after 5 increments (limit reached):', JSON.stringify(usage, null, 2))

  // Reset for future tests
  const { Client } = require('pg')
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  await client.query('UPDATE "User" SET usage_count = 0 WHERE id = $1', [userId])
  await client.end()
  console.log('Reset usage_count to 0 for cleanup.')
}

main().catch(console.error)
