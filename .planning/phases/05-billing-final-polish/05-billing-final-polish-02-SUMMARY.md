# Plan 02 Summary: API Enforcement & Guards

## Objective
Secure the AI research and outreach endpoints with automated usage limits.

## Completed Tasks
- [x] **Research API Guarded**: Implemented `checkUsageLimit` and `incrementUsage` in `/api/research/summarize`.
- [x] **Campaign API Guarded**: Added usage checks to `/api/campaigns/start`.
- [x] **Leads Import Guarded**: Ensured that CSV imports are subject to the free trial limits in `importLeadsAction`.

## Technical Details
- All core endpoints now return `403 Forbidden` with a descriptive message if the user's trial has expired or the usage limit (5) has been reached.
- Atomic usage incrementing is performed only after successful operations.
