-- OutreachLog Table for Audit Trail
CREATE TABLE IF NOT EXISTS "OutreachLog" (
    id TEXT PRIMARY KEY,
    "leadId" TEXT REFERENCES "Lead"(id) ON DELETE CASCADE,
    "campaignId" TEXT REFERENCES "Campaign"(id) ON DELETE CASCADE,
    channel TEXT NOT NULL, -- 'LinkedIn', 'Email'
    action TEXT NOT NULL,  -- 'Drafted', 'Sent', 'Replied', 'Error'
    details JSONB,         -- API response, error message, etc.
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for lead tracking
CREATE INDEX IF NOT EXISTS "idx_outreachlog_leadId" ON "OutreachLog"("leadId");
