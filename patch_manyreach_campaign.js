const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const apiKey = process.env.MANYREACH_API_KEY?.replace(/"/g, '');

async function patchCampaign(campaignId) {
  if (!apiKey) {
    console.error('MANYREACH_API_KEY not found');
    return;
  }

  // Personalization Strategy: Casual + BAB (Before-After-Bridge)
  const subjects = [
    "question about {{company}}",
    "Quick idea for {{company}}'s outreach",
    "{{firstName}} - a better way to handle growth?"
  ];

  const payload = {
    name: "AI Marketing Agent Sprint V2 (Personalized)",
    subject: "question about {{company}}",
    body: `Hi {{firstName}},<br><br>I was looking at {{company}}'s setup and noticed most agencies are still stuck with manual outreach—slow, inconsistent, and expensive to scale.<br><br>Imagine a system that handles your entire outbound pipeline 24/7, booking meetings while you focus on closing.<br><br>I've built a custom AI Outreach Agent that does exactly this. It's already processed 5,000 leads this month alone.<br><br>Would you be open to a quick 5-min chat to see the workflow?<br><br>Best,<br>Robel`,
    dailyLimit: 50,
    status: "Draft"
  };

  try {
    const response = await fetch(`https://api.manyreach.com/api/v2/campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: { 
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
        console.log(`Campaign ${campaignId} patched and updated successfully.`);
        const data = await response.json();
        console.log('Update result:', JSON.stringify(data, null, 2));
    } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        
        // If PATCH fails, try to just update specific fields
        if (response.status === 400 || response.status === 422) {
            console.log("Attempting fallback update...");
        }
    }
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

// Targeting the NEW campaign ID
patchCampaign(83137);
