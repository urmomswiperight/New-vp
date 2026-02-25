---
phase: 01-technical-foundation
plan: 4
type: execute
wave: 3
depends_on:
  - "01-technical-foundation-03"
files_modified:
  - "package.json"
  - "package-lock.json"
  - ".env.local"
  - "src/lib/lemonsqueezy.ts"
  - "src/app/api/billing/checkout/route.ts"
  - "src/app/api/webhooks/lemonsqueezy/route.ts"
  - "src/app/(dashboard)/billing/page.tsx"
autonomous: true
requirements:
  - "FOUND-05"

user_setup:
  - service: "Lemon Squeezy"
    why: "The project requires payment processing for subscriptions in Ethiopia/Africa."
    env_vars:
      - name: "LEMONSQUEEZY_API_KEY"
        source: "Lemon Squeezy Dashboard -> Settings -> API -> New Key"
      - name: "LEMONSQUEEZY_WEBHOOK_SECRET"
        source: "Lemon Squeezy Dashboard -> Settings -> Webhooks -> Signing Secret"
      - name: "LEMONSQUEEZY_VARIANT_ID"
        source: "Lemon Squeezy Dashboard -> Products -> Variant Settings"
    dashboard_config:
      - task: "Create your Lemon Squeezy account."
        location: "https://app.lemonsqueezy.com/register"
      - task: "Create a Product in Lemon Squeezy."
        location: "Lemon Squeezy Dashboard -> Products -> Add product"
        details: "Name it 'AI Marketing Agent', and add a recurring price of $500/month. Note the Variant ID."
      - task: "Create a Webhook Endpoint."
        location: "Lemon Squeezy Dashboard -> Settings -> Webhooks -> Add endpoint"
        details: "Set the Endpoint URL to `https://<YOUR_DEPLOYMENT_URL>/api/webhooks/lemonsqueezy`. Listen for `subscription_created` and `subscription_updated` events."

must_haves:
  truths:
    - "A logged-in user can click a 'Subscribe' button and be redirected to a Lemon Squeezy Checkout page."
    - "After a successful payment simulation, a new record is created in the `Subscription` table."
  artifacts:
    - path: "src/lib/lemonsqueezy.ts"
      provides: "A configured and singleton instance of the Lemon Squeezy SDK."
    - path: "src/app/api/billing/checkout/route.ts"
      provides: "An API endpoint that creates a Lemon Squeezy Checkout session for a user."
    - path: "src/app/api/webhooks/lemonsqueezy/route.ts"
      provides: "A secure API endpoint to handle incoming webhooks from Lemon Squeezy."
    - path: "src/app/(dashboard)/billing/page.tsx"
      provides: "A UI for the user to manage their subscription."
---

<objective>
Integrate Lemon Squeezy to handle the $500/month subscription, including creating checkout sessions and handling webhooks to update subscription status.

Purpose: To establish the monetization mechanism for the application, allowing users to purchase and manage their subscriptions from Ethiopia.
Output: A complete Lemon Squeezy billing integration, with a UI for users to subscribe and a backend to manage subscription state.
</objective>

<execution_context>
@C:/Users/mikiy/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/mikiy/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/research/01-technical-foundation.md
@.planning/phases/01-technical-foundation/01-technical-foundation-02-SUMMARY.md
@.planning/phases/01-technical-foundation/01-technical-foundation-03-SUMMARY.md
@paywall.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Lemon Squeezy SDK and Configure Client</name>
  <files>
    - "package.json"
    - "package-lock.json"
    - "src/lib/lemonsqueezy.ts"
    - ".env.local"
  </files>
  <action>
    1.  Install the Lemon Squeezy Node.js library: `npm install @lemonsqueezy/lemonsqueezy.js`
    2.  Create a file `src/lib/lemonsqueezy.ts` to initialize the SDK with `LEMONSQUEEZY_API_KEY`.
    3.  Add `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET`, and `LEMONSQUEEZY_VARIANT_ID` to `.env.local`.
  </action>
  <verify>
    The `@lemonsqueezy/lemonsqueezy.js` package is in `package.json`, and `src/lib/lemonsqueezy.ts` exports a configured setup.
  </verify>
  <done>
    The Lemon Squeezy SDK is installed and configured for server-side use.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create Checkout API</name>
  <files>
    - "src/app/api/billing/checkout/route.ts"
  </files>
  <action>
    Create a route handler at `src/app/api/billing/checkout/route.ts`. This `POST` endpoint will:
    1.  Authenticate the user using the Supabase server client.
    2.  Create a Lemon Squeezy Checkout using `createCheckout`.
    3.  Pass the user's `id` in `custom_data` to link the session back to the user.
    4.  Return the checkout URL to the client for redirection.
  </action>
  <verify>
    Sending a `POST` request to `/api/billing/checkout` as an authenticated user returns a JSON object containing a Lemon Squeezy Checkout URL.
  </verify>
  <done>
    The application can dynamically create Lemon Squeezy Checkout sessions for users.
  </done>
</task>

<task type="auto">
  <name>Task 3: Implement Lemon Squeezy Webhook Handler</name>
  <files>
    - "src/app/api/webhooks/lemonsqueezy/route.ts"
  </files>
  <action>
    Create a webhook handler at `src/app/api/webhooks/lemonsqueezy/route.ts`.
    1.  Read the raw request body to verify the signature (`x-signature` header).
    2.  Use `crypto.timingSafeEqual` with the `LEMONSQUEEZY_WEBHOOK_SECRET` for security.
    3.  Handle `subscription_created` and `subscription_updated` events.
    4.  Extract the `userId` from `custom_data` in the payload.
    5.  Update the `Subscription` record in the database with the user ID, status, and current period end date.
    6.  Return a `200` status.
  </action>
  <verify>
    Use `ngrok` or `localtunnel` to test the webhook endpoint. Trigger a test event from the Lemon Squeezy dashboard. The server should log success, and the database should update.
  </verify>
  <done>
    The application can securely handle incoming Lemon Squeezy webhooks and update subscription state.
  </done>
</task>

<task type="auto">
  <name>Task 4: Build a Simple Billing Page</name>
  <files>
    - "src/app/(dashboard)/billing/page.tsx"
  </files>
  <action>
    Create a basic billing page at `src/app/(dashboard)/billing/page.tsx`.
    1.  Fetch the user's current subscription status from the database.
    2.  If active, display the status.
    3.  If inactive, display a "Subscribe Now" button.
    4.  The button should make a `POST` request to `/api/billing/checkout` and redirect to the returned URL.
  </action>
  <verify>
    1.  As a logged-in user, navigate to `/billing`.
    2.  Click "Subscribe Now". You should be redirected to Lemon Squeezy.
    3.  After successful payment (test mode), refresh the page. It should show active status.
  </verify>
  <done>
    Users have a UI to view their subscription status and initiate the checkout process.
  </done>
</task>

</tasks>

<verification>
1.  **Checkout Flow**: Verify redirection to Lemon Squeezy for the correct variant.
2.  **Webhook Handling**: Confirm database updates after `subscription_created` events.
3.  **UI Feedback**: Confirm the billing page updates status correctly based on database state.
</verification>

<success_criteria>
- A user can successfully subscribe to the $500/mo plan.
- The application state (database) correctly reflects the user's subscription status after payment.
- The entire process is secure and works within the Ethiopian financial ecosystem.
</success_criteria>

<output>
After completion, create `.planning/phases/01-technical-foundation/01-technical-foundation-04-SUMMARY.md`
</output>
