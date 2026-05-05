-- Supabase SQL Script: Create Config Table for Session Persistence
-- 1. Create the Config table to store dynamic variables like LI_SESSION
CREATE TABLE IF NOT EXISTS "Config" (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Initialize the LI_SESSION key with an empty object if it doesn't exist
INSERT INTO "Config" (key, value) 
VALUES ('LI_SESSION', '{}') 
ON CONFLICT (key) DO NOTHING;

-- 3. Verify the table exists
SELECT * FROM "Config";
