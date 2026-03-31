# Deployment Handover: LinkedIn Outreach V4

## Current Project Status: **Phase 07 Complete (Awaiting Vercel Success)**

We have successfully migrated the LinkedIn outreach logic from a local Playwright script to a cloud-ready Next.js API that uses **Browserless.io** for remote browser execution.

---

### ✅ Completed Work (Phase 07)
1.  **Shared Library**: `src/lib/linkedin/outreach.ts` now uses `chromium.connectOverCDP` to connect to Browserless.io. It includes stealth measures (UA rotation, jitter) and a 25/day safety limit.
2.  **Secure API Route**: `src/app/api/linkedin/outreach/route.ts` is a POST endpoint protected by the `X-Outreach-Secret` header.
3.  **Cloud Workflow**: `n8n_linkedin_api_v4.json` is a new n8n workflow template using `API_BASE_URL` and `OUTREACH_SECRET` variables.
4.  **Deployment Fixes**:
    *   **`.npmrc`**: Added `legacy-peer-deps=true` to fix React 19 vs. `cmdk` version conflicts during `npm install`.
    *   **UI Components**: Restored missing `command.tsx`, `popover.tsx`, `faceted-filter.tsx`, and `data.ts` to fix "Module not found" errors.
    *   **TypeScript Fixes**: Corrected `.ts` extension imports in `check_status.ts` and `reset_leads.ts`.

---

### 🚀 Deployment Instructions for the Next Agent

**Repository:** `https://github.com/urmomswiperight/New-vp` (Branch: `main`)

#### 1. Vercel Configuration
Ensure the following **Environment Variables** are set in the Vercel Dashboard:
*   `BROWSERLESS_WSS`: `wss://chrome.browserless.io?token=YOUR_API_KEY`
*   `OUTREACH_SECRET`: (Your chosen secret key)
*   `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (From `.env.local`)

#### 2. n8n Cloud Configuration
Update the **Global Variables** in n8n Cloud:
*   `API_BASE_URL`: The production URL provided by Vercel (e.g., `https://new-vp.vercel.app`).
*   `OUTREACH_SECRET`: The same secret used in Vercel.

#### 3. Verification Steps
1.  Verify Vercel build completes successfully (no more "Module not found" or "ERESOLVE" errors).
2.  Import `n8n_linkedin_api_v4.json` into n8n Cloud.
3.  Run a test outreach in n8n and monitor Vercel logs for successful Browserless connection.

---

### ⚠️ Known Blockers (Resolved but watch for regressions)
*   **Vercel & Playwright**: Do **NOT** use local chromium; always use the Browserless.io WebSocket connection.
*   **Case Sensitivity**: Vercel is Linux-based; ensure all file imports match the disk's case exactly.
*   **React 19**: Keep `.npmrc` in the root to prevent dependency resolution failures.
