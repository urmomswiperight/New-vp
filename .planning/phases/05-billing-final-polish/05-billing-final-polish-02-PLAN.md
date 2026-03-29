---
phase: 5
plan: 2
objective: API Enforcement & Guards
---

# Plan 02: API Enforcement & Guards

Secure the AI and outreach endpoints with usage limits.

## Tasks
- [ ] **Guard Research API**: In `src/app/api/research/summarize/route.ts`:
    - Call `checkUsageLimit(user.id)`.
    - Return 403 Forbidden with a specific "Upgrade Required" message if blocked.
    - Call `incrementUsage(user.id)` on successful n8n call.
- [ ] **Guard Campaign API**: In `src/app/api/campaigns/start/route.ts`:
    - Call `checkUsageLimit(user.id)`.
    - Return 403 Forbidden if blocked.
    - Call `incrementUsage(user.id)` on successful n8n call.
- [ ] **Guard Leads Import**: In `src/lib/actions/leads.ts` or the API route handling leads import, check the usage limit before allowing a large import.

## Verification
- [ ] Test the `/api/research/summarize` route with a user who has hit their limit.
- [ ] Test the `/api/campaigns/start` route with a user who has hit their limit.
- [ ] Verify that the `usage_count` in the database increments correctly after successful operations.
- [ ] Verify that an Admin user is never blocked.
