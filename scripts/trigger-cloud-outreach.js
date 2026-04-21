const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

async function trigger(campaignId, type) {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://robaaa.app.n8n.cloud/webhook/outreach-trigger';
  const n8nToken = process.env.N8N_WEBHOOK_API_KEY;

  if (!n8nToken) {
    console.error('N8N configuration missing (N8N_WEBHOOK_API_KEY)');
    return;
  }

  console.log(`Triggering ${type} campaign ${campaignId} on Cloud...`);

  const headers = {
    'Content-Type': 'application/json',
  };

  // Check if token already includes 'Bearer'
  if (n8nToken.toLowerCase().startsWith('bearer ')) {
    headers['Authorization'] = n8nToken;
  } else {
    headers['Authorization'] = `Bearer ${n8nToken}`;
  }

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        campaignId: campaignId,
        userId: 'default-user-id',
        campaignType: type,
        timestamp: new Date().toISOString()
      }),
    });

    const text = await response.text();
    console.log(`n8n response (${type}) status:`, response.status);
    console.log(`n8n response (${type}) body:`, text);
  } catch (error) {
    console.error(`Error triggering n8n (${type}):`, error.message);
  }
}

// Campaign IDs from previous list-campaigns run
const linkedInCampaignId = '6cdef06b-3e2d-4804-86c5-5b878cb4b1da';
const emailCampaignId = '5b1228a2-41ea-4ca5-82a2-a8dd8f5876ac';

async function run() {
  await trigger(emailCampaignId, 'Email');
  // Wait a bit before LinkedIn to avoid overlap if needed
  setTimeout(() => trigger(linkedInCampaignId, 'LinkedIn'), 2000);
}

run();
