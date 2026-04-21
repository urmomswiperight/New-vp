# Billing Setup (Lemon Squeezy)

Lemon Squeezy is our Merchant of Record (MoR) used to handle subscriptions in Ethiopia. It acts as the seller, handles tax compliance, and pays out via PayPal or Payoneer.

## 1. Create a Lemon Squeezy Account
1.  Go to [Lemon Squeezy](https://app.lemonsqueezy.com/register) and create an account.
2.  Set up your store details.

## 2. Get your API Key
1.  Navigate to **Settings > API**.
2.  Click **"Plus icon"** to create a new API Key.
3.  **Name it:** `AI Marketing Agent (Dev)`.
4.  Copy the key and add it to your `.env.local`:
    ```bash
    LEMONSQUEEZY_API_KEY=your_api_key_here
    ```

## 3. Create a Product & Variant
1.  Go to **Store > Products**.
2.  Click **"Add Product"**.
3.  **Name:** `AI Marketing Agent`.
4.  **Description:** `Unlimited AI Outreach & Leads`.
5.  **Pricing Model:** Subscription ($500 / month).
6.  **Variant:** Note the **Variant ID** (found in the product settings or via the API).
7.  Add the Variant ID to `.env.local`:
    ```bash
    LEMONSQUEEZY_VARIANT_ID=your_variant_id_here
    NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=your_store_id_here
    ```

## 4. Configure Webhooks (Local Development)
To receive payment updates locally, you need a tunnel (e.g., ngrok or Localtunnel).

1.  Start your tunnel: `npx localtunnel --port 3000` (or use ngrok).
2.  Go to **Settings > Webhooks**.
3.  Click **"Add Webhook"**.
4.  **URL:** `https://your-tunnel-url.com/api/webhooks/lemonsqueezy`
5.  **Signing Secret:** Create a random string (e.g., `my_super_secret_123`).
6.  **Events to select:**
    - `subscription_created`
    - `subscription_updated`
    - `subscription_cancelled`
    - `order_created`
7.  Add the secret to `.env.local`:
    ```bash
    LEMONSQUEEZY_WEBHOOK_SECRET=your_signing_secret_here
    ```

## 5. Payouts (Ethiopia)
1.  Go to **Settings > Payouts**.
2.  Choose **PayPal** or **Payoneer**.
3.  Connect your account to receive your $500/mo earnings.
