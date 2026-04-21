const N8N_URL = 'https://n8n-m6qo.onrender.com/api/v1';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOGMwNDdhMy0yMTQ0LTQ0YWItYjc1ZC1jOTc2Njk3ZDk4NjgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzczNjg4ODc2LCJleHAiOjE3NzYyMjU2MDB9._cDaik7sXH9_7H-PmB9hdkRu4S63rCXwALjlo8GBXI8';

const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: '.env.local' });

async function createCredential(name, type, data) {
  const body = {
    name: name,
    type: type,
    data: data
  };

  const response = await fetch(`${N8N_URL}/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': API_KEY
    },
    body: JSON.stringify(body)
  });

  const resData = await response.json();
  if (response.ok) {
    console.log(`Successfully created credential: ${name} (ID: ${resData.id})`);
  } else {
    console.error(`Failed to create credential ${name}:`, JSON.stringify(resData, null, 2));
  }
}

async function main() {
  // 1. Supabase
  await createCredential('Supabase', 'supabaseApi', {
    host: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  // 2. OpenAI
  // Assuming you have OPENAI_API_KEY in env, if not I will skip
  if (process.env.OPENAI_API_KEY) {
      await createCredential('OpenAI', 'openAiApi', {
        apiKey: process.env.OPENAI_API_KEY
      });
  }

  // 3. SMTP (Using first sender account for default)
  // I'll need to fetch one from DB or just use a placeholder
  // Better to let user configure the rest or use a generic one
}

main();
