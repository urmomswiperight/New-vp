# LinkedIn Auth State Management (Vercel + Browserless)

If you are seeing `PROFILE_NOT_LOADED`, `AUTHWALL`, or `SESSION_INVALID`, it means LinkedIn is blocking your session. **Single cookies like `li_at` are no longer enough for stable automation.**

## LinkedIn Session Resiliency (2025)

In 2025, LinkedIn security has increased. Stable automation now requires a full `storageState` JSON including CSRF tokens (`JSESSIONID`) and browser persistence metadata.

### ⚠️ Security Warning
**NEVER share your session JSON with anyone.** It contains full access to your LinkedIn account. Treat it as a master password.

### Step 1: Extract your Full Session JSON
The most reliable way is to use a Playwright-compatible `storageState.json`.

1.  **Using Cookie-Editor (Chrome/Edge Extension):**
    *   Log in to LinkedIn.
    *   Open **Cookie-Editor**.
    *   Click **Export** -> **JSON**.
    *   Wrap this array in a `cookies` object: `{"cookies": [PASTE_HERE]}`.

2.  **Using Playwright (Recommended for Devs):**
    *   Run `npx playwright codegen --save-storage=auth.json https://linkedin.com`
    *   Log in and close the browser.
    *   Copy the contents of `auth.json`.

### Step 2: Set the `LI_SESSION` Environment Variable
1.  Open your `.env.local` or **Vercel Dashboard** settings.
2.  Add or update:
    *   **Key:** `LI_SESSION`
    *   **Value:** Paste the full JSON string.
3.  **Redeploy** or restart your local server.

## Understanding Health Check States

The system performs a mandatory health check before every interaction:

*   **LOGGED_IN:** Everything is fine. The automation proceeds.
*   **LOGGED_OUT:** Your session has expired or the cookies are invalid. Refresh your `LI_SESSION`.
*   **CHALLENGED:** LinkedIn has detected suspicious activity and is showing a **CAPTCHA** or **Security Check**.
    *   **How to fix:** Open LinkedIn in your browser on the same IP as your automation (if possible) and solve the captcha manually. If using Browserless, you may need to use their "Debugger" UI to solve it in real-time.

## Required Environment Variables

Ensure these are set in Vercel:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `LI_SESSION` | **Full JSON Session (Recommended)** | `{"cookies": [...]}` |
| `DATABASE_URL` | Postgres Connection String | `postgres://...` |
| `BROWSERLESS_WSS` | Browserless WebSocket URL | `wss://...` |
| `OUTREACH_SECRET` | API Security Password | `your_secret_here` |

## Tips for Avoiding Blocks
*   **Human-like Delays:** The system now types messages with randomized speeds (40-100ms per char).
*   **Role-Based Selectors:** We use ARIA roles instead of CSS classes, making the automation invisible to many simple detection scripts and resilient to UI updates.
*   **Daily Limits:** Stick to under 25 connections per day per account.
