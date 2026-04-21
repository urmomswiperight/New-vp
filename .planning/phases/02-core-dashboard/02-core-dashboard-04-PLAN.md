# Plan: 02-core-dashboard-04 - Usage Tracking & Trial Logic

**Objective:** Implement basic usage tracking and enforce free trial limits.

## Context
- Phase: 02-core-dashboard
- Depends on: 02-core-dashboard-03

## Tasks
- [ ] Implement `src/lib/usage.ts` utility for checking and incrementing usage.
- [ ] Add `usage_count` check to `importLeadsAction`.
- [ ] Create `src/components/dashboard/usage-tracker.tsx` for visual feedback in the sidebar.
- [ ] Implement middleware logic to redirect to `/dashboard/billing` if usage limit is reached.
- [ ] Define trial limits (e.g., 5 uses or 7 days).

## Verification
- [ ] Usage count is correctly tracked in the database.
- [ ] Users are redirected to billing once the limit is reached.
- [ ] Trial duration is respected.
- [ ] Visual tracker updates in real-time.
