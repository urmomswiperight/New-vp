const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const apiKey = process.env.MANYREACH_API_KEY?.replace(/"/g, '');

async function createList() {
  if (!apiKey) {
    console.error('MANYREACH_API_KEY not found');
    return;
  }

  try {
    const response = await fetch('https://api.manyreach.com/api/v2/lists', {
      method: 'POST',
      headers: { 
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: "AI Marketing Agent Leads" })
    });
    
    const result = await response.json();
    console.log('CREATE_LIST_RESULT:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

createList();
