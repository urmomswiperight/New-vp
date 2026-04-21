# Project Roadmap: AI Marketing Agent (15-Day Sprint)

## Phase 1: Technical Foundation (COMPLETE)
- [x] Initialize Next.js 15 (App Router, TypeScript).
- [x] Setup Supabase Project (Postgres, Auth, Edge Functions).
- [x] Create Database Tables (users, leads, campaigns, subscriptions).
- [x] Implement Auth (Email/Password + Google OAuth).
- [x] **Implement Fiverr Manual Payment Flow** (Immediate Launch).

## Phase 1.5: Payment Alternatives (Future)
- [ ] **Integrate Gumroad** (Direct sales of service credits/subscriptions).
- [ ] Migrate from manual verification to automated webhooks for Gumroad.
- [ ] Add support for additional manual payment proofs (Local bank transfers).

## Phase 2: Core Dashboard & Lead Management (COMPLETE)
- [x] Build "AdminDek" style dashboard shell (Tailwind + shadcn/ui).
- [x] Develop `leads` page with CSV import logic (`/api/leads/import`).
- [x] Implement leads table with filtering (Region, Status).
- [x] Setup basic usage tracking (5 uses or 7-day trial).

## Phase 3: n8n Outreach Engine (COMPLETE)
- [x] Setup n8n self-hosted or cloud instance.
- [x] Develop Cold Email workflow (SMTP, Templates, Jitter).
- [x] Develop LinkedIn workflow (Playwright Local Stack).
- [x] Connect Next.js to n8n (`/api/campaigns/start`).
- [x] Implement campaign toggle UI (Active/Paused).

## Phase 4: AI Onboarding & Research (COMPLETE)
- [x] Integrate local Ollama (Llama 3.1) for meeting summarization.
- [x] Develop automated "Competitor Research" workflow in n8n.
- [x] Implement Research Battle Card UI in the dashboard.

## Phase 5: Billing & Final Polish (COMPLETE)
- [x] Implement usage limits (5 uses or 7-day trial).
- [x] Finalize billing page with usage limits and subscription status.
- [x] Error handling for API limits and outreach failures.
- [x] Final UI/UX refinement (AdminDek style).

## Phase 6: THE SPRINT (COMPLETE)
- [x] **Launch:** Start campaigns for all 5000 leads.
- [x] **Daily Activity:** 60% Africa/Ethiopia, 40% International.
- [x] **Optimization:** Refine outreach copy based on A/B testing (Variant B winner).
- [x] **Scaling:** Full 5,000 lead cohort processing active.
- [x] **Reporting:** Final Performance Report integrated.

## Phase 7: LinkedIn Outreach V4 Migration (COMPLETE)
- [x] Implement private Next.js API for LinkedIn automation.
- [x] Move Playwright logic to API route for n8n Cloud support.
- [x] Enhanced stealth and daily limit enforcement.

**Plans:** 3 plans
- [x] 07-01-PLAN.md — Shared Logic & Secret Setup
- [x] 07-02-PLAN.md — LinkedIn Outreach API Wrapper
- [x] 07-03-PLAN.md — n8n Cloud Integration & Verification

## Phase 8: LinkedIn Auth Stability & Resiliency (COMPLETE)
- [x] Implement full Storage State (JSON) session management.
- [x] Add robust health checks before automation tasks.
- [x] Use role-based and accessible UI selectors for resilience.

**Plans:** 3 plans
- [x] 08-01-PLAN.md — Session Injection & Health Utility
- [x] 08-02-PLAN.md — Upgrade LinkedIn Workflows
- [x] 08-03-PLAN.md — Documentation & Final Verification

## Success Criteria Checklist
- [x] [Phase 1-5] System Built and Verified.
- [x] [Phase 6] Campaign Launched and Scaled.
- [x] [Phase 7] LinkedIn API Migration Successful.
- [x] [Phase 8] LinkedIn Auth Stability Resolved.
- [ ] [Phase 6] Secure first $500/mo subscription (Ongoing).
