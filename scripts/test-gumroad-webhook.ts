import prisma from '../src/lib/prisma';

async function testWebhook() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found in database to test with.');
    return;
  }

  console.log(`Testing Gumroad webhook for user: ${user.email} (${user.id})`);

  const payload = new URLSearchParams();
  payload.append('email', user.email || '');
  payload.append('sale_id', 'TEST_REFUND_' + Date.now());
  payload.append('product_id', 'Fullmarketing');
  payload.append('license_key', 'TEST-LICENSE-KEY');
  payload.append('url_params[user_id]', user.id);
  payload.append('is_refund', 'true');

  try {
    const response = await fetch('http://localhost:3000/api/webhooks/gumroad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    const data = await response.json();
    console.log('Webhook Response:', response.status, data);
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
  }
}

testWebhook();
