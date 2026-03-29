const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function main() {
  const connectionString = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
  const apiKey = process.env.MANYREACH_API_KEY?.replace(/"/g, '');
  const campaignId = '83033';
  const baseListId = 86894;

  if (!connectionString || !apiKey) {
    console.error('DATABASE_URL or MANYREACH_API_KEY not found');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    // Check if campaign is draft, maybe start it again if it's "Completed" (sometimes they auto-complete if empty)
    
    const res = await client.query(
      'SELECT id, email, "firstName", "lastName", company, "linkedinUrl" FROM "Lead" WHERE status = \'Contacted (ManyReach)\' LIMIT 5'
    );
    const leads = res.rows;
    console.log(`Found ${leads.length} leads to push as a TEST.`);

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      const payload = {
        campaignId: parseInt(campaignId),
        baseListId: baseListId,
        email: lead.email,
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        company: lead.company || '',
        icebreaker: '',
        companySize: 'your business',
        companySocial: lead.linkedinUrl || ''
      };

      console.log(`[${i + 1}/${leads.length}] Pushing prospect ${lead.email}...`);

      const response = await fetch(`https://api.manyreach.com/api/v2/prospects`, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (response.ok) {
          console.log(`Successfully pushed ${lead.email}. ID: ${result.prospectId}`);
      } else {
          console.error(`Failed to push ${lead.email}:`, response.status, JSON.stringify(result));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

main();
