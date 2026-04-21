const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const apiKey = process.env.MANYREACH_API_KEY?.replace(/"/g, '');

async function checkLists() {
  if (!apiKey) {
    console.error('MANYREACH_API_KEY not found');
    return;
  }

  try {
    const response = await fetch('https://api.manyreach.com/api/v2/base-lists', {
      headers: { 'X-API-Key': apiKey }
    });
    
    if (!response.ok) {
        console.error('API Error:', response.status, await response.text());
        return;
    }

    const data = await response.json();
    console.log('LISTS:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

checkLists();
