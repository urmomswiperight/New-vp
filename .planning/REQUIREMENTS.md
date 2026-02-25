# Requirements Document: AI Marketing Agent (15-Day Challenge)

## 1. System Overview
An automated B2B outreach and lead management platform built to secure a $500/mo recurring client within 15 days of system launch. The system integrates Next.js, Supabase, n8n, and Stripe to automate the sales funnel from lead import to subscription.

## 2. User Stories
- **As a User**, I want to import a CSV of 5000 leads into a centralized dashboard so I can manage my outreach pipeline.
- **As a User**, I want to start/stop outreach campaigns (Email + LinkedIn) via an n8n-powered engine.
- **As a User**, I want to view my daily usage, active leads, and campaign status on a clean, professional dashboard.
- **As a User**, I want a "Post-Call AI Onboarding" workflow that automatically researches a lead's competitors after a discovery call.
- **As a User**, I want to handle payments and subscriptions through a secure Stripe integration.

## 3. Technical Requirements
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, shadcn/ui.
- **Backend:** Supabase (Postgres, Auth, Edge Functions for heavy logic, Realtime for dashboard updates).
- **Automation (n8n):**
    - **Outreach Engine:** Multi-channel (Cold Email + LinkedIn).
    - **Deliverability:** Isolated domains, staggered sending, "Wait" nodes for jitter.
    - **LinkedIn:** Integration with Apify/Phantombuster for safe automation.
    - **Research:** GPT-4o for summarization + Perplexity API for real-time competitor analysis.
- **Payments:** Stripe Checkout + Webhooks for subscription lifecycle management.
- **Hosting:** Vercel (Frontend/API) + n8n (Self-hosted or Cloud).

## 4. Functional Requirements
### 4.1 Leads Management
- Import CSV/Excel (5000 records).
- Fields: Name, Company, Email, LinkedIn URL, Region (Ethiopia/Africa/International).
- Filtering by region and campaign status.

### 4.2 Campaign Engine
- Toggle switch for Email and LinkedIn automation.
- Automated follow-up sequences (3-5 touches).
- Integration with Supabase to track lead state (Contacted, Replied, Booked, Closed).

### 4.3 Billing & Usage
- $500/mo recurring subscription.
- Free Trial: 5 uses or 7 days.
- Soft block after usage limit reached; monthly reset.

### 4.4 AI Onboarding
- Trigger: Webhook from calendar/meeting app (e.g., Calendly/Zoom).
- Output: Competitor report (3-5 competitors, key strengths/weaknesses) pushed to Dashboard/Email.

## 5. Database Schema
- **users:** id, email, stripe_customer_id, subscription_status, usage_count.
- **leads:** id, user_id, first_name, last_name, company, email, linkedin_url, region, status.
- **campaigns:** id, user_id, name, type (Email/LI), status (Active/Paused), settings.
- **subscriptions:** id, user_id, stripe_subscription_id, plan, status, current_period_end.

## 6. API Endpoints
- `POST /api/leads/import`: Process and store lead lists.
- `POST /api/campaigns/start`: Trigger n8n outreach workflow.
- `GET /api/usage`: Fetch current user usage vs. limits.
- `POST /api/stripe/webhook`: Handle payment events and update `subscriptions` table.

## 7. UI/UX Strategy
- **Style:** "AdminDek" inspired: Clean, minimal, professional SaaS aesthetic.
- **Dashboard:** High-level metrics (Active Leads, Reply Rate, Projected MRR).
- **Leads Page:** Paginated table with quick-actions (Email/LinkedIn direct links).

## 8. Security & Compliance
- Supabase Auth (Email/Password + Google OAuth).
- HTTPS/TLS for all data in transit.
- RBAC: Users only see their own leads and campaign data.
- Rate limiting on API endpoints to prevent abuse.

## 9. Success Metrics
- [ ] 100% lead import success.
- [ ] Successful n8n-Stripe webhook loop.
- [ ] **Core Goal:** At least one $500/mo subscription within 15 days of campaign launch.
