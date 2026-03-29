---
phase: 03-n8n-outreach-engine
plan: 02
type: execute
wave: 2
depends_on: ["03-n8n-outreach-engine-01"]
files_modified: []
autonomous: true
requirements: [EMAIL-WF]
user_setup: []

must_haves:
  truths:
    - "n8n sends emails via SMTP node"
    - "AI generates unique introductions for each lead"
    - "Wait nodes delay sending by a random interval (30-120s)"
    - "Supabase lead status updates to 'Contacted (Email)'"
  artifacts:
    - path: "n8n_email_workflow.json"
      provides: "Cold email outreach logic with jitter"
  key_links:
    - from: "OpenAI Node"
      to: "SMTP Node"
      via: "JSON reference"
      pattern: "intro"
    - from: "SMTP Node"
      to: "Supabase Node"
      via: "JSON reference"
      pattern: "update lead status"
---

<objective>
Develop the Cold Email outreach logic in n8n, incorporating AI-powered personalization and jitter/staggered sending to ensure high deliverability.

Purpose: Automates personalized email outreach at scale while mimicking human behavior.
Output: An n8n workflow capable of sending personalized cold emails with built-in delays.
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
</context>

<tasks>

<task type="auto">
  <name>Task 1: AI Personalization & SMTP Sequence</name>
  <files>n8n_email_workflow.json</files>
  <action>
    In the n8n workflow (continuing from Plan 01):
    1. Add an OpenAI node (Chat model GPT-4o-mini) to generate a short, personalized icebreaker based on the lead's company and website description (from Supabase).
    2. Add an HTML Template node (or use expression in SMTP) to construct the email body using the AI icebreaker and a predefined template.
    3. Add an SMTP node to send the email. Ensure it uses credentials configured in Plan 01.
    4. Export the workflow JSON.
  </action>
  <verify>
    Run a test execution with one lead and verify the email body contains a sensible AI-generated intro and is received by the test mailbox.
  </verify>
  <done>Emails are successfully generated and sent via SMTP.</done>
</task>

<task type="auto">
  <name>Task 2: Jitter & Supabase Sync</name>
  <files>n8n_email_workflow.json</files>
  <action>
    In the n8n workflow:
    1. Add a "Wait" node before the SMTP node.
    2. Set wait time to use a random expression: `{{ Math.floor(Math.random() * (120 - 30 + 1) + 30) }}` (seconds).
    3. Add a Supabase node after the SMTP node.
    4. Configure it to update the Lead record in Supabase: set `status` to 'Contacted (Email)' and increment `contact_count`.
    5. Re-export the workflow JSON.
  </action>
  <verify>
    Execute the workflow for 2-3 leads. Verify that they are sent with random delays (checked in n8n execution timing) and their status is updated in the database.
  </verify>
  <done>Outreach is staggered and status is synced back to the dashboard.</done>
</task>

</tasks>

<verification>
Ensure that emails are personalized by AI, sent with random delays, and the results are reflected in the Supabase database.
</verification>

<success_criteria>
- AI generates unique intros.
- Wait node adds 30-120s delay.
- SMTP sends emails successfully.
- Database is updated after each send.
</success_criteria>

<output>
After completion, create `.planning/phases/03-n8n-outreach-engine/03-02-SUMMARY.md`
</output>
