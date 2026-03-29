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
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  const n8nApiKey = process.env.N8N_WEBHOOK_API_KEY;

  if (!n8nWebhookUrl || !n8nApiKey) {
    console.error('N8N configuration missing');
    return;
  }

  console.log(`Triggering ${type} campaign ${campaignId}...`);

  try {
    const response = await fetch(n8nWebhookUrl, {
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
    console.log('n8n response status:', response.status);
    console.log('n8n response body:', text);
  } catch (error) {
    console.error('Error triggering n8n:', error.message);
  }
}

// Email Campaign ID
const emailCampaignId = '5b1228a2-41ea-4ca5-82a2-a8dd8f5876ac';
trigger(emailCampaignId, 'Email');
