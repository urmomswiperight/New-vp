# Phase 08: LinkedIn Auth Stability & Resiliency - Pattern Map

**Mapped:** 2025-04-04
**Files analyzed:** 6
**Analogs found:** 4 / 6

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/linkedin/session.ts` | utility | request-response | `src/lib/browser.ts` | exact (split) |
| `src/lib/linkedin/selectors.ts` | config | static | (New Pattern) | N/A |
| `src/lib/linkedin/actions.ts` | service | browser-automation | `src/lib/linkedin/outreach.ts` | exact |
| `src/app/api/outreach/route.ts` | controller | request-response | `src/app/api/linkedin/outreach/route.ts` | exact |
| `src/lib/browser.ts` | utility | request-response | (Self) | exact |
| `src/lib/linkedin/outreach.ts` | service | browser-automation | (Self) | exact |

## Pattern Assignments

### `src/lib/linkedin/session.ts` (utility, request-response)
*Extracting session management logic from browser.ts into a dedicated LinkedIn session handler.*

**Analog:** `src/lib/browser.ts`

**Imports pattern:**
```typescript
import type { BrowserContext, Page } from 'playwright-core';
// Import from existing browser utility
import { checkSessionHealth as baseHealthCheck } from '../browser';
```

**Full Storage State Injection (Target Pattern):**
*Derived from Phase 08 research and existing scripts/export-session.ts*
```typescript
// Proposed implementation for session.ts
export async function injectFullStorageState(context: BrowserContext, sessionJson: string) {
    try {
        const storageState = JSON.parse(sessionJson);
        // Playwright native storage state injection
        await context.addCookies(storageState.cookies || []);
        // Note: Playwright doesn't have addLocalStorage, so we must inject via page
        return storageState;
    } catch (e) {
        console.error('Failed to parse session JSON');
    }
}
```

---

### `src/lib/linkedin/selectors.ts` (config, static)
*Centralizing UI selectors to improve resilience against LinkedIn UI updates.*

**Analog:** None (New pattern to be introduced)

**Role-based Selector Pattern:**
*Derived from Code Examples in 08-RESEARCH.md*
```typescript
export const SELECTORS = {
  profile: {
    name: { role: 'heading', level: 1 },
    connect: { role: 'button', name: 'Connect', exact: true },
    more: { role: 'button', name: 'More actions' },
    addNote: { label: 'Add a note' },
    messageTextbox: { role: 'textbox', name: 'message' },
    sendNow: { label: 'Send now' }
  },
  messaging: {
    unreadCard: '.msg-conversation-card--unread',
    participantName: '.msg-conversation-card__participant-names'
  }
};
```

---

### `src/lib/linkedin/actions.ts` (service, browser-automation)
*Core automation actions refactored from outreach.ts.*

**Analog:** `src/lib/linkedin/outreach.ts`

**Human-like Interaction Pattern** (lines 110-120):
```typescript
const textArea = await page.getByRole('textbox', { name: 'message' });
for (const char of message) {
    // Type with random delays
    await page.keyboard.type(char, { delay: 40 + Math.random() * 60 });
}
await page.waitForTimeout(1000);
```

**Navigation & Verification Pattern** (lines 80-105):
```typescript
await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000 + Math.random() * 2000);

// Multi-fallback verification
const nameHeader = await page.getByRole('heading', { level: 1 }).filter({ hasText: /[a-zA-Z]/ }).first();
const profileLoaded = await nameHeader.isVisible().catch(() => false) || 
                      await page.$('.text-heading-xlarge');
```

---

### `src/app/api/outreach/route.ts` (controller, request-response)
*Standardizing the outreach entry point.*

**Analog:** `src/app/api/linkedin/outreach/route.ts`

**API Guard & Validation Pattern** (lines 10-25):
```typescript
// 1. Authentication: Verify X-Outreach-Secret header
const secretHeader = req.headers.get('X-Outreach-Secret');
if (!secretHeader || secretHeader !== process.env.OUTREACH_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// 2. Request Body Parsing & Validation
const body = await req.json().catch(() => ({}));
const { profileUrl, message } = body;
```

---

## Shared Patterns

### Browser Connection (Remote)
**Source:** `src/lib/browser.ts`
**Apply to:** All LinkedIn automation services
```typescript
export async function connectToBrowserless(maxRetries: number = 5): Promise<Browser> {
    const { chromium: baseChromium } = await import('playwright-core');
    const { addExtra } = await import('playwright-extra');
    const { default: StealthPlugin } = await import('puppeteer-extra-plugin-stealth');
    
    const chromium = addExtra(baseChromium);
    chromium.use(StealthPlugin());
    
    // ... retry logic using connectOverCDP(process.env.BROWSERLESS_WSS)
}
```

### Error Reporting (Screenshots)
**Source:** `src/lib/linkedin/outreach.ts`
**Apply to:** All automation scripts
```typescript
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const screenshotPath = path.join(logsDir, `linkedin-error-${timestamp}.png`);
// ...
} catch (error: any) {
    await page.screenshot({ path: screenshotPath }).catch(() => {});
    return { success: false, error: error.message, screenshot: screenshotPath };
}
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/linkedin/selectors.ts` | config | static | First implementation of centralized selectors. |

## Metadata

**Analog search scope:** `src/lib/browser.ts`, `src/lib/linkedin/*.ts`, `src/app/api/linkedin/**/*.ts`, `scripts/*.ts`
**Files scanned:** ~15
**Pattern extraction date:** 2025-04-04
