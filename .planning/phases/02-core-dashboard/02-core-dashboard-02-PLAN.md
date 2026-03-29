# Plan: 02-core-dashboard-02 - Lead Management Table

**Objective:** Build the leads management page with a searchable and filterable data table.

## Context
- Phase: 02-core-dashboard
- Depends on: 02-core-dashboard-01

## Tasks
- [ ] Install shadcn `table`, `badge`, `checkbox` components.
- [ ] Install `@tanstack/react-table`.
- [ ] Create `src/app/dashboard/leads/columns.tsx` for table definition.
- [ ] Create `src/app/dashboard/leads/data-table.tsx` for the table component.
- [ ] Create `src/app/dashboard/leads/page.tsx` to fetch and display leads.
- [ ] Implement client-side filtering by Name, Email, and Region.
- [ ] Add Status badges (New, Contacted, etc.).

## Verification
- [ ] Leads are fetched from the database and displayed correctly.
- [ ] Filtering works as expected.
- [ ] Table is responsive.
