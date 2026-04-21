const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

async function trigger(campaignId, type, endpoint) {
  // Use the cloud n8n URL from N8N-MCP.json context or environment
  const n8nBaseUrl = 'https://n8n-production-b54f5.up.railway.app/webhook';
  const n8nApiKey = process.env.N8N_WEBHOOK_API_KEY;

  if (!n8nApiKey) {
    console.error('N8N API Key missing in environment');
    return;
  }

  const url = `${n8nBaseUrl}/${endpoint}`;
  console.log(`Triggering ${type} campaign (${campaignId}) via ${url}...`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': n8nApiKey,
      },
      body: JSON.stringify({
        campaignId: campaignId,
        userId: 'default-user-id',
        campaignType: type,
      }),
    });

    const text = await response.text();
    console.log(`n8n response (${type}):`, response.status, text);
  } catch (error) {
    console.error(`Error triggering ${type} campaign:`, error.message);
  }
}

async function run() {
    // LinkedIn v7 Stable Webhook
    const linkedInCampaignId = '6cdef06b-3e2d-4804-86c5-5b878cb4b1da';
    await trigger(linkedInCampaignId, 'LinkedIn', 'linkedin-outreach-trigger');

    // Email v5 Agentic Webhook
    const emailCampaignId = '5b1228a2-41ea-4ca5-82a2-a8dd8f5876ac';
    await trigger(emailCampaignId, 'Email', 'outreach-trigger');
}

run();
