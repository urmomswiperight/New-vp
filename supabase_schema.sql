-- Supabase Schema Initialization for AI Marketing Agent

-- 1. Create User table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    lemon_squeezy_customer_id TEXT UNIQUE,
    usage_count INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Lead table
CREATE TABLE IF NOT EXISTS "Lead" (
    id TEXT PRIMARY KEY,
    "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    company TEXT,
    "linkedinUrl" TEXT,
    status TEXT DEFAULT 'New',
    region TEXT,
    variant TEXT,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Campaign table
CREATE TABLE IF NOT EXISTS "Campaign" (
    id TEXT PRIMARY KEY,
    "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'Email',
    status TEXT DEFAULT 'Paused',
    settings JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create LeadDraft table
CREATE TABLE IF NOT EXISTS "LeadDraft" (
    id TEXT PRIMARY KEY,
    "leadId" TEXT REFERENCES "Lead"(id) ON DELETE CASCADE,
    "campaignId" TEXT REFERENCES "Campaign"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    subject TEXT,
    status TEXT DEFAULT 'Pending',
    reasoning JSONB,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_lead_userId" ON "Lead"("userId");
CREATE INDEX IF NOT EXISTS "idx_leaddraft_leadId" ON "LeadDraft"("leadId");
CREATE INDEX IF NOT EXISTS "idx_campaign_userId" ON "Campaign"("userId");
