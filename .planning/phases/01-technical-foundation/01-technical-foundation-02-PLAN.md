---
phase: 01-technical-foundation
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - "prisma/schema.prisma"
  - ".env.local"
  - "package.json"
  - "package-lock.json"
autonomous: true
requirements:
  - "FOUND-02"
  - "FOUND-03"

user_setup:
  - service: "Supabase"
    why: "The project requires a database and authentication backend."
    env_vars:
      - name: "NEXT_PUBLIC_SUPABASE_URL"
        source: "Supabase Project Dashboard -> Settings -> API -> Project URL"
      - name: "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        source: "Supabase Project Dashboard -> Settings -> API -> Project API Keys -> anon (public)"
      - name: "DATABASE_URL"
        source: "Supabase Project Dashboard -> Settings -> Database -> Connection string (use the one for Prisma)"
    dashboard_config:
      - task: "Create a new project in Supabase."
        location: "https://app.supabase.com/"
      - task: "Disable email confirmations for development."
        location: "Supabase Project Dashboard -> Authentication -> Providers -> Email -> disable 'Confirm email'"

must_haves:
  truths:
    - "The Prisma schema successfully syncs with the Supabase database."
    - "The `users`, `leads`, `campaigns`, and `subscriptions` tables exist in the Supabase database after the plan is executed."
  artifacts:
    - path: "prisma/schema.prisma"
      provides: "The data models for the entire application."
      contains: ["model User", "model Lead", "model Campaign", "model Subscription"]
    - path: ".env.local"
      provides: "Connection strings and keys for Supabase."
      contains: ["DATABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
  key_links:
    - from: "prisma/schema.prisma"
      to: "DATABASE_URL in .env.local"
      via: "Prisma CLI (`db push`)"
      pattern: "datasource db"
---

<objective>
Set up the Supabase project, define the application's database schema using Prisma, and synchronize it with the Supabase Postgres database.

Purpose: To create the persistence layer for the application, defining the data structures for users, leads, campaigns, and subscriptions.
Output: A configured Prisma setup and live database tables in the Supabase project.
</objective>

<execution_context>
@C:/Users/mikiy/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/mikiy/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/research/01-technical-foundation.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Database & Auth Dependencies</name>
  <files>
    - "package.json"
    - "package-lock.json"
  </files>
  <action>
    Install Prisma for database ORM and the Supabase libraries needed for authentication and server-side interactions.
    
    Command: `npm install prisma @prisma/client @supabase/ssr @supabase/supabase-js`
    Command: `npm install -D prisma`
  </action>
  <verify>
    Run `npm list prisma` and `npm list @supabase/ssr`. Both should be listed in `package.json`.
  </verify>
  <done>
    All necessary database and auth libraries are installed.
  </done>
</task>

<task type="auto">
  <name>Task 2: Initialize Prisma</name>
  <files>
    - "prisma/schema.prisma"
    - ".env"
  </files>
  <action>
    Initialize Prisma in the project, which creates the `prisma` directory and a basic `schema.prisma` file. This sets up the foundation for defining the database models.
    
    Command: `npx prisma init --datasource-provider postgresql`
    
    Note: The command creates a `.env` file. We will use `.env.local` for credentials, which is standard for Next.js. The executor should move the `DATABASE_URL` variable to `.env.local`.
  </action>
  <verify>
    The directory `prisma` and the file `prisma/schema.prisma` exist.
  </verify>
  <done>
    Prisma is initialized and ready for schema definition.
  </done>
</task>

<task type="auto">
  <name>Task 3: Define Database Schema</name>
  <files>
    - "prisma/schema.prisma"
  </files>
  <action>
    Update `prisma/schema.prisma` to define the required tables: `User`, `Lead`, `Campaign`, and `Subscription`.

    The `User` model will be linked to Supabase's `auth.users` table. The other models will have relationships defined. Add indexes for frequently queried columns like `userId` and `email`.

    ```prisma
    // This is your Prisma schema file,
    // learn more about it in the docs: https://pris.ly/d/prisma-schema

    generator client {
      provider = "prisma-client-js"
    }

    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
      shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // Required for migrations
    }

    model User {
      id                       String         @id @default(uuid())
      email                    String?        @unique
      lemon_squeezy_customer_id String?        @unique
      usage_count              Int            @default(0)
      leads                    Lead[]
      campaigns                Campaign[]
      subscriptions            Subscription[]
    }

    // ... (Lead and Campaign models remain same)

    model Subscription {
      id                        String   @id @default(uuid())
      userId                    String   @unique
      user                      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
      lemon_squeezy_id          String   @unique
      variant_id                String
      status                    SubscriptionStatus
      current_period_end        DateTime
      createdAt                 DateTime @default(now())
      updatedAt                 DateTime @updatedAt
    }
    ```
    Note: The schema provided here uses Prisma's `User` model and doesn't directly link to `auth.users` via a relation. This is a common pattern to decouple the application's user profile from the auth provider's user table. We will associate them using the `id` (which will be the same UUID from `auth.users`).
  </action>
  <verify>
    The content of `prisma/schema.prisma` matches the provided schema definition.
  </verify>
  <done>
    The application's data models are fully defined in the Prisma schema.
  </done>
</task>

<task type="auto">
  <name>Task 4: Sync Schema with Supabase</name>
  <files>
    - "prisma/schema.prisma"
  </files>
  <action>
    Push the local Prisma schema to the Supabase database. This command will create the tables, columns, and indexes defined in `schema.prisma`. This is preferred over migrations for initial setup.
    
    Ensure `DATABASE_URL` is correctly set in `.env.local` before running.
    
    Command: `npx prisma db push --accept-data-loss` 
    (The `--accept-data-loss` flag is safe here as this is the initial creation of the database).
  </action>
  <verify>
    Log in to the Supabase dashboard and navigate to the "Table Editor". The `User`, `Lead`, `Campaign`, and `Subscription` tables should be present with the correct columns.
  </verify>
  <done>
    The Supabase database schema is synchronized with the Prisma schema definition.
  </done>
</task>

</tasks>

<verification>
1.  Ensure the `.env.local` file is populated with the correct Supabase credentials from the `user_setup` section.
2.  Run `npx prisma db push`. The command should complete successfully without any authentication or connection errors.
3.  Open the Supabase Project Dashboard, go to the Table Editor, and confirm that the `User`, `Lead`, `Campaign`, and `Subscription` tables exist with the columns defined in `prisma/schema.prisma`.
</verification>

<success_criteria>
- All database dependencies are installed.
- Prisma is configured to connect to the Supabase project.
- The database schema is defined and has been successfully pushed to the Supabase database, creating all necessary tables.
</success_criteria>

<output>
After completion, create `.planning/phases/01-technical-foundation/01-technical-foundation-02-SUMMARY.md`
</output>
