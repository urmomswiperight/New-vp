---
phase: 07-linkedin-v4-migration
plan: 01
subsystem: linkedin
tags: [outreach, stealth, shared-logic, secrets]
requires: []
provides: [linkedin-outreach-lib, outreach-secret]
affects: [scripts/linkedin-outreach-v2.ts]
tech-stack: [playwright, typescript]
key-files: [src/lib/linkedin/outreach.ts, scripts/linkedin-outreach-v2.ts, .env.local, .env.example]
decisions:
  - "Extracted core outreach logic into `src/lib/linkedin/outreach.ts` for reuse in API routes."
  - "Implemented User-Agent rotation and jitter for enhanced stealth."
  - "Moved daily limit enforcement into the core library."
metrics:
  duration: 600
  completed_date: "2026-03-29"
---

# Phase 07 Plan 01: Shared Logic & Secret Setup Summary

## Objective
Refactor LinkedIn outreach logic into a shared library with enhanced stealth and configure environment secrets.

## Key Accomplishments
- **Outreach Secret Configured**: Generated `OUTREACH_SECRET` and added it to `.env.local` and `.env.example`.
- **Shared Outreach Library**: Created `src/lib/linkedin/outreach.ts` containing the `runLinkedInOutreach` function.
    - **Stealth Measures**: Added User-Agent rotation and increased randomized delays.
    - **Safety Limits**: Integrated daily safety limit (default 25) directly into the library.
    - **Session Management**: Ensured `.playwright-sessions` is used for persistent context.
- **CLI Script Refactored**: Updated `scripts/linkedin-outreach-v2.ts` to be a thin wrapper around the new library.

## Deviations from Plan
None.

## Self-Check: PASSED
- [x] `src/lib/linkedin/outreach.ts` exists and contains the refactored logic.
- [x] `scripts/linkedin-outreach-v2.ts` is a wrapper calling the library.
- [x] `.env.local` and `.env.example` contain `OUTREACH_SECRET`.
- [x] Commits are made for each task.

## Commits
- `b38c3d5`: chore(07-01): configure outreach secret in .env.example
- `99d38b9`: feat(07-01): create shared LinkedIn outreach library with stealth and limits
- `05d2217`: refactor(07-01): update outreach script to use shared library
