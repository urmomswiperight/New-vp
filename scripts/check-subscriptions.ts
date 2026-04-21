import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local')
    process.exit(1)
  }

  const client = new Client({
    connectionString: connectionString,
  })

  await client.connect()
  const res = await client.query('SELECT * FROM "Subscription"')
  console.log('Subscriptions found:', JSON.stringify(res.rows, null, 2))
  await client.end()
}

main().catch(console.error)
