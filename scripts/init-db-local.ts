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

  console.log('Connecting to PostgreSQL...')
  await client.connect()

  const sqlCommands = `
    -- Create User table
    CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT,
        "lemon_squeezy_customer_id" TEXT,
        "usage_count" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    CREATE UNIQUE INDEX IF NOT EXISTS "User_lemon_squeezy_customer_id_key" ON "User"("lemon_squeezy_customer_id");

    -- Create Lead table
    CREATE TABLE IF NOT EXISTS "Lead" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "firstName" TEXT,
        "lastName" TEXT,
        "company" TEXT,
        "linkedinUrl" TEXT,
        "status" TEXT NOT NULL DEFAULT 'New',
        "region" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
    );
    CREATE INDEX IF NOT EXISTS "Lead_userId_idx" ON "Lead"("userId");

    -- Create SenderAccount table
    CREATE TABLE IF NOT EXISTS "SenderAccount" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "smtpHost" TEXT NOT NULL,
        "smtpPort" INTEGER NOT NULL,
        "smtpPassword" TEXT NOT NULL,
        "imapHost" TEXT NOT NULL,
        "imapPort" INTEGER NOT NULL,
        "imapPassword" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SenderAccount_pkey" PRIMARY KEY ("id")
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "SenderAccount_email_key" ON "SenderAccount"("email");
    CREATE INDEX IF NOT EXISTS "SenderAccount_userId_idx" ON "SenderAccount"("userId");

    -- Create Campaign table
    CREATE TABLE IF NOT EXISTS "Campaign" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'Email',
        "status" TEXT NOT NULL DEFAULT 'Paused',
        "settings" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
    );
    CREATE INDEX IF NOT EXISTS "Campaign_userId_idx" ON "Campaign"("userId");
  `

  try {
    console.log('Running DDL...')
    await client.query(sqlCommands)
    console.log('Successfully created tables!')

    // Check for default user
    const res = await client.query('SELECT * FROM "User" LIMIT 1')
    if (res.rows.length === 0) {
      console.log('Creating default user...')
      await client.query('INSERT INTO "User" (id, email, usage_count) VALUES ($1, $2, $3)', ['default-user-id', 'admin@example.com', 0])
      console.log('Created default user: admin@example.com')
    } else {
      console.log('User already exists:', res.rows[0].email)
    }
  } catch (error) {
    console.error('Database initialization error:', error)
  } finally {
    await client.end()
  }
}

main()
