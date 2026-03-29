# Phase 7: LinkedIn Outreach V4 Migration

## Goal
Implement a private Next.js API for LinkedIn automation to move Playwright logic into an API route. This supports n8n Cloud users without requiring 3rd party LinkedIn tools.

## Requirements
- **LNK-01**: Create `src/app/api/linkedin/outreach/route.ts` (API Wrapper).
- **LNK-02**: Update `scripts/linkedin-outreach-v2.ts` with stealth mode and daily limits.
- **LNK-03**: Create `n8n_linkedin_api_v4.json` (Cloud-ready workflow).
- **LNK-04**: Add `OUTREACH_SECRET` to `.env.local` for API authentication.
- **LNK-05**: Verify the API route locally using a test script or curl.

## Decisions
- The API route will wrap the existing Playwright logic.
- Authentication for the API will be via a shared secret (`OUTREACH_SECRET`).
- `scripts/linkedin-outreach-v2.ts` will be updated to include stealth features (UA rotation, randomized delays) and enforcement of daily limits.
- The n8n workflow will call this Next.js API route instead of running local scripts.

## Deferred Ideas
- Multi-account rotation (focus on single account for now).
- Advanced captcha solving (manual intervention if needed).

## Claude's Discretion
- Implementation of "stealth" measures in the script (e.g., playwright-extra-stealth or similar if available, or just custom headers/delays).
- API response structure (success/failure, logs).
