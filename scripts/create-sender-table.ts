import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTable() {
  console.log('Creating SenderAccount table...')
  
  const { error } = await supabase.rpc('create_sender_account_table', {})
  
  // If RPC fails (likely because it doesn't exist), we'll use a raw SQL approach 
  // if your Supabase setup allows it via some other means, or just ask the user.
  // Actually, standard Supabase JS client doesn't have a 'query' method for DDL.
  
  console.log('Please run this SQL in your Supabase SQL Editor:')
  console.log(`
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
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "SenderAccount_pkey" PRIMARY KEY ("id")
    );

    CREATE UNIQUE INDEX "SenderAccount_email_key" ON "SenderAccount"("email");
    CREATE INDEX "SenderAccount_userId_idx" ON "SenderAccount"("userId");

    ALTER TABLE "SenderAccount" ADD CONSTRAINT "SenderAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  `)
}

createTable()
