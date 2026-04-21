# Plan: 02-core-dashboard-03 - CSV Import Functionality

**Objective:** Implement bulk CSV import for leads with validation and batching.

## Context
- Phase: 02-core-dashboard
- Depends on: 02-core-dashboard-02

## Tasks
- [ ] Install `papaparse`.
- [ ] Install shadcn `dialog`, `toast` components.
- [ ] Create `src/components/leads/import-modal.tsx` for CSV upload.
- [ ] Implement client-side CSV parsing with `papaparse`.
- [ ] Create `src/lib/actions/leads.ts` with `importLeadsAction`.
- [ ] Implement bulk creation in Database using Prisma `createMany`.
- [ ] Add loading states and success/error notifications.

## Verification
- [ ] CSV file is parsed correctly.
- [ ] Leads are imported into the database in batches.
- [ ] Toast notifications confirm success or failure.
- [ ] Errors (e.g., duplicate emails) are handled gracefully.
