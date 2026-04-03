# LinkedIn Auth State Management (Vercel + Browserless)

If you are seeing `PROFILE_NOT_LOADED` or `AUTHWALL`, it means LinkedIn has logged out your session or is blocking the connection.

## How to Fix Auth Issues

### Option 1: Manual Session Sync (Most Reliable)
1.  **Run the local login script:**
    ```bash
    npm install
    npx ts-node scripts/linkedin-login.ts
    ```
2.  A browser window will open. **Log in to LinkedIn manually.**
3.  Once logged in, close the browser. This saves your session to `.playwright-sessions/`.
4.  **Transfer to Browserless:** Browserless sessions on Vercel are ephemeral. To keep them alive, you should periodically run a "keep-alive" or ensure your `BROWSERLESS_WSS` is connecting to a persistent instance if your plan supports it.

### Option 2: Browserless Dashboard Login
1.  Go to your [Browserless.io Debugger](https://browserless.io/debugger).
2.  Connect to your instance.
3.  Navigate to `linkedin.com/login` and log in.
4.  If your Browserless plan supports **"Persistent File System"**, your session will stay active.

## Required Environment Variables

Ensure these are set in Vercel:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Postgres Connection String | `postgres://user:pass@host:5432/db?sslmode=disable` |
| `BROWSERLESS_WSS` | Browserless WebSocket URL | `wss://chrome.browserless.io?token=YOUR_TOKEN` |
| `OUTREACH_SECRET` | API Security Password | `your_secret_here` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | `eyJhbG...` |

## Tips for Avoiding Blocks
*   **Limit Frequency:** Don't run the `check-inbox` more than once every 2 hours.
*   **Batching:** In n8n, process leads one by one with a 10-second delay.
*   **User Agents:** The system now rotates user agents automatically.
