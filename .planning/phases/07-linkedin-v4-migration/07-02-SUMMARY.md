---
phase: 07-linkedin-v4-migration
plan: 02
subsystem: linkedin
tags: [outreach, api, nextjs, security]
requires: [linkedin-outreach-lib]
provides: [linkedin-outreach-api]
affects: [src/app/api/linkedin/outreach/route.ts]
tech-stack: [nextjs, typescript, playwright]
key-files: [src/app/api/linkedin/outreach/route.ts]
decisions:
  - "Implemented a secure Next.js API route using header-based authentication (X-Outreach-Secret)."
  - "Used a request ID pattern in logs to trace outreach attempts through the API."
  - "Enforced `nodejs` runtime and `force-dynamic` to ensure compatibility with Playwright and fresh execution."
metrics:
  duration: 450
  completed_date: "2026-03-29"
---

# Phase 07 Plan 02: LinkedIn Outreach API Wrapper Summary

## Objective
Implement the LinkedIn outreach API wrapper to expose the Playwright logic as a secure endpoint for remote triggers (like n8n Cloud).

## Key Accomplishments
- **Secure API Endpoint Created**: Developed `src/app/api/linkedin/outreach/route.ts` with strict authentication.
- **Header-Based Authentication**: Implemented verification of the `X-Outreach-Secret` header against `process.env.OUTREACH_SECRET`.
- **Request Validation**: Added validation for `profileUrl` and `message` parameters.
- **Execution Integration**: Successfully wrapped the `runLinkedInOutreach` shared library function.
- **Enhanced Logging**: Integrated structured logging with unique request IDs, masking URLs for privacy while maintaining traceability.
- **Runtime Optimization**: Configured the route to use the Node.js runtime, which is required for Playwright execution.

## Deviations from Plan
None.

## Self-Check: PASSED
- [x] `src/app/api/linkedin/outreach/route.ts` exists and implements the requested logic.
- [x] Authentication correctly uses the `X-Outreach-Secret` header.
- [x] Logging captures start, parameters, and outcome of each request.
- [x] Commits are made for each task.

## Commits
- `c4baed8`: feat(07-02): implement LinkedIn outreach API wrapper with authentication and logging
