---
phase: 03-n8n-outreach-engine
plan: 04
type: execute
wave: 3
depends_on: ["03-n8n-outreach-engine-01", "03-n8n-outreach-engine-02", "03-n8n-outreach-engine-03"]
files_modified: ["src/app/api/campaigns/start/route.ts", "src/components/dashboard/campaign-toggle.tsx", "src/app/dashboard/page.tsx", "src/components/leads/data-table.tsx"]
autonomous: true
requirements: [API-CONN, UI-TOGGLE]
user_setup: []

must_haves:
  truths:
    - "Clicking 'Start Campaign' in the dashboard triggers the n8n workflow"
    - "Campaign status toggles between 'Active' and 'Paused' in Supabase"
    - "Leads table reflects the real-time status from n8n updates"
  artifacts:
    - path: "src/app/api/campaigns/start/route.ts"
      provides: "Next.js trigger for n8n"
    - path: "src/components/dashboard/campaign-toggle.tsx"
      provides: "UI control for campaign status"
  key_links:
    - from: "src/app/api/campaigns/start/route.ts"
      to: "n8n Webhook"
      via: "fetch with X-API-KEY"
      pattern: "fetch\(N8N_WEBHOOK_URL"
    - from: "src/components/dashboard/campaign-toggle.tsx"
      to: "Supabase"
      via: "Server Action / update"
      pattern: "supabase\.from\('campaigns'\)"
---

<objective>
Connect the Next.js frontend to the n8n outreach engine, providing users with the ability to start/stop campaigns and monitor outreach progress directly from the dashboard.

Purpose: Bridges the gap between the dashboard UI and the automation engine.
Output: An integrated campaign control system in the dashboard.
</objective>

<execution_context>
@C:/Users/mikiy/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/mikiy/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-n8n-outreach-engine/RESEARCH.md
@.planning/phases/03-n8n-outreach-engine/03-n8n-outreach-engine-01-SUMMARY.md
@.planning/phases/03-n8n-outreach-engine/03-n8n-outreach-engine-02-SUMMARY.md
@.planning/phases/03-n8n-outreach-engine/03-n8n-outreach-engine-03-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Next.js API Trigger Route</name>
  <files>src/app/api/campaigns/start/route.ts</files>
  <action>
    Create a POST route in `src/app/api/campaigns/start/route.ts`:
    1. Authenticate the user (Supabase session).
    2. Accept `campaignId` in the body.
    3. Fetch the campaign details from Supabase to ensure it belongs to the user and is 'Active'.
    4. Call the n8n webhook URL (using `N8N_WEBHOOK_URL` and `N8N_API_KEY` from env) with the `campaignId`.
    5. Return 200 on success.
  </action>
  <verify>
    Use Postman or `curl` to call `/api/campaigns/start` with a valid campaignId and verify it triggers the n8n workflow.
  </verify>
  <done>Next.js can securely trigger n8n workflows.</done>
</task>

<task type="auto">
  <name>Task 2: Campaign Toggle UI Component</name>
  <files>src/components/dashboard/campaign-toggle.tsx, src/app/dashboard/page.tsx</files>
  <action>
    1. Create a `CampaignToggle` component using shadcn `Switch` or `Button`.
    2. Implement a server action or client-side handler to update the `status` of the campaign in the Supabase `campaigns` table.
    3. Add the `CampaignToggle` to the dashboard main view (`src/app/dashboard/page.tsx`).
    4. When toggled to 'Active', also trigger the `startCampaign` logic from Task 1.
  </action>
  <verify>
    Toggle the campaign status in the UI and confirm the database record updates in Supabase and the n8n execution is triggered.
  </verify>
  <done>Users can start/pause campaigns via the dashboard.</done>
</task>

<task type="auto">
  <name>Task 3: Dashboard Leads Progress View</name>
  <files>src/components/leads/data-table.tsx</files>
  <action>
    1. Update the Leads table (`src/components/leads/data-table.tsx`) to show the outreach status more clearly (using `Badge` components).
    2. Ensure the status updates are reflected when the n8n workflow modifies the database.
    3. (Optional) Add a "Campaign Progress" bar to the dashboard summary using the updated lead counts.
  </action>
  <verify>
    Start a campaign and observe the Leads table as the n8n workflow processes leads; statuses should change to 'Contacted (Email)' or 'Contacted (LinkedIn)'.
  </verify>
  <done>Outreach progress is visible to the user in the dashboard.</done>
</task>

</tasks>

<verification>
Verify the end-to-end flow: User toggles campaign Active -> Next.js calls n8n -> n8n executes outreach -> Lead status updates -> UI reflects the change.
</verification>

<success_criteria>
- Dashboard UI allows campaign control.
- Next.js successfully triggers n8n.
- Real-time feedback in Leads table.
</success_criteria>

<output>
After completion, create `.planning/phases/03-n8n-outreach-engine/03-04-SUMMARY.md`
</output>
