---
phase: 01-technical-foundation
plan: 3
type: execute
wave: 2
depends_on:
  - "01-technical-foundation-01"
  - "01-technical-foundation-02"
files_modified:
  - "src/lib/supabase/server.ts"
  - "src/lib/supabase/client.ts"
  - "src/lib/supabase/middleware.ts"
  - "src/middleware.ts"
  - "src/app/(auth)/login/page.tsx"
  - "src/app/(auth)/signup/page.tsx"
  - "src/app/auth/callback/route.ts"
  - "src/app/dashboard/page.tsx"
  - ".env.local"
autonomous: true
requirements:
  - "FOUND-04"

user_setup:
  - service: "Google Cloud & Supabase"
    why: "To enable Google OAuth, a Google Cloud project must be configured and its credentials provided to Supabase."
    env_vars:
      - name: "NEXT_PUBLIC_GOOGLE_CLIENT_ID"
        source: "Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client IDs"
      - name: "GOOGLE_CLIENT_SECRET"
        source: "Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client IDs"
    dashboard_config:
      - task: "Create an OAuth 2.0 Client ID in the Google Cloud Console."
        location: "https://console.cloud.google.com/"
        details: "Set the authorized redirect URI to `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`"
      - task: "Enable the Google provider in Supabase."
        location: "Supabase Project Dashboard -> Authentication -> Providers -> Google"
        details: "Enter the Client ID and Client Secret from Google Cloud. Also enable 'Skip Nonce Check' for development."

must_haves:
  truths:
    - "A user can sign up using an email and password, and their data appears in `auth.users` and our public `User` table."
    - "A user can sign in using a Google account."
    - "A logged-in user can access `/dashboard`."
    - "A logged-out user attempting to access `/dashboard` is redirected to `/login`."
  artifacts:
    - path: "src/lib/supabase/middleware.ts"
      provides: "Auth middleware for protecting routes."
    - path: "src/app/(auth)/login/page.tsx"
      provides: "The UI for email/password and Google login."
    - path: "src/app/auth/callback/route.ts"
      provides: "The server-side handler for the OAuth callback from Supabase."
    - path: "src/app/dashboard/page.tsx"
      provides: "A sample protected page that only authenticated users can see."
  key_links:
    - from: "src/middleware.ts"
      to: "src/lib/supabase/middleware.ts"
      via: "Supabase SSR update function"
      pattern: "supabase.auth.getSession"
    - from: "Login Page UI"
      to: "Supabase JS Client"
      via: "signInWithPassword() or signInWithOAuth()"
      pattern: "supabase.auth.signIn"
---

<objective>
Implement a complete authentication system using Supabase Auth, supporting both email/password and Google OAuth providers.

Purpose: To secure the application, manage user identity, and provide the foundation for user-specific data and features.
Output: A fully functional authentication flow with login/signup pages, protected routes, and OAuth integration.
</objective>

