# Phase 1: Technical Foundation - Research

**Researched:** 2024-05-23
**Domain:** Full-stack SaaS Infrastructure
**Confidence:** HIGH

## <user_constraints>
## User Constraints (from CONTEXT.md/REQUIREMENTS.md)

### Locked Decisions
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Database/Auth:** Supabase (Postgres, Auth, Edge Functions)
- **Payments:** Stripe ($500/mo subscription)
- **UI:** Tailwind + shadcn/ui (AdminDek style)

### Claude's Discretion
- Database schema specifics (indexes, constraints)
- Folder structure for Next.js 15
- Specific Supabase Auth implementation details (PKCE flow)

### Deferred Ideas (OUT OF SCOPE)
- Advanced analytics dashboard (Phase 2+)
- Multi-channel n8n workflows (Phase 3)
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | Web Framework | App Router support, React 19 features |
| @supabase/ssr | Latest | Auth/Database | Official utility for Next.js SSR/App Router |
| stripe | Latest | Payments | Industry standard for SaaS billing |
| lucide-react | Latest | Icons | Clean, professional icons for AdminDek style |

### Installation
```bash
npx create-next-app@latest . --typescript --tailwind --eslint
npm install @supabase/ssr @supabase/supabase-js stripe
npx shadcn-ui@latest init
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/              # App Router (Next.js 15)
│   ├── (auth)/       # Auth group (login, signup)
│   ├── (dashboard)/  # Protected dashboard routes
│   └── api/          # Route handlers (Stripe webhooks)
├── components/       # UI components (shadcn)
├── lib/              # Supabase/Stripe clients
│   ├── supabase/     # server.ts, client.ts, middleware.ts
│   └── stripe.ts     # Stripe server-side config
└── types/            # Database definitions (generated)
```

### Pattern 1: Supabase SSR Auth
**What:** Using `@supabase/ssr` to manage cookies for auth sessions in Server Components.
**Example:**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
    },
  })
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth UI | Custom forms | shadcn + Supabase Auth | Security, speed, pre-built validation |
| Billing Portal | Custom UI | Stripe Billing Portal | Handles plan changes/cancellations automatically |
| Table Management | Native HTML | TanStack Table | Sorting/Filtering needed for 5000+ leads |

## Common Pitfalls

### Pitfall 1: Next.js 15 Params
**What goes wrong:** Accessing `params` or `searchParams` synchronously in page components.
**How to avoid:** Always `await params` in Page/Layout components as they are now Promises in Next.js 15.

### Pitfall 2: Stripe Webhook Security
**What goes wrong:** Accepting webhook events without signature verification.
**How to avoid:** Use `stripe.webhooks.constructEvent` with the `STRIPE_WEBHOOK_SECRET`.

## Code Examples

### Database Schema (SQL)
```sql
-- Profiles table linked to Auth
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  stripe_customer_id TEXT,
  usage_count INT DEFAULT 0
);

-- Leads table with RLS
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  email TEXT,
  company TEXT,
  status TEXT DEFAULT 'New',
  region TEXT
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own leads" ON public.leads FOR ALL USING (auth.uid() = user_id);
```

### Ready for Planning
Research complete. Infrastructure setup can proceed.
