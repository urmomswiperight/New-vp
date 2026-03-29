# Phase 3: n8n Outreach Engine - Revised ($0 Stack)

**Researched:** 2024-05-23 (Updated 2026-02-28)
**Domain:** Automation & Outreach (n8n, SMTP, LinkedIn)
**Stack:** $0 Total Cost, Local-First

## <user_constraints>
- **Total Cost:** $0 (No credit card required)
- **Automation:** Local n8n (Docker)
- **Email:** Gmail Personal Account (SMTP + App Password)
- **AI Writing:** Groq (Free Tier) or Local LLM (Ollama)
- **LinkedIn:** Local Puppeteer/Playwright or Scraping (No Apify/Phantombuster if they require CC)
- **Leads:** 5,000 imported via bulk script
</user_constraints>

## Zero-Cost Stack Components

### 1. Automation: Local n8n
- **Setup:** Docker container running on host machine.
- **Persistence:** Mount volume for workflow data.
- **Access:** Webhook exposed via local tunnel (e.g., Cloudflared or Localtunnel) only for testing, or direct local access if Next.js is also local.

### 2. Email: Personal Gmail
- **Node:** SMTP Node in n8n.
- **Config:** `smtp.gmail.com`, port 465 (SSL), Auth: Gmail App Password.
- **Limit:** ~500 emails/day (free).

### 3. AI Personalization: Groq
- **API:** Groq provides a high-speed free tier for Llama 3 models.
- **Node:** HTTP Request node in n8n calling Groq API.
- **Usage:** Generate custom icebreakers based on lead position/company.

### 4. LinkedIn: Local Automation
- **Strategy:** Use n8n "Execute Command" node to run a local Playwright script, or use n8n's "HTTP Request" to interact with LinkedIn if possible without detection.
- **Alternative:** Manual outreach for high-value leads identified by AI.

## Technical Architecture

### Lead Flow
1. **Import:** `scripts/import-leads.ts` populates Supabase.
2. **Trigger:** Dashboard UI calls `/api/campaigns/start`.
3. **Logic:** n8n fetches batch of leads from Supabase.
4. **AI:** Groq generates personalized copy.
5. **Action:** SMTP node sends email.
6. **Track:** Lead opens email -> calls Next.js `/api/track/[id]` -> updates Supabase.

### Dashboard Bypass
- Update `checkUsageLimit` to allow unlimited usage for specific `admin` user IDs.

## Common Pitfalls
- **Gmail Spam:** Sending 5,000 emails too fast will burn the account.
- **Fix:** Implement 2-5 minute jitter between sends in n8n.
- **Database Connectivity:** Ensure Next.js and n8n can both reach the Postgres DB.
