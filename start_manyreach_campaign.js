const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const apiKey = process.env.MANYREACH_API_KEY?.replace(/"/g, '');

async function startCampaign(campaignId) {
  if (!apiKey) {
    console.error('MANYREACH_API_KEY not found');
    return;
  }

  try {
    const response = await fetch(`https://api.manyreach.com/api/v2/campaigns/${campaignId}/start`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey }
    });
    
    if (response.ok) {
        console.log(`Campaign ${campaignId} started successfully.`);
    } else {
        console.error('API Error:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

startCampaign(83137);
