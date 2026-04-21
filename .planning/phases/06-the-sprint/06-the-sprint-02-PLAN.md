---
phase: 06-the-sprint
plan: 02-monitoring-and-dashboard
title: "Monitoring & Dashboard Enhancements"
description: "Real-time visibility into the 15-day sprint performance with automatic safety valves."
---

## Goals
1.  Visualize sprint progress (Sent, Replied, Interested).
2.  Implement a "Kill Switch" for the outreach engine in case of errors.
3.  Add daily performance summaries to the dashboard.

## User Review Required

> [!NOTE]
> We assume "Replied" status is manually updated unless an IMAP listener is added.
> **Question:** Should we add a node in n8n to automatically detect replies and update lead status?

## Proposed Changes

### 1. New Component: `src/components/dashboard/sprint-stats.tsx`
- **Purpose:** Display a progress bar for the 5000-lead goal.
- **Metrics:**
  - Total Sent (Status: Contacted)
  - Pending (Status: New)
  - Interested (Status: Interested/Meeting Booked)
  - Goal: 1 $500/mo Subscription.

### 2. Dashboard Integration (`src/app/dashboard/page.tsx`)
- Add the `SprintStats` component to the main dashboard.
- Update the "Usage Tracker" to show sprint-specific limits.

### 3. API Enhancement (`src/app/api/campaigns/status/route.ts`)
- Add a route to fetch real-time stats for the dashboard.

## Verification Plan

### Automated Tests
- Unit test for the `SprintStats` component with mock data.
- API route test to ensure correct status counts.

### Manual Verification
1.  Open Dashboard and verify the Sprint progress bar matches the database.
2.  Update a lead status to 'Interested' and confirm the dashboard reflects it.
