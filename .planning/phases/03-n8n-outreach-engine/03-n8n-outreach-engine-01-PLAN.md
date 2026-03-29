---
phase: 03-n8n-outreach-engine
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: false
requirements: [N8N-SETUP]
user_setup:
  - service: n8n
    why: "Workflow automation platform"
    env_vars:
      - name: N8N_API_KEY
        source: "n8n Settings -> API Keys"
    dashboard_config:
      - task: "Setup credentials for Supabase, SMTP, and OpenAI"
        location: "n8n Dashboard -> Credentials"

must_haves:
  truths:
    - "n8n instance is accessible via browser"
    - "Webhook endpoint returns 200 OK when called with valid X-API-KEY"
    - "Webhook endpoint returns 401 Unauthorized when called without valid X-API-KEY"
  artifacts:
    - path: "n8n_foundation_workflow.json"
      provides: "Base workflow with webhook and auth logic"
  key_links:
    - from: "n8n Webhook"
      to: "Supabase Campaigns Table"
      via: "Supabase Node"
      pattern: "query status"
---

<objective>
Setup the n8n foundation, including secure webhook entry points and the external flag check pattern (Active/Paused) to ensure outreach respects user control.

Purpose: Provides the secure entry point for Next.js to trigger automation.
Output: A functional n8n workflow with a secured webhook and status check logic.
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
</context>

<tasks>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 1: n8n Instance Accessibility & Credentials</name>
  <what-built>n8n instance accessibility and credential configuration</what-built>
  <how-to-verify>
    1. Log in to your n8n instance.
    2. Go to Credentials and ensure you have configured:
       - SMTP (for Email)
       - Supabase (for Lead/Campaign data)
       - OpenAI (for personalization)
    3. Confirm you can create a new workflow.
  </how-to-verify>
  <resume-signal>n8n is ready and credentials are configured.</resume-signal>
</task>

<task type="auto">
  <name>Task 2: Secure Webhook Entry Point</name>
  <files>n8n_foundation_workflow.json</files>
  <action>
    In the n8n dashboard:
    1. Create a new workflow named "Outreach Engine".
    2. Add a Webhook node:
       - Method: POST
       - Path: outreach-trigger
       - Authentication: Header Auth (Name: X-API-KEY, Value: your-secret-key)
    3. Add a "Respond to Webhook" node to return 200 OK immediately to Next.js.
    4. Export the workflow JSON to n8n_foundation_workflow.json in the project root.
  </action>
  <verify>
    Run: `curl -X POST -H "X-API-KEY: your-secret-key" [N8N_WEBHOOK_URL]`
    Should return 200.
    Run: `curl -X POST [N8N_WEBHOOK_URL]`
    Should return 401 or fail authentication.
  </verify>
  <done>Webhook is secured and responds to authorized requests.</done>
</task>

<task type="auto">
  <name>Task 3: Implement External Flag Check</name>
  <files>n8n_foundation_workflow.json</files>
  <action>
    In the n8n workflow:
    1. Add a Supabase node after the Webhook.
    2. Configure it to fetch the campaign status using the campaignId passed in the webhook body.
    3. Add an "IF" node to check if `status === 'Active'`.
    4. If false, end the workflow. If true, continue to outreach logic.
    5. Re-export the JSON.
  </action>
  <verify>
    Manually trigger the webhook with a campaignId that is 'Paused' in Supabase.
    Check n8n execution history to ensure it stopped at the IF node.
  </verify>
  <done>Workflow correctly respects the Active/Paused status from Supabase.</done>
</task>

</tasks>

<verification>
Verify that the n8n workflow is reachable, secured by X-API-KEY, and successfully queries Supabase to check campaign status before proceeding.
</verification>

<success_criteria>
- n8n workflow is live and responding to webhooks.
- Webhook requires correct X-API-KEY.
- Workflow stops if campaign status is not 'Active'.
</success_criteria>

<output>
After completion, create `.planning/phases/03-n8n-outreach-engine/03-01-SUMMARY.md`
</output>
