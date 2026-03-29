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

  const endpoints = [
    'https://api.manyreach.com/api/v2/base-lists',
    'https://api.manyreach.com/api/v2/base_lists',
    'https://api.manyreach.com/api/v2/lists',
    'https://api.manyreach.com/api/v1/base-lists'
  ];

  for (const endpoint of endpoints) {
      try {
        console.log(`Checking ${endpoint}...`);
        const response = await fetch(endpoint, {
          headers: { 'X-API-Key': apiKey }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`SUCCESS [${endpoint}]:`, JSON.stringify(data, null, 2));
        } else {
            console.error(`ERROR [${endpoint}]:`, response.status);
        }
      } catch (error) {
        console.error(`Fetch Error [${endpoint}]:`, error.message);
      }
  }
}

checkLists();
