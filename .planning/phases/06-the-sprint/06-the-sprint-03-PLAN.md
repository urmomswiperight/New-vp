---
phase: 06-the-sprint
plan: 03-ab-testing-outreach
title: "Optimization & Copy A/B Testing"
description: "Implement A/B testing for outreach copy to maximize engagement and identify winning strategies."
---

## Goals
1.  Add A/B testing capabilities to the outreach engine.
2.  Implement two distinct copy variants (A: Feature-focused, B: Benefit-focused).
3.  Visualize A/B test performance in the dashboard.
4.  Automate variant assignment during lead import or campaign start.

## User Review Required

> [!NOTE]
> We will split leads 50/50 between Variant A and Variant B.
> **Question:** Do you have specific copy variants in mind, or should we use the proposed AI-generated ones?

## Proposed Changes

### 1. Database Schema Update (`prisma/schema.prisma`)
- Add `variant` field to the `Lead` model (String, default: null).
- Update the `metadata` field to store engagement metrics per variant if needed (already exists).

### 2. n8n Workflow Enhancement (`n8n_email_workflow.json` & `n8n_linkedin_workflow.json`)
- Add a "Split by Variant" node (Switch node).
- Path A: Direct, professional, feature-focused icebreaker.
- Path B: Conversational, benefit-oriented, "curiosity" based icebreaker.
- Ensure the `Update Lead Status` node also records which variant was sent.

### 3. Dashboard Enhancement (`src/app/dashboard/page.tsx` & `src/components/dashboard/sprint-stats.tsx`)
- Update `SprintStats` to show performance split by Variant A vs Variant B.
- Metrics: Sent, Replies, Interest Rate per variant.

### 4. Logic for Variant Assignment (`src/lib/actions/leads.ts`)
- Update `importLeadsAction` to randomly assign "A" or "B" to the `variant` field if not already present.

## Verification Plan

### Automated Tests
- Script to verify that leads are assigned variants 50/50.
- Unit test for the updated `SprintStats` component with variant data.

### Manual Verification
1.  Import 10 leads and verify that they have 'A' or 'B' assigned in the database.
2.  Trigger a campaign and verify in n8n logs that both paths are being executed.
3.  Check the dashboard to ensure the comparison UI is rendered and showing correct numbers.
