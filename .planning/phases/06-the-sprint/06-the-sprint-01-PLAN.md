---
phase: 06-the-sprint
plan: 01-launch-automation
title: "Launch Automation & Regional Distribution"
description: "Prepare the lead database for the 15-day sprint with 60/40 regional distribution and n8n scaling."
---

## Goals
1.  Configure the lead database with 60% Ethiopia and 40% International leads.
2.  Mark all 5000 leads as "Ready for Outreach".
3.  Update n8n workflow to respect regional distribution and handle higher volume.

## User Review Required

> [!IMPORTANT]
> The current dataset lacks Ethiopian leads. We will use a script to assign 3000 leads as "Ethiopia" (even if they were originally sourced internationally) for testing purposes, OR we will assume the user has imported them.
> **Question:** Do you have a separate list of Ethiopian leads, or should I tag 60% of the existing 5000 as 'Ethiopia'?

## Proposed Changes

### 1. New Script: `scripts/launch-sprint.ts`
- **Purpose:** Automate the assignment of 5000 leads to "New" status.
- **Logic:**
  - Get all leads for the primary user.
  - Shuffle and assign "Ethiopia" to the first 3000 (60%).
  - Assign "International" to the remaining 2000 (40%).
  - Set status to 'New'.

### 2. n8n Workflow Updates (`n8n_email_workflow.json`)
- **Node: Get New Leads**
  - Update limit from 50 to 100 per trigger.
  - Add `region` filtering to maintain the daily 60/40 ratio.
- **Node: Jitter Wait**
  - Adjust wait times to prevent rate-limiting during high-volume send.

### 3. Server Actions (`src/lib/actions/campaigns.ts`)
- **Function: toggleCampaignStatus**
  - Add a "Sprint Mode" flag to trigger n8n more frequently or with larger batches.

## Verification Plan

### Automated Tests
- Run `launch-sprint.ts` in dry-run mode and verify the counts.
- Mock n8n trigger and verify it pulls the correct ratio of leads.

### Manual Verification
1.  Check Supabase dashboard for lead counts (3000 Ethiopia, 2000 International).
2.  Activate campaign and verify the first 100 emails are queued/sent.
