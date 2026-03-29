# Phase 5: Billing & Final Polish - Research

**Researched:** 2024-05-24
**Domain:** Billing, Usage Limits, and Final Polish
**Confidence:** MEDIUM

## Summary

This phase focuses on finalizing the monetization and access control logic. The project currently has a dual-track billing approach: a manual Fiverr-based verification system and a programmatic Lemon Squeezy integration. Usage tracking is partially implemented in `src/lib/usage.ts` but needs to be enforced across all functional API routes.

**Primary recommendation:** Consolidate usage checking into a single middleware or utility function and enforce it in both AI research and outreach API routes.

## User Constraints

### Locked Decisions
- **Usage Limit:** 5 uses or 7-day trial for free users.
- **Admin Bypass:** Specific user ID (from env) bypasses all limits.
- **Payment Methods:** Support for Fiverr manual payment and Lemon Squeezy (based on existing code).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@prisma/client` | latest | Database access | Used for checking subscription status and usage counts. |
| `@lemonsqueezy/lemonsqueezy.js` | latest | Subscription management | Handles automated billing. |

## Architecture Patterns

### Usage Enforcement Pattern
The current `checkUsageLimit` in `src/lib/usage.ts` should be the source of truth. It checks for:
1. Admin bypass via `ADMIN_USER_ID`.
2. Active subscription status in the `Subscription` table.
3. `usage_count` vs `USAGE_LIMIT`.

**Missing:** The 7-day trial logic (checking user age).

### Recommended API Guard Pattern
```typescript
const { allowed, message } = await checkUsageLimit(user.id);
if (!allowed) {
  return NextResponse.json({ error: message || 'Usage limit exceeded' }, { status: 403 });
}
// ... execute logic
await incrementUsage(user.id);
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Subscription Management | Custom billing logic | Lemon Squeezy / Stripe | Handling taxes, renewals, and webhooks is complex. |

## Common Pitfalls

### Pitfall 1: Race Conditions in Usage Tracking
**What goes wrong:** Multiple rapid API calls might bypass the limit if the count isn't updated atomically.
**How to avoid:** Use Prisma's atomic `increment` (already in `incrementUsage`) and ensure the check happens before the expensive operation.

### Pitfall 2: Desynchronized Subscription Status
**What goes wrong:** User pays but status remains `inactive`.
**How to avoid:** Robust webhook handling for Lemon Squeezy and a clear "Pending" UI for manual Fiverr orders.

## Code Examples

### Enforcing in Research API
```typescript
// src/app/api/research/summarize/route.ts
const { allowed } = await checkUsageLimit(user.id);
if (!allowed) return NextResponse.json({ error: "Limit reached" }, { status: 403 });

// After successful n8n call:
await incrementUsage(user.id);
```

## Open Questions

1. **Which billing provider takes priority?** The billing page shows Fiverr, but `api/billing/checkout` exists for Lemon Squeezy.
2. **7-Day Trial:** How should the 7-day trial be calculated if the user hasn't used all 5 credits? (Likely: `allowed = usage < 5 && daysSinceJoin < 7`).

## Sources

### Primary (HIGH confidence)
- `src/lib/usage.ts` - Existing usage logic.
- `prisma/schema.prisma` - Subscription and User models.
- `src/app/dashboard/billing/page.tsx` - Current billing UI.
- `src/app/api/research/summarize/route.ts` - Target for enforcement.
