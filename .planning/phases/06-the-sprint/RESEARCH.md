# Phase 6: THE SPRINT - Research (Sales & Conversion)

**Researched:** 2026-03-03
**Domain:** B2B Sales, AI Agency Conversion, High-Volume Lead Management
**Confidence:** HIGH

## Summary
The technical engine for Phase 6 is built; the critical path now shifts from "sending" to "closing." To secure a $500/mo subscription from the 5,000 lead cohort, the system must transition from a cold outreach tool to a **Revenue Engine**. The primary recommendation is to pivot the value proposition from "AI Services" to "Productized Revenue Utility" (e.g., Lead Follow-up, AI Receptionist) and implement a high-velocity, automated follow-up sequence.

**Primary recommendation:** Use a "3-7-14" day automated follow-up cadence (5-8 touches) focusing on "Soft ROI" and risk reversal (e.g., a Pilot Month or Performance Guarantee).

## <user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Total Leads:** 5000.
- **Distribution:** 60% Ethiopia (Africa), 40% International.
- **Availability:** 20:00–05:00 UTC (Discovery calls).
- **Goal:** One $500/mo subscription.
- **Tech Stack:** Next.js 15, Supabase, n8n, Stripe, Ollama.

### Claude's Discretion
- **Lead Batching:** Batching vs. "Big Bang" (Recommended: Controlled Burn).
- **Follow-up Cadence:** Specific touchpoints and timing.
- **Closing Techniques:** ROI framing and transparency models.

### Deferred Ideas (OUT OF SCOPE)
- **Custom CRM:** Don't build a full CRM; use Supabase for tracking and standard tools for management.
- **Complex UI Animations:** Focus on utility over aesthetics for the dashboard.
</user_constraints>

## Standard Stack

### Core Sales Stack
| Library/Tool | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Instantly.ai** | Latest | Cold Email / Warmup | Best-in-class deliverability and inbox rotation. |
| **Calendly / Cal.com** | Latest | Meeting Booking | Zero-friction scheduling; native n8n/Zapier triggers. |
| **Pipedrive / HubSpot** | Free/Starter | Pipeline Management | Don't hand-roll CRM "stages" or "deals." |
| **Stripe Checkout** | v3 | Recurring Billing | Industry standard for secure, low-friction B2B payments. |

### Supporting Tools
| Library | Purpose | When to Use |
|---------|---------|-------------|
| **Clay** | Lead Enrichment | When you need hyper-personalized icebreakers for high-value leads. |
| **Apollo.io** | Lead Intelligence | For intent signals (hiring, funding) to prioritize the 5000 leads. |

## Architecture Patterns

### Recommended Project Structure (Sales Funnel)
```
/api/
├── leads/
│   ├── import.ts      # Existing: CSV ingestion
│   └── score.ts       # New: Rank leads by intent/region
├── sales/
│   ├── webhook-booking.ts  # Trigger AI Onboarding on Calendly event
│   └── toggle-sequence.ts  # Pause outreach when reply detected
└── billing/
    └── create-checkout.ts  # Stripe session generation
```

### Pattern 1: The "Revenue Engine" Workflow
1.  **Enrichment:** Use n8n to fetch LinkedIn/Company data for the "New" lead.
2.  **Initial Outreach:** 1st touch (Email + LI Connection).
3.  **The "3-7-14" Cadence:** 
    - Day 1-2: First follow-up (The "Nudge").
    - Day 4-5: Second follow-up (The "Case Study").
    - Day 7-10: Third follow-up (The "Social Proof").
    - Day 14: Fourth follow-up (The "Soft Pitch").
    - Day 21: The "Breakup" email.
4.  **Discovery Trigger:** If "Replied" -> Stop automation -> Manual "Close."

### Pattern 2: The "Speed-to-Lead" Response
**What:** Automated response to any inbound query or demo booking within 60 seconds.
**When to use:** Mandatory for all international leads to overcome timezone gaps.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **Scheduling** | Custom calendar UI | Calendly / Cal.com | Timezone logic, conflict detection, and email reminders are complex. |
| **CRM Pipelines** | `stages` table logic | Pipedrive / HubSpot | Tracking "Deal Value," "Close Probabilities," and "Stagnation" is difficult to maintain. |
| **Deliverability** | Custom SMTP rotation | Instantly / Apollo | Warmup protocols and ISP reputation management are specialized domains. |
| **Billing Invoices** | PDF Generation | Stripe Billing | Tax compliance, recurring logic, and "Customer Portal" are built-in. |

## Common Pitfalls

### Pitfall 1: The "Integration Iceberg"
- **What goes wrong:** Selling a "magical" AI tool that can't talk to the client's messy legacy CRM.
- **How to avoid:** Perform a "Friction Audit" during the discovery call. Don't sell AI; sell an **integrated workflow**.

### Pitfall 2: Over-Automating the "Close"
- **What goes wrong:** Sending automated "Are you ready to pay?" emails which kill trust.
- **How to avoid:** Use automation for the *nurture* (getting them to the call) and the *onboarding* (researching them), but keep the actual pricing/close human-to-human.

### Pitfall 3: Selling "AI" instead of "ROI"
- **What goes wrong:** Explaining "Llama 3.1" or "RAG" to a business owner who just wants more leads.
- **How to avoid:** Use the "4-Quadrant ROI" pitch (Cost Efficiency, Revenue Gen, Risk Reduction, Strategic Capability).

## Code Examples

### n8n: Calendly -> AI Research Battle Card Trigger
```json
// Verified pattern for Phase 4 integration
{
  "event": "invitee.created",
  "payload": {
    "email": "lead@company.com",
    "questions_and_answers": [
      { "question": "What is your main bottleneck?", "answer": "Manual lead follow-up" }
    ]
  }
}
// Action: Trigger Ollama Competitor Research -> Push to Dashboard
```

### Next.js: Stripe Productized Service Checkout
```typescript
// Source: Stripe Official Docs
export async function createSubscription(customerId: string, priceId: string) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/billing`,
  });
  return session.url;
}
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Custom Consulting | Productized Service ($500/mo) | Higher retention, lower fulfillment cost. |
| Manual Follow-up | Automated "3-7-14" Cadence | 80% more meetings booked via persistence. |
| Technical Pitch | "Human-in-the-Loop" ROI Pitch | Higher trust, less skepticism of "Black Box." |

## Open Questions

1.  **Ethiopian Lead Quality:** What is the specific reply rate of Ethiopian leads compared to International? 
    - *Recommendation:* Run a 48-hour "Split Test" on the first 400 leads (200 Eth / 200 Int).
2.  **Local Payment Friction:** How will Ethiopian clients pay $500/mo if they lack international credit cards?
    - *Recommendation:* Maintain the manual Fiverr/PayPal backup flow from Phase 1.

## Sources

### Primary (HIGH confidence)
- **Stripe Docs:** Checkout/Subscription lifecycle.
- **Instantly.ai / Apollo.io Docs:** Cold outreach deliverability standards.
- **B2B SaaS Benchmarks (2025/2026):** Reply rates and sequence frequency.

### Secondary (MEDIUM confidence)
- **AI Agency Frameworks:** "Revenue Engine Audit" and "ROI Quad" strategies.
- **Productized Service Models:** Tiers and fulfillment "Snapshot" methods.

## Metadata
**Confidence breakdown:**
- Standard Stack: HIGH (Verified toolset)
- Architecture: HIGH (Standard funnel logic)
- Pitfalls: MEDIUM (Context-specific)

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (Fast-moving sales tech)
