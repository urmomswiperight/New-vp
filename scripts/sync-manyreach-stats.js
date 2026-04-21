const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function syncStats() {
  const connectionString = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
  const apiKey = process.env.MANYREACH_API_KEY?.replace(/"/g, '');
  const campaignId = '64357'; 

  if (!connectionString || !apiKey) {
    console.error('DATABASE_URL or MANYREACH_API_KEY not found');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log(`Syncing stats for campaign ${campaignId}...`);
    
    // 1. Get prospects from ManyReach for this campaign
    // Note: This might need pagination if there are many prospects
    const response = await fetch(`https://api.manyreach.com/api/v2/campaigns/${campaignId}/prospects?limit=1000`, {
      headers: { 'X-API-Key': apiKey }
    });

    if (!response.ok) {
        console.error('API Error:', response.status, await response.text());
        return;
    }

    const data = await response.json();
    const prospects = data.items || [];
    console.log(`Found ${prospects.length} prospects in ManyReach.`);

    let repliesCount = 0;
    let interestedCount = 0;

    for (const prospect of prospects) {
        // ManyReach statuses: 'Replied', 'Interested', etc.
        // We need to map these to our DB statuses
        let dbStatus = null;
        
        if (prospect.replyCount > 0) {
            dbStatus = 'Replied';
        }
        if (prospect.interestedCount > 0) {
            dbStatus = 'Interested';
        }

        if (dbStatus) {
            const res = await client.query(
                'UPDATE "Lead" SET status = $1, "updatedAt" = NOW() WHERE email = $2 AND status != $1',
                [dbStatus, prospect.email]
            );
            if (res.rowCount > 0) {
                console.log(`Updated ${prospect.email} to ${dbStatus}`);
                if (dbStatus === 'Replied') repliesCount++;
                if (dbStatus === 'Interested') interestedCount++;
            }
        }
    }

    console.log(`Sync complete. Updated ${repliesCount} replies and ${interestedCount} interested leads.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

syncStats();
