# Plan: 02-core-dashboard-01 - Dashboard Shell & Sidebar

**Objective:** Implement the main dashboard layout with a professional sidebar and navigation.

## Context
- Phase: 02-core-dashboard
- Depends on: Phase 01 completion.

## Tasks
- [ ] Install `next-themes` and configure `ThemeProvider`.
- [ ] Install shadcn `sidebar`, `dropdown-menu`, `avatar` components.
- [ ] Create `src/components/dashboard/app-sidebar.tsx` using shadcn Sidebar.
- [ ] Create `src/app/dashboard/layout.tsx` to wrap all dashboard routes.
- [ ] Implement a Topbar with breadcrumbs and user profile menu.
- [ ] Update `src/app/dashboard/page.tsx` with a summary view (Stats cards).

## Verification
- [ ] Dashboard layout renders correctly on desktop and mobile.
- [ ] Sidebar links work and highlight active routes.
- [ ] Theme switching works (Light/Dark).
- [ ] User profile displays correct info from Supabase.
