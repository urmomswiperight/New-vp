const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testWebhook() {
  const client = await pool.connect();
  let user;
  try {
    const res = await client.query('SELECT * FROM "User" LIMIT 1');
    user = res.rows[0];
  } finally {
    client.release();
  }

  if (!user) {
    console.error('No user found in database to test with.');
    await pool.end();
    return;
  }

  console.log(`Testing Gumroad webhook for user: ${user.email} (${user.id})`);

  const payload = new URLSearchParams();
  payload.append('email', user.email || '');
  payload.append('sale_id', 'TEST_SALE_' + Date.now());
  payload.append('product_id', 'VM807V1rEjWtoHhbLYcP1g==');
  payload.append('product_permalink', 'Fullmarketing');
  payload.append('license_key', 'TEST-LICENSE-KEY');
  payload.append('url_params[user_id]', user.id);
  payload.append('variants[Version]', 'Teir 2: The "SaaS-Killer" Infrastructure (MOST POPULAR)');

  try {
    const response = await fetch('http://localhost:3000/api/webhooks/gumroad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    const text = await response.text();
    console.log('Webhook Response Status:', response.status);
    try {
      const data = JSON.parse(text);
      console.log('Webhook Response Data:', data);
    } catch (e) {
      console.log('Webhook Response Text:', text);
    }
  } catch (error) {
    console.error('Webhook Error:', error.message);
  } finally {
    await pool.end();
  }
}

testWebhook();
