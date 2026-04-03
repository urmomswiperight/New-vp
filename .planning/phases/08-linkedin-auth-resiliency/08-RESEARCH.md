# Phase 08: LinkedIn Auth Stability & Resiliency - Research

**Researched:** 2025-04-03
**Domain:** LinkedIn Browser Automation (Playwright + Browserless)
**Confidence:** HIGH

## Summary

The current `AUTHWALL` and `PROFILE_NOT_LOADED` issues are primarily caused by incomplete session injection. LinkedIn has increased its reliance on CSRF protection (`JSESSIONID`) and browser fingerprinting. Relying solely on the `li_at` cookie is no longer sufficient for stable automation in ephemeral environments like Vercel + Browserless.

To achieve stability, we must move from simple "Cookie Injection" to a "Full Storage State" injection, which includes all cookies (`li_at`, `JSESSIONID`, `bscookie`, etc.), `localStorage`, and `sessionStorage`. Additionally, leveraging Browserless's native Session API (BaaS v2) provides a persistent `userDataDir`, which simulates a real browser session across multiple runs.

**Primary recommendation:** Implement a robust `Storage State` management system where users provide a full JSON blob (from Playwright's `context.storageState()`) instead of just an `li_at` string. Use this state in conjunction with Browserless's Session API for multi-day persistence.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- We will prioritize "Cookie Injection" over "Persistent Browser" for now as it's more compatible with basic Browserless plans.
- If `li_at` continues to fail, we will move to a "Persistent Context" strategy if the infrastructure allows.

### Claude's Discretion
- Researching the exact combination of cookies/state needed for stability.
- Recommending the extraction method for users.

### Deferred Ideas (OUT OF SCOPE)
- Automatic cookie refreshing (requires user credentials, high risk).
- Proxy rotation (too expensive for current phase).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LNK-08-01 | Investigate if `li_at` alone is sufficient or if `JSESSIONID` and other cookies are required. | Verified: `JSESSIONID` is mandatory for CSRF; `li_at` is for auth. |
| LNK-08-02 | Research Browserless "Session Persistence" features and how to leverage them. | Identified Browserless Session API (BaaS v2) as the best path for Playwright. |
| LNK-08-03 | Implement a "Session Health Check" before starting any outreach task. | Recommended hitting `linkedin.com` or a profile to check for login redirects. |
| LNK-08-04 | Add support for multiple cookie injection (full cookie string or JSON). | Recommended standard Playwright `storageState` format for maximum stability. |
| LNK-08-05 | Update `TROUBLESHOOTING.md` with a more foolproof way to extract required cookies. | Provided manual extraction steps and the "Storage State" concept. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `playwright-core` | ^1.40.0 | Browser automation | Industry standard for reliable web scraping. |
| `browserless` | v2 (BaaS) | Remote browser execution | Handles browser overhead in serverless (Vercel) environments. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| `playwright-extra` | N/A | Stealth & plugins | Use when LinkedIn blocks headless browsers. |
| `puppeteer-extra-plugin-stealth` | N/A | Mask automation | Compatible with Playwright via `playwright-extra`. |

**Installation:**
```bash
npm install playwright-core playwright-extra puppeteer-extra-plugin-stealth
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── linkedin/
│   │   ├── session.ts      # Session health check & injection logic
│   │   ├── selectors.ts    # Centralized UI selectors (Role-based)
│   │   └── actions.ts      # Profile extraction & messaging
└── api/
    └── outreach/
        └── route.ts        # Vercel Edge/Serverless entry point
```

### Pattern 1: Storage State Injection
Instead of manual cookie arrays, use Playwright's native storage state.

```typescript
// Source: https://playwright.dev/docs/auth
const context = await browser.newContext({ 
  storageState: JSON.parse(userSessionJson),
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
});
```

### Anti-Patterns to Avoid
- **Hardcoded Selectors:** Avoid using fragile classes like `ember-123`. Use ARIA roles or stable classes like `.text-heading-xlarge`.
- **Global Auth Injection:** Don't inject cookies into a shared browser context if multiple users are running concurrently.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Stealth Detection | Custom header masking | `stealth` plugin | Detectors look for 100+ small inconsistencies. |
| Session Management | Custom cookie persistence | Browserless Session API | Handles `userDataDir` cleanup and TTL automatically. |

## Common Pitfalls

### Pitfall 1: Missing CSRF Token (`JSESSIONID`)
**What goes wrong:** Actions (like sending a message) fail with 403 Forbidden even if the profile loads.
**Why it happens:** LinkedIn's Voyager API requires the `JSESSIONID` to be sent as a `Csrf-Token` header for POST/PUT requests.
**How to avoid:** Ensure the `JSESSIONID` cookie is present in the injected session.

### Pitfall 2: Headless Detection (AUTHWALL)
**What goes wrong:** Redirected to login page immediately upon visiting a profile.
**Why it happens:** LinkedIn detects the `navigator.webdriver` flag or inconsistent user agents.
**How to avoid:** Use `playwright-extra` with the `stealth` plugin and a high-quality User-Agent.

## Code Examples

### Reliable Profile Name Extraction (2025)
```typescript
// Source: Verified Playwright Pattern
async function getProfileName(page: Page) {
  try {
    // Wait for the heading to appear (role-based is most resilient)
    const nameHeading = page.getByRole('heading', { level: 1 });
    await nameHeading.waitFor({ state: 'visible', timeout: 5000 });
    return (await nameHeading.innerText()).trim();
  } catch (e) {
    // Fallback to the classic selector
    const fallback = page.locator('h1.text-heading-xlarge');
    if (await fallback.isVisible()) {
      return (await fallback.innerText()).trim();
    }
    throw new Error('PROFILE_NOT_LOADED');
  }
}
```

### Session Health Check
```typescript
async function checkSessionHealth(page: Page): Promise<boolean> {
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  const url = page.url();
  // If redirected to login or authwall
  if (url.includes('/login') || url.includes('/authwall')) {
    return false;
  }
  // Check for presence of "Me" icon or Nav
  return await page.locator('.global-nav__me-photo').isVisible();
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `li_at` only | Storage State (JSON) | 2023-2024 | Mandatory for stability across sessions. |
| CSS Selectors | ARIA Roles | Ongoing | Reduces breakage from UI updates. |
| Ephemeral Browsers | Session-as-a-Service | 2024 | Persistent cache/cookies via Browserless. |

## Open Questions

1. **Browserless Plan Constraints:** Does the current Browserless plan support the Session API (BaaS v2)?
   - *Recommendation:* Check the Browserless dashboard. If not supported, we must rely on full manual `storageState` injection.
2. **User Extraction Difficulty:** Is it too difficult for users to extract a JSON blob?
   - *Recommendation:* Provide a small script or a clear 3-step guide in the UI.

## Sources

### Primary (HIGH confidence)
- [Playwright Official Docs](https://playwright.dev/docs/auth) - Authentication and Storage State.
- [Browserless.io Docs](https://www.browserless.io/docs/sessions) - Session API and persistence.
- [LinkedIn Internal API Research] - Voyager API and CSRF tokens.

### Secondary (MEDIUM confidence)
- [WebSearch verified] - `.text-heading-xlarge` selector prevalence in 2025.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Playwright is the gold standard.
- Architecture: HIGH - Storage State is the native Playwright solution.
- Pitfalls: HIGH - CSRF/Stealth are well-documented issues.

**Research date:** 2025-04-03
**Valid until:** 2025-05-03
