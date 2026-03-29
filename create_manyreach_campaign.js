const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const apiKey = process.env.MANYREACH_API_KEY?.replace(/"/g, '');

async function createCampaign() {
  if (!apiKey) {
    console.error('MANYREACH_API_KEY not found');
    return;
  }

  const fromEmails = [
    "robel@mailo.com",
    "robel.seife@mailo.com",
    "robel.se@netcourrier.com",
    "robaaa@mailo.com",
    "robiii@mailo.com"
  ].join(",");

  const payload = {
    name: "AI Marketing Agent Sprint V2",
    subject: "Question about {{company}}",
    body: "Hi {{firstName}},<br><br>I saw what you are doing at {{company}} and wanted to reach out regarding our AI automation services.<br><br>Best,<br>Robel",
    fromEmails: fromEmails,
    dailyLimit: 250, // 50 per email * 5 emails
    status: "Running",
    trackOpens: true,
    trackClicks: true
  };

  try {
    const response = await fetch('https://api.manyreach.com/api/v2/campaigns', {
      method: 'POST',
      headers: { 
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('CREATE_CAMPAIGN_RESULT:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

createCampaign();
