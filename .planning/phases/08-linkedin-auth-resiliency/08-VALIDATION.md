# Phase 08 Validation: LinkedIn Auth Stability & Resiliency

This document maps the requirements for Phase 08 to specific automated tests and manual verification steps to ensure the stability and resiliency of the LinkedIn automation system.

## Requirement Mapping

| Req ID | Requirement | Plan | Automated Test | Status |
|--------|-------------|------|----------------|--------|
| **LNK-08-01** | Full Storage State Management (JSESSIONID + li_at) | 08-01, 08-03 | `tests/auth.spec.ts` | ⚪ Pending |
| **LNK-08-02** | Browserless Session Persistence Research/Implementation | 08-02 | `npm run build` | ⚪ Pending |
| **LNK-08-03** | Session Health Check Utility | 08-01, 08-02 | `tests/health.spec.ts` | ⚪ Pending |
| **LNK-08-04** | Support for full JSON injection | 08-03 | `tests/auth.spec.ts` | ⚪ Pending |
| **LNK-08-05** | Troubleshoot/Export Session Manual Documentation | 08-03 | `grep "LinkedIn Session Resiliency" TROUBLESHOOTING.md` | ⚪ Pending |

## Automated Test Suites

### 1. Health Check Unit Tests
**File:** `tests/health.spec.ts`
**Purpose:** Verify the logic that detects LinkedIn login states (LOGGED_IN, LOGGED_OUT, CHALLENGED) using mocked responses.
**Command:** `npx playwright test tests/health.spec.ts`

### 2. Auth Integration Tests
**File:** `tests/auth.spec.ts`
**Purpose:** Verify that the `injectFullStorageState` utility correctly handles full Playwright `storageState` JSON, including `JSESSIONID` and `li_at` cookies.
**Command:** `npx playwright test tests/auth.spec.ts`

### 3. Build & Type Safety
**Purpose:** Ensure that all refactored LinkedIn actions and API routes are correctly typed and integrated.
**Command:** `npm run build`

## Manual Verification (UAT)

### Session Resiliency Check
1. **Setup:** Export a full `storageState.json` from a logged-in LinkedIn session.
2. **Action:** Set the `LI_SESSION` environment variable to the stringified content of this JSON.
3. **Execution:** Trigger an outreach request via the API.
4. **Verification:**
    - Check server logs for "Health Check: LOGGED_IN".
    - Confirm the automation successfully navigates and interacts with the profile using resilient role-based selectors.

## Success Criteria
- [ ] All automated tests in `tests/health.spec.ts` and `tests/auth.spec.ts` pass.
- [ ] `TROUBLESHOOTING.md` contains clear instructions for full session extraction.
- [ ] API route rejects requests with clear 'CHALLENGED' or 'LOGGED_OUT' errors when health checks fail.
- [ ] Connection requests succeed using ARIA-role-based selectors even if Artdeco CSS classes are hidden or changed.
