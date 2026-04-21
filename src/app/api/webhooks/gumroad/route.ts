import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    // Log the raw body to a file for inspection
    const fs = require('fs');
    fs.appendFileSync('gumroad_webhooks.log', rawBody + '\n\n');
    const signature = req.headers.get('x-gumroad-signature');
    const secret = process.env.GUMROAD_WEBHOOK_SECRET;

    // 1. Verify Signature (if secret is configured)
    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid Gumroad signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // 2. Parse payload
    // Gumroad "Ping" is application/x-www-form-urlencoded
    const params = new URLSearchParams(rawBody);
    const payload = Object.fromEntries(params.entries());

    const {
      email,
      sale_id,
      product_id,
      product_permalink,
      license_key,
      is_subscription_renewal,
      url_params,
    } = payload;

    // url_params might be stringified JSON or sent as individual url_params[key]
    let userId = '';
    if (url_params) {
      try {
        const parsed = JSON.parse(url_params);
        userId = parsed.user_id;
      } catch (e) {
        // Not JSON
      }
    }
    if (!userId) {
      userId = params.get('url_params[user_id]') || '';
    }

    // Variants are sent as variants[Name]=Value
    let variantName = '';
    for (const [key, value] of params.entries()) {
      if (key.startsWith('variants[')) {
        variantName = value;
        break;
      }
    }

    console.log(`Gumroad Webhook: Sale ${sale_id} for ${email}, Product: ${product_permalink} (${product_id}), Variant: ${variantName}, User: ${userId}`);

    if (!userId) {
      // If no userId, find by email
      const user = await prisma.user.findUnique({
        where: { email: email }
      });
      if (user) {
        userId = user.id;
        console.log(`Attributed sale ${sale_id} to user ${userId} via email matching.`);
      }
    }

    if (!userId) {
      console.warn(`Could not attribute Gumroad sale ${sale_id} to any user.`);
      return NextResponse.json({ message: 'User not found, but received' }, { status: 200 });
    }

    // 3. Update Database
    // We treat all successful sales as active for now.
    // Real logic would check if it's a cancellation ping.
    const status = 'active'; 
    
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        gumroad_sale_id: sale_id,
        gumroad_license_key: license_key || null,
        variant_id: variantName || null,
        status: status as any,
        updatedAt: new Date(),
      },
      create: {
        userId,
        gumroad_sale_id: sale_id,
        gumroad_license_key: license_key || null,
        variant_id: variantName || null,
        status: status as any,
      },
    });

    console.log(`Subscription updated for user ${userId} via Gumroad sale ${sale_id}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Gumroad Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
