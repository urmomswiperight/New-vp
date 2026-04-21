import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const env = dotenv.parse(fs.readFileSync(envPath));
const client = new Client({ connectionString: env.DATABASE_URL.replace('localhost', '127.0.0.1') });

async function main() {
  try {
    await client.connect();
    console.log('Creating LeadDraft table in local PostgreSQL...');

    const sql = `
      CREATE TABLE IF NOT EXISTS "LeadDraft" (
        "id" TEXT NOT NULL,
        "leadId" TEXT NOT NULL,
        "campaignId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "subject" TEXT,
        "status" TEXT NOT NULL DEFAULT 'Pending',
        "reasoning" JSONB,
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LeadDraft_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "LeadDraft_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE,
        CONSTRAINT "LeadDraft_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS "LeadDraft_leadId_idx" ON "LeadDraft"("leadId");
      CREATE INDEX IF NOT EXISTS "LeadDraft_campaignId_idx" ON "LeadDraft"("campaignId");
    `;

    await client.query(sql);
    console.log('Successfully created LeadDraft table!');

    // Also ensure Campaign has a type column if missing (from prisma schema)
    console.log('Ensuring Campaign table has required columns...');
    await client.query('ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT \'Email\'');
    await client.query('ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT \'Paused\'');
    await client.query('ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "settings" JSONB');

  } catch (e: any) {
    console.error('Failed to create LeadDraft table:', e.message);
  } finally {
    await client.end();
  }
}

main();
