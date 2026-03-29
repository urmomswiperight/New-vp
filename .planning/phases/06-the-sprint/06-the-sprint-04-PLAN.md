---
phase: 06-the-sprint
plan: 04-scale-outreach
title: "Scaling & Final Sprint Report"
description: "Scale outreach to the full 5,000 lead dataset and generate a comprehensive performance report to verify success criteria."
---

## Goals
1.  Scale the outreach engine to process all remaining 5,000 leads.
2.  Implement a final "Performance Report" generator in the dashboard.
3.  Verify the $500/mo subscription goal.
4.  Conduct a final project audit and cleanup.

## User Review Required

> [!IMPORTANT]
> Scaling to 5,000 leads will require a higher daily volume. We will set the n8n daily quota to 400 leads/day (60/40 regional split) to finish the sprint within the remaining days.
> **Question:** Are you ready to start the full scale-up, or should we continue with the current batch size for another day?

## Proposed Changes

### 1. n8n Workflow Scaling (`n8n_email_workflow.json`)
- Increase the "Get New Leads" limit to 400.
- Update the "Cron Trigger" to run daily at a specific time (e.g., 20:00 UTC).
- Ensure the regional filtering (60% Ethiopia, 40% International) is strictly enforced in the query.

### 2. Final Report Component (`src/components/dashboard/final-report.tsx`)
- Create a new component `FinalReport` that summarizes:
  - Total Leads Contacted.
  - Overall Reply Rate.
  - Meeting Booked count.
  - Conversion Rate to Paid Subscriptions.
  - Winner of the A/B test (Variant A vs B).

### 3. Dashboard Integration (`src/app/dashboard/page.tsx`)
- Add the `FinalReport` component to the main dashboard view, visible only when the sprint is near completion or manually triggered.

### 4. Sprint Cleanup Script (`scripts/sprint-cleanup.ts`)
- Script to archive contacted leads and prepare the database for the next campaign.
- Generate a CSV export of all "Interested" leads for manual follow-up.

## Verification Plan

### Automated Tests
- Run `count-leads.ts` to verify the total count of contacted leads.
- Unit test for `FinalReport` calculations.

### Manual Verification
1.  Trigger the scaled-up n8n workflow and monitor the first 400 sends.
2.  Verify the `FinalReport` UI renders correctly with live data.
3.  Check if any $500/mo subscription has been recorded in Supabase.