<execution_context>
@C:/Users/mikiy/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/mikiy/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/research/01-technical-foundation.md
@.planning/phases/01-technical-foundation/01-technical-foundation-01-SUMMARY.md
@.planning/phases/01-technical-foundation/01-technical-foundation-02-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Supabase SSR Clients and Middleware</name>
  <files>
    - "src/lib/supabase/client.ts"
    - "src/lib/supabase/server.ts"
    - "src/lib/supabase/middleware.ts"
    - "src/middleware.ts"
    - ".env.local"
  </files>
  <action>
    Set up the Supabase SSR clients for use in Client Components, Server Components, and Middleware, following the official `@supabase/ssr` patterns from the research.

    1.  **Create `src/lib/supabase/client.ts`** for the browser client.
    2.  **Create `src/lib/supabase/server.ts`** for server-side actions.
    3.  **Create `src/lib/supabase/middleware.ts`** for handling sessions in middleware.
    4.  **Create `src/middleware.ts`** in the root of the `src` directory to protect routes. It will protect the `/dashboard` route and all sub-routes.
    5.  Populate `.env.local` with the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` variables from the user setup in Plan 02.
  </action>
  <verify>
    The four files exist with the correct code patterns from `@supabase/ssr` documentation. The middleware should successfully read Supabase environment variables.
  </verify>
  <done>
    Supabase clients and auth middleware are configured for the application.
  </done>
</task>

<task type="auto">
  <name>Task 2: Implement OAuth Callback Route</name>
  <files>
    - "src/app/auth/callback/route.ts"
  </files>
  <action>
    Create the API route handler that Supabase redirects to after a successful OAuth login. This handler exchanges the auth code for a user session and then redirects the user to the dashboard.
    
    This route will use the server-side Supabase client to complete the authentication flow.
  </action>
  <verify>
    The file `src/app/auth/callback/route.ts` exists and contains the logic to call `supabase.auth.exchangeCodeForSession()`.
  </verify>
  <done>
    The application can handle OAuth callbacks from Supabase.
  </done>
</task>

<task type="auto">
  <name>Task 3: Build Login and Signup UI</name>
  <files>
    - "src/app/(auth)/login/page.tsx"
    - "src/app/(auth)/signup/page.tsx"
    - "src/components/ui/input.tsx"
    - "src/components/ui/label.tsx"
    - "src/components/ui/card.tsx"
  </files>
  <action>
    Create the user-facing pages for login and signup.

    1. Add the necessary shadcn/ui components: `npx shadcn-ui@latest add input label card`
    2. Create a route group `(auth)` for these pages.
    3. Build a form for email/password signup/login on the respective pages.
    4. Add a "Sign in with Google" button that triggers the `signInWithOAuth` function from the Supabase client.
    5. These should be client components (`'use client'`) to handle user interaction and form state.
  </action>
  <verify>
    Navigate to `/login` and `/signup`. Both pages should render a form with fields for email/password and a Google login button.
  </verify>
  <done>
    UI for user authentication is complete.
  </done>
</task>

<task type="auto">
  <name>Task 4: Create Protected Page and Test Flow</name>
  <files>
    - "src/app/dashboard/page.tsx"
  </files>
  <action>
    Create a simple dashboard page that is protected by the middleware. This page will display the logged-in user's email and a logout button.

    1. Create the file `src/app/dashboard/page.tsx`.
    2. Use the server-side Supabase client to fetch the user session. If no user, the middleware should have already redirected them.
    3. Display the user's email: `user.email`.
    4. Add a logout button that calls `supabase.auth.signOut()` and redirects to `/`.
  </action>
  <verify>
    1. Attempt to access `/dashboard` while logged out. You should be redirected to `/login`.
    2. Log in. You should be redirected to `/dashboard`.
    3. The dashboard should display your email.
    4. Click logout. You should be returned to the home page.
  </verify>
  <done>
    The end-to-end authentication flow is working and verifiable.
  </done>
</task>

</tasks>

<verification>
- **Email/Password Flow:**
  1. Go to `/signup` and create an account.
  2. You should be redirected to `/dashboard` and see your email.
  3. Log out.
  4. Go to `/login` and sign in with the same credentials.
  5. You should be redirected to `/dashboard`.
- **Google OAuth Flow:**
  1. Go to `/login` and click "Sign in with Google".
  2. Complete the Google auth flow.
  3. You should be redirected to `/dashboard` and see your Google account email.
- **Protected Route:**
  1. While logged out, try to access `http://localhost:3000/dashboard`.
  2. Verify you are automatically redirected to `http://localhost:3000/login`.
</verification>

<success_criteria>
- Users can successfully sign up, log in, and log out using both email/password and Google OAuth.
- Protected routes are inaccessible to unauthenticated users.
- User session is correctly managed across server and client components.
</success_criteria>

<output>
After completion, create `.planning/phases/01-technical-foundation/01-technical-foundation-03-SUMMARY.md`
</output>
