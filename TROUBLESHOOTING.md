# LinkedIn Auth State Management (Vercel + Browserless)

If you are seeing `PROFILE_NOT_LOADED`, `AUTHWALL`, or `SESSION_INVALID`, it means LinkedIn is blocking your session. **Single cookies like `li_at` are no longer enough for stable automation.**

## How to Fix Auth Issues (The "Full Session" Method)

To bypass LinkedIn's advanced security, we now use a "Full Session" injection.

### Step 1: Extract your Full Session JSON
1.  Open Chrome/Edge and log in to LinkedIn.
2.  Install the **"EditThisCookie"** extension or similar.
3.  Click the extension icon while on LinkedIn, click **Export**, and it will copy your cookies to your clipboard.
4.  **Alternatively (Better):** Use Playwright to capture it:
    ```bash
    npx ts-node scripts/linkedin-login.ts
    ```
    Wait for it to open, log in, then close it. Now, you need to convert `.playwright-sessions/` into a JSON string. (We will provide a script for this soon).

### Step 2: Set the `LI_SESSION` Environment Variable
1.  Go to your **Vercel Dashboard** -> Settings -> Environment Variables.
2.  Add a new variable:
    *   **Key:** `LI_SESSION`
    *   **Value:** Paste the JSON string of your cookies. It should look like `{"cookies": [...], "origins": [...]}`.
3.  **Redeploy** your Vercel app.

## Required Environment Variables

Ensure these are set in Vercel:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `LI_SESSION` | **Full JSON Session (Recommended)** | `{"cookies": [...]}` |
| `LI_AT` | Legacy single cookie (Backup) | `AQED...` |
| `DATABASE_URL` | Postgres Connection String | `postgres://...` |
| `BROWSERLESS_WSS` | Browserless WebSocket URL | `wss://...` |
| `OUTREACH_SECRET` | API Security Password | `your_secret_here` |

## Tips for Avoiding Blocks
*   **Batching:** In n8n, process leads **one by one** with a **15-second delay**.
*   **Health Check:** The system now automatically checks your session health before every task. If it's invalid, it won't burn your lead credits.
