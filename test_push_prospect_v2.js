const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const apiKey = process.env.MANYREACH_API_KEY?.replace(/"/g, '');

async function testPushProspect(campaignId, baseListId) {
  if (!apiKey) {
    console.error('MANYREACH_API_KEY not found');
    return;
  }

  const payload = {
    campaignId: campaignId,
    baseListId: baseListId,
    email: "test-prospect-v2@example.com",
    firstName: "Test",
    lastName: "User",
    company: "Test Company",
    icebreaker: "This is a test icebreaker",
    companySize: "Small Business"
  };

  try {
    const response = await fetch(`https://api.manyreach.com/api/v2/prospects`, {
      method: 'POST',
      headers: { 
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('PUSH_PROSPECT_RESULT:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testPushProspect(83033, 86894);
