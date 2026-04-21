---
phase: 01-technical-foundation
plan: 4
type: execute
wave: 3
depends_on:
  - "01-technical-foundation-03"
files_modified:
  - "src/app/(dashboard)/billing/page.tsx"
  - "src/app/api/billing/fiverr-submit/route.ts"
  - ".env.local"
autonomous: true
requirements:
  - "FOUND-05"

user_setup:
  - service: "Fiverr"
    why: "Immediate payment collection for Ethiopian/International users without ID blockers."
    env_vars:
      - name: "NEXT_PUBLIC_FIVERR_GIG_URL"
        source: "Create a Fiverr Gig and paste the URL here."
    dashboard_config:
      - task: "Create a Fiverr Gig."
        location: "https://www.fiverr.com/start_selling"
      - task: "Gig Details."
        details: "Set the price to $500. In 'Requirements', ask the user for their 'App User ID' and 'App Email'."

must_haves:
  truths:
    - "A logged-in user can click a 'Pay on Fiverr' button."
    - "A user can submit their Fiverr Order ID to the dashboard."
    - "The user's status updates to 'pending_verification' after submission."
  artifacts:
    - path: "src/app/(dashboard)/billing/page.tsx"
      provides: "The UI for redirection and order submission."
    - path: "src/app/api/billing/fiverr-submit/route.ts"
      provides: "Backend logic to record the order ID and update status to pending."
---

<objective>
Implement a manual payment verification flow using Fiverr. Users will be redirected to pay on Fiverr and then submit their Order ID for manual approval by the admin.

Purpose: To bypass Stripe/Lemon Squeezy restrictions and start collecting payments immediately.
Output: A functional billing page with Fiverr redirection and a submission form.
</objective>

<execution_context>
@C:/Users/mikiy/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/mikiy/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/research/01-technical-foundation.md
@.planning/phases/01-technical-foundation/RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update Database Schema for Manual Verification</name>
  <files>
    - "prisma/schema.prisma" (or direct SQL via Supabase)
  </files>
  <action>
    Ensure the `users` (or `profiles`) table has the following fields:
    - `subscription_status`: Enum/Text ('inactive', 'pending_verification', 'active').
    - `fiverr_order_id`: Text (to store the submitted ID).
    1. If using Prisma, update the schema and run `npx prisma db push`.
    2. Otherwise, use the Supabase SQL editor.
  </action>
  <verify>
    The database table contains the new columns.
  </verify>
  <done>
    Database is ready to track manual payment submissions.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create Fiverr Submission API</name>
  <files>
    - "src/app/api/billing/fiverr-submit/route.ts"
  </files>
  <action>
    Create a POST endpoint that:
    1. Authenticates the user.
    2. Receives an `orderId`.
    3. Updates the user record: `subscription_status = 'pending_verification'`, `fiverr_order_id = orderId`.
    4. Returns success.
  </action>
  <verify>
    Sending a POST to `/api/billing/fiverr-submit` with an order ID updates the user's status in the database.
  </verify>
  <done>
    The backend can now handle manual payment claims.
  </done>
</task>

<task type="auto">
  <name>Task 3: Build Billing UI with Fiverr Flow</name>
  <files>
    - "src/app/(dashboard)/billing/page.tsx"
  </files>
  <action>
    Update the billing page to:
    1. Display the user's current status.
    2. If 'inactive': Show a "Step 1: Pay on Fiverr" button (redirects to Gig URL) and a "Step 2: Enter Order ID" form.
    3. If 'pending_verification': Show a "Payment verification in progress" message.
    4. If 'active': Show "Subscription Active".
  </action>
  <verify>
    The UI correctly transitions from Inactive -> Pending after a form submission.
  </verify>
  <done>
    Users have a clear path to pay and report their payment.
  </done>
</task>

</tasks>

<verification>
1. **Redirection**: Verify the "Pay on Fiverr" button opens the correct URL in a new tab.
2. **Submission**: Submit a dummy Order ID and verify the DB updates to 'pending_verification'.
3. **Admin Verification**: Confirm you can see the Order ID in the DB to verify it manually.
</verification>

<success_criteria>
- Users can initiate payment via Fiverr.
- Users can claim their payment by submitting an Order ID.
- The system tracks "Pending" status correctly.
</success_criteria>

<output>
After completion, create `.planning/phases/01-technical-foundation/01-technical-foundation-04-SUMMARY.md`
</output>
