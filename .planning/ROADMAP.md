# Project Roadmap: AI Marketing Agent (15-Day Sprint)

## Phase 1: Technical Foundation (Days 1-3)
- [ ] Initialize Next.js 15 (App Router, TypeScript).
- [ ] Setup Supabase Project (Postgres, Auth, Edge Functions).
- [ ] Create Database Tables (users, leads, campaigns, subscriptions).
- [ ] Implement Auth (Email/Password + Google OAuth).
- [ ] Configure Stripe (Account, Products, Webhooks).

## Phase 2: Core Dashboard & Lead Management (Days 4-6)
- [ ] Build "AdminDek" style dashboard shell (Tailwind + shadcn/ui).
- [ ] Develop `leads` page with CSV import logic (`/api/leads/import`).
- [ ] Implement leads table with filtering (Region, Status).
- [ ] Setup basic usage tracking (5 uses or 7-day trial).

## Phase 3: n8n Outreach Engine (Days 7-9)
- [ ] Setup n8n self-hosted or cloud instance.
- [ ] Develop Cold Email workflow (SMTP, Templates, Jitter).
- [ ] Develop LinkedIn workflow (Apify/Phantombuster API integration).
- [ ] Connect Next.js to n8n (`/api/campaigns/start`).
- [ ] Implement campaign toggle UI (Active/Paused).

## Phase 4: AI Onboarding & Research (Days 10-12)
- [ ] Integrate GPT-4o for meeting summarization/analysis.
- [ ] Integrate Perplexity API for deep-dive competitor research.
- [ ] Develop automated "Post-Call Research" workflow in n8n.
- [ ] Push research reports to the dashboard and user email.

## Phase 5: Billing & Final Polish (Days 13-15)
- [ ] Implement Stripe Checkout flow for $500/mo subscription.
- [ ] Finalize billing page with usage limits and subscription status.
- [ ] Error handling for API limits and outreach failures.
- [ ] Final UI/UX refinement (AdminDek style).

## Phase 6: THE SPRINT (15 Days Post-Launch)
- [ ] **Launch:** Start campaigns for all 5000 leads.
- [ ] **Daily Activity:** 60% Africa/Ethiopia, 40% International.
- [ ] **User Action:** Handle discovery calls (20:00-05:00 UTC).
- [ ] **Optimization:** Refine outreach copy based on initial reply rates.
- [ ] **Goal Check:** Secure at least one $500/mo Stripe subscription.

## Success Criteria Checklist
- [ ] [Phase 1-5] System Built and Verified.
- [ ] [Phase 6] Campaign Launched.
- [ ] [Phase 6] 1st Stripe Subscription Received.
